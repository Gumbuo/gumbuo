using UnityEngine;
using UnityEngine.InputSystem;
using AlienArena.Combat;

namespace AlienArena.Player
{
    /// <summary>
    /// Main player controller handling movement and input.
    /// Ported from Godot player.gd (308 lines)
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private int playerNumber = 1;
        [SerializeField] private PlayerStats stats;

        [Header("References")]
        [SerializeField] private Transform modelTransform;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // Components
        private CharacterController characterController;
        private PlayerCombat combat;
        private PlayerHealth health;
        private Animator animator;

        // Input
        private PlayerInput playerInput;
        private InputAction moveAction;
        private InputAction aimAction;
        private InputAction shootAction;
        private InputAction meleeAction;

        // State
        private Vector3 moveDirection;
        private Vector3 facingDirection = Vector3.forward;
        private Vector3 aimDirection = Vector3.forward;
        private bool isMoving;
        private bool inputEnabled = true;

        // Animation parameters
        private static readonly int SpeedParam = Animator.StringToHash("Speed");
        private static readonly int DirectionXParam = Animator.StringToHash("DirectionX");
        private static readonly int DirectionYParam = Animator.StringToHash("DirectionY");

        public int PlayerNumber => playerNumber;
        public PlayerStats Stats => stats;
        public Vector3 FacingDirection => facingDirection;
        public Vector3 AimDirection => aimDirection;
        public bool IsMoving => isMoving;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            combat = GetComponent<PlayerCombat>();
            health = GetComponent<PlayerHealth>();
            animator = GetComponentInChildren<Animator>();
            playerInput = GetComponent<PlayerInput>();

