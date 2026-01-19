using System;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem;
using AlienArena.Player;
using AlienArena.Waves;

namespace AlienArena.Core
{
    /// <summary>
    /// Central game manager handling game state, players, and scene management.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        [Header("Players")]
        [SerializeField] private PlayerController player1;
        [SerializeField] private PlayerController player2;

        [Header("Managers")]
        [SerializeField] private WaveManager waveManager;

        [Header("UI References")]
        [SerializeField] private GameObject pauseMenuUI;
        [SerializeField] private GameObject gameOverUI;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // Singleton
        public static GameManager Instance { get; private set; }

        // State
        private GameState currentState = GameState.Playing;
        private bool isPaused;

        // Input
        private PlayerInput uiInput;
        private InputAction pauseAction;
        private InputAction restartAction;

        // Events
        public event Action<GameState> OnGameStateChanged;
        public event Action OnGamePaused;
        public event Action OnGameResumed;
        public event Action OnGameOver;
        public event Action OnGameRestart;

        // Properties
        public PlayerController Player1 => player1;
        public PlayerController Player2 => player2;
        public GameState CurrentState => currentState;
        public bool IsPaused => isPaused;

        private void Awake()
        {
            // Singleton setup
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            // Find players if not assigned
            if (player1 == null || player2 == null)
            {
                FindPlayers();
            }

            SetupInput();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }

            CleanupInput();
        }

        /// <summary>
        /// Find player controllers in scene
        /// </summary>
        private void FindPlayers()
        {
            var players = FindObjectsOfType<PlayerController>();
            foreach (var player in players)
            {
                if (player.PlayerNumber == 1)
                    player1 = player;
                else if (player.PlayerNumber == 2)
                    player2 = player;
            }
        }

        /// <summary>
        /// Setup UI input actions
        /// </summary>
        private void SetupInput()
        {
            uiInput = GetComponent<PlayerInput>();
            if (uiInput != null)
            {
                pauseAction = uiInput.actions.FindAction("Pause");
                restartAction = uiInput.actions.FindAction("Restart");

                if (pauseAction != null)
                    pauseAction.performed += OnPausePressed;

                if (restartAction != null)
                    restartAction.performed += OnRestartPressed;
            }
        }

        /// <summary>
        /// Cleanup input subscriptions
        /// </summary>
        private void CleanupInput()
        {
            if (pauseAction != null)
                pauseAction.performed -= OnPausePressed;

            if (restartAction != null)
                restartAction.performed -= OnRestartPressed;
        }

        private void Update()
        {
            // Fallback input handling (legacy)
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                TogglePause();
            }

            if (Input.GetKeyDown(KeyCode.R))
            {
                RestartGame();
            }
        }

        /// <summary>
        /// Pause input callback
        /// </summary>
        private void OnPausePressed(InputAction.CallbackContext context)
        {
            TogglePause();
        }

        /// <summary>
        /// Restart input callback
        /// </summary>
        private void OnRestartPressed(InputAction.CallbackContext context)
        {
            RestartGame();
        }

        /// <summary>
        /// Toggle pause state
        /// </summary>
        public void TogglePause()
        {
            if (isPaused)
                ResumeGame();
            else
                PauseGame();
        }

        /// <summary>
        /// Pause the game
        /// </summary>
        public void PauseGame()
        {
            if (currentState == GameState.GameOver) return;

            isPaused = true;
            Time.timeScale = 0f;

            if (pauseMenuUI != null)
                pauseMenuUI.SetActive(true);

            SetState(GameState.Paused);
            OnGamePaused?.Invoke();

            if (showDebugInfo)
                Debug.Log("Game Paused");
        }

        /// <summary>
        /// Resume the game
        /// </summary>
        public void ResumeGame()
        {
            isPaused = false;
            Time.timeScale = 1f;

            if (pauseMenuUI != null)
                pauseMenuUI.SetActive(false);

            SetState(GameState.Playing);
            OnGameResumed?.Invoke();

            if (showDebugInfo)
                Debug.Log("Game Resumed");
        }

        /// <summary>
        /// Restart the current game
        /// </summary>
        public void RestartGame()
        {
            Time.timeScale = 1f;
            isPaused = false;

            OnGameRestart?.Invoke();

            // Reload current scene
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);

            if (showDebugInfo)
                Debug.Log("Game Restarted");
        }

        /// <summary>
        /// Trigger game over state
        /// </summary>
        public void TriggerGameOver(bool playersWon)
        {
            SetState(GameState.GameOver);

            if (gameOverUI != null)
                gameOverUI.SetActive(true);

            OnGameOver?.Invoke();

            if (showDebugInfo)
                Debug.Log($"Game Over - Players {(playersWon ? "Won" : "Lost")}");
        }

        /// <summary>
        /// Load a specific scene
        /// </summary>
        public void LoadScene(string sceneName)
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(sceneName);
        }

        /// <summary>
        /// Load main menu
        /// </summary>
        public void LoadMainMenu()
        {
            LoadScene("MainMenu");
        }

        /// <summary>
        /// Set game state
        /// </summary>
        private void SetState(GameState newState)
        {
            if (currentState == newState) return;

            currentState = newState;
            OnGameStateChanged?.Invoke(currentState);

            if (showDebugInfo)
                Debug.Log($"Game State: {currentState}");
        }

        /// <summary>
        /// Check if both players are dead
        /// </summary>
        public bool AreBothPlayersDead()
        {
            bool p1Dead = player1 == null || player1.GetComponent<PlayerHealth>()?.IsDead == true;
            bool p2Dead = player2 == null || player2.GetComponent<PlayerHealth>()?.IsDead == true;
            return p1Dead && p2Dead;
        }

        /// <summary>
        /// Quit the application
        /// </summary>
        public void QuitGame()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }

    /// <summary>
    /// Game state enum
    /// </summary>
    public enum GameState
    {
        MainMenu,
        Playing,
        Paused,
        GameOver
    }
}