            if (stats == null)
            {
                Debug.LogError($"PlayerController on {gameObject.name}: PlayerStats not assigned!");
            }
        }

        private void Start()
        {
            SetupInput();
        }

        private void OnEnable()
        {
            if (health != null)
            {
                health.OnDeath += HandleDeath;
            }
        }

        private void OnDisable()
        {
            if (health != null)
            {
                health.OnDeath -= HandleDeath;
            }
        }

        /// <summary>
        /// Set up input actions based on player number
        /// </summary>
        private void SetupInput()
        {
            if (playerInput == null)
            {
                Debug.LogWarning($"PlayerController on {gameObject.name}: PlayerInput component not found. Using legacy input.");
                return;
            }

            // Switch to the correct action map based on player number
            string actionMap = playerNumber == 1 ? "Player1" : "Player2";
            playerInput.SwitchCurrentActionMap(actionMap);

            // Get action references
            moveAction = playerInput.actions.FindAction("Move");
            aimAction = playerInput.actions.FindAction("Aim");
            shootAction = playerInput.actions.FindAction("Shoot");
            meleeAction = playerInput.actions.FindAction("Melee");

            // Subscribe to button events
            if (shootAction != null)
            {
                shootAction.performed += OnShootPerformed;
            }

            if (meleeAction != null)
            {
                meleeAction.performed += OnMeleePerformed;
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from input events
            if (shootAction != null)
            {
                shootAction.performed -= OnShootPerformed;
            }

            if (meleeAction != null)
            {
                meleeAction.performed -= OnMeleePerformed;
            }
        }

        private void Update()
        {
            if (!inputEnabled || health?.IsDead == true) return;

            HandleMovementInput();
            HandleAiming();
            UpdateAnimator();
        }

        private void FixedUpdate()
        {
            if (!inputEnabled || health?.IsDead == true) return;

            ApplyMovement();
        }

        /// <summary>
        /// Read movement input and calculate direction
        /// </summary>
        private void HandleMovementInput()
        {
            Vector2 input = Vector2.zero;

            if (moveAction != null)
            {
                input = moveAction.ReadValue<Vector2>();
            }
            else
            {
                // Fallback to legacy input for testing
                if (playerNumber == 1)
                {
                    input = new Vector2(
                        Input.GetAxisRaw("Horizontal"),
                        Input.GetAxisRaw("Vertical")
                    );
                }
                else
                {
                    // Arrow keys for player 2
                    float h = 0;
                    float v = 0;
                    if (Input.GetKey(KeyCode.LeftArrow)) h = -1;
                    if (Input.GetKey(KeyCode.RightArrow)) h = 1;
                    if (Input.GetKey(KeyCode.UpArrow)) v = 1;
                    if (Input.GetKey(KeyCode.DownArrow)) v = -1;
                    input = new Vector2(h, v);
                }
            }

            // Convert 2D input to 3D movement (XZ plane)
            moveDirection = new Vector3(input.x, 0, input.y).normalized;
            isMoving = moveDirection.magnitude > 0.1f;

            // Update facing direction when moving
            if (isMoving)
            {
                facingDirection = moveDirection;
            }
        }

        /// <summary>
        /// Handle aim direction (mouse for P1, keyboard direction for P2)
        /// </summary>
        private void HandleAiming()
        {
            if (playerNumber == 1)
            {
                // Player 1: Mouse aiming
                if (aimAction != null)
                {
                    Vector2 mousePos = aimAction.ReadValue<Vector2>();
                    UpdateAimFromScreenPosition(mousePos);
                }
                else
                {
                    // Fallback to legacy input
                    UpdateAimFromScreenPosition(Input.mousePosition);
                }
            }
            else
            {
                // Player 2: Aim in facing direction
                aimDirection = facingDirection;
            }
        }

        /// <summary>
        /// Convert screen position to world aim direction
        /// </summary>
        private void UpdateAimFromScreenPosition(Vector2 screenPos)
        {
            Camera cam = Camera.main;
            if (cam == null) return;

            // Raycast from camera through mouse position to ground plane
            Ray ray = cam.ScreenPointToRay(screenPos);
            Plane groundPlane = new Plane(Vector3.up, transform.position);

            if (groundPlane.Raycast(ray, out float distance))
            {
                Vector3 worldPoint = ray.GetPoint(distance);
                Vector3 direction = worldPoint - transform.position;
                direction.y = 0;

                if (direction.magnitude > 0.1f)
                {
                    aimDirection = direction.normalized;
                }
            }
        }

        /// <summary>
        /// Apply movement using CharacterController
        /// </summary>
        private void ApplyMovement()
        {
            if (stats == null) return;

            Vector3 velocity = moveDirection * stats.moveSpeed;

            // Apply gravity
            velocity.y = -9.81f;

            characterController.Move(velocity * Time.fixedDeltaTime);

            // Rotate model to face direction
            if (modelTransform != null && facingDirection != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(facingDirection);
                modelTransform.rotation = Quaternion.RotateTowards(
                    modelTransform.rotation,
                    targetRotation,
                    stats.rotationSpeed * Time.fixedDeltaTime
                );
            }
        }

        /// <summary>
        /// Update animator parameters
        /// </summary>
        private void UpdateAnimator()
        {
            if (animator == null) return;

            float speed = isMoving ? 1f : 0f;
            animator.SetFloat(SpeedParam, speed);

            // Set directional blend tree parameters
            animator.SetFloat(DirectionXParam, facingDirection.x);
            animator.SetFloat(DirectionYParam, facingDirection.z);
        }

        /// <summary>
        /// Input callback for shooting
        /// </summary>
        private void OnShootPerformed(InputAction.CallbackContext context)
        {
            if (!inputEnabled || health?.IsDead == true) return;
            combat?.TryRangedAttack(aimDirection);
        }

        /// <summary>
        /// Input callback for melee
        /// </summary>
        private void OnMeleePerformed(InputAction.CallbackContext context)
        {
            if (!inputEnabled || health?.IsDead == true) return;
            combat?.TryMeleeAttack();
        }

        /// <summary>
        /// Handle player death
        /// </summary>
        private void HandleDeath()
        {
            inputEnabled = false;
            moveDirection = Vector3.zero;
            isMoving = false;

            if (showDebugInfo)
            {
                Debug.Log($"Player {playerNumber} died!");
            }
        }

        /// <summary>
        /// Called when player respawns
        /// </summary>
        public void OnRespawn(Vector3 spawnPosition)
        {
            // Move to spawn position
            characterController.enabled = false;
            transform.position = spawnPosition;
            characterController.enabled = true;

            // Re-enable input
            inputEnabled = true;

            if (showDebugInfo)
            {
                Debug.Log($"Player {playerNumber} respawned at {spawnPosition}");
            }
        }

        /// <summary>
        /// Enable or disable player input
        /// </summary>
        public void SetInputEnabled(bool enabled)
        {
            inputEnabled = enabled;
        }
    }
}
