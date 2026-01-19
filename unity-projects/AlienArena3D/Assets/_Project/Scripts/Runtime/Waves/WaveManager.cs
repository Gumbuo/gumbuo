using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using AlienArena.Enemy;

namespace AlienArena.Waves
{
    /// <summary>
    /// Manages enemy wave spawning for co-op mode.
    /// Ported from Godot wave_manager.gd (119 lines)
    /// </summary>
    public class WaveManager : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private WaveConfig config;
        [SerializeField] private GameObject defaultEnemyPrefab;

        [Header("Spawn Points")]
        [SerializeField] private Transform[] spawnPoints;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // State
        private int currentWaveIndex = -1;
        private int enemiesSpawnedThisWave;
        private int enemiesAlive;
        private int totalKills;
        private bool waveInProgress;
        private bool allWavesComplete;

        // Object pool for enemies
        private List<GameObject> enemyPool = new List<GameObject>();

        // Events
        public event Action<int> OnWaveStarted;      // Wave number (1-indexed)
        public event Action<int> OnWaveCompleted;    // Wave number
        public event Action OnAllWavesCompleted;
        public event Action<int> OnEnemyKilled;      // Total kills
        public event Action<int> OnEnemiesAliveChanged;

        // Properties
        public int CurrentWave => currentWaveIndex + 1;
        public int TotalWaves => config != null ? config.TotalWaves : 0;
        public int EnemiesAlive => enemiesAlive;
        public int TotalKills => totalKills;
        public bool WaveInProgress => waveInProgress;
        public bool AllWavesComplete => allWavesComplete;

        private void Start()
        {
            if (config == null)
            {
                Debug.LogError("WaveManager: No WaveConfig assigned!");
                return;
            }

            StartCoroutine(StartFirstWave());
        }

        /// <summary>
        /// Start the first wave after initial delay
        /// </summary>
        private IEnumerator StartFirstWave()
        {
            yield return new WaitForSeconds(config.initialDelay);
            StartNextWave();
        }

        /// <summary>
        /// Start the next wave
        /// </summary>
        public void StartNextWave()
        {
            if (allWavesComplete) return;

            currentWaveIndex++;

            if (currentWaveIndex >= config.TotalWaves)
            {
                allWavesComplete = true;
                OnAllWavesCompleted?.Invoke();

                if (showDebugInfo)
                {
                    Debug.Log("All waves completed!");
                }
                return;
            }

            waveInProgress = true;
            enemiesSpawnedThisWave = 0;

            OnWaveStarted?.Invoke(CurrentWave);

            if (showDebugInfo)
            {
                Debug.Log($"Wave {CurrentWave} started!");
            }

            StartCoroutine(SpawnWaveEnemies());
        }

        /// <summary>
        /// Spawn enemies for the current wave
        /// </summary>
        private IEnumerator SpawnWaveEnemies()
        {
            WaveConfig.Wave wave = config.GetWave(currentWaveIndex);
            if (wave == null) yield break;

            int enemiesToSpawn = wave.enemyCount;

            for (int i = 0; i < enemiesToSpawn; i++)
            {
                SpawnEnemy(wave);
                enemiesSpawnedThisWave++;

                yield return new WaitForSeconds(wave.spawnDelay);
            }

            if (showDebugInfo)
            {
                Debug.Log($"Wave {CurrentWave}: All {enemiesToSpawn} enemies spawned");
            }
        }

        /// <summary>
        /// Spawn a single enemy
        /// </summary>
        private void SpawnEnemy(WaveConfig.Wave wave)
        {
            // Get spawn position
            Vector3 spawnPos = GetRandomSpawnPosition();

            // Get enemy prefab
            GameObject prefab = GetEnemyPrefab(wave);
            if (prefab == null) return;

            // Spawn or get from pool
            GameObject enemy = GetOrCreateEnemy(prefab, spawnPos);

            // Apply wave multipliers if any
            ApplyWaveMultipliers(enemy, wave);

            // Subscribe to death event
            EnemyHealth health = enemy.GetComponent<EnemyHealth>();
            if (health != null)
            {
                health.OnKilled += OnEnemyDeath;
            }

            enemiesAlive++;
            OnEnemiesAliveChanged?.Invoke(enemiesAlive);

            if (showDebugInfo)
            {
                Debug.Log($"Spawned enemy at {spawnPos}. Alive: {enemiesAlive}");
            }
        }

        /// <summary>
        /// Get a random spawn position from available spawn points
        /// </summary>
        private Vector3 GetRandomSpawnPosition()
        {
            if (spawnPoints == null || spawnPoints.Length == 0)
            {
                // Fallback: spawn at edge of arena
                float angle = UnityEngine.Random.Range(0f, 360f) * Mathf.Deg2Rad;
                float radius = 15f; // Arena edge
                return new Vector3(Mathf.Cos(angle) * radius, 0, Mathf.Sin(angle) * radius);
            }

            int index = UnityEngine.Random.Range(0, spawnPoints.Length);
            return spawnPoints[index].position;
        }

        /// <summary>
        /// Get enemy prefab for the wave
        /// </summary>
        private GameObject GetEnemyPrefab(WaveConfig.Wave wave)
        {
            if (wave.enemyPrefabs != null && wave.enemyPrefabs.Length > 0)
            {
                int index = UnityEngine.Random.Range(0, wave.enemyPrefabs.Length);
                return wave.enemyPrefabs[index];
            }

            return defaultEnemyPrefab;
        }

        /// <summary>
        /// Get enemy from pool or create new one
        /// </summary>
        private GameObject GetOrCreateEnemy(GameObject prefab, Vector3 position)
        {
            // Check pool for inactive enemy
            foreach (var pooled in enemyPool)
            {
                if (pooled != null && !pooled.activeInHierarchy)
                {
                    pooled.transform.position = position;
                    pooled.transform.rotation = Quaternion.identity;
                    pooled.SetActive(true);

                    // Reset enemy
                    EnemyController controller = pooled.GetComponent<EnemyController>();
                    if (controller != null)
                    {
                        controller.ResetEnemy();
                    }

                    return pooled;
                }
            }

            // Create new enemy
            GameObject enemy = Instantiate(prefab, position, Quaternion.identity);
            enemyPool.Add(enemy);
            return enemy;
        }

        /// <summary>
        /// Apply wave-specific stat multipliers
        /// </summary>
        private void ApplyWaveMultipliers(GameObject enemy, WaveConfig.Wave wave)
        {
            // For now, multipliers would require runtime stat modification
            // This could be expanded later
        }

        /// <summary>
        /// Called when an enemy dies
        /// </summary>
        private void OnEnemyDeath(GameObject killer)
        {
            enemiesAlive--;
            totalKills++;

            OnEnemyKilled?.Invoke(totalKills);
            OnEnemiesAliveChanged?.Invoke(enemiesAlive);

            if (showDebugInfo)
            {
                Debug.Log($"Enemy killed! Alive: {enemiesAlive}, Total kills: {totalKills}");
            }

            // Check if wave is complete
            if (enemiesAlive <= 0 && enemiesSpawnedThisWave >= config.GetWave(currentWaveIndex).enemyCount)
            {
                OnWaveComplete();
            }
        }

        /// <summary>
        /// Called when all enemies in the wave are dead
        /// </summary>
        private void OnWaveComplete()
        {
            waveInProgress = false;
            OnWaveCompleted?.Invoke(CurrentWave);

            if (showDebugInfo)
            {
                Debug.Log($"Wave {CurrentWave} completed!");
            }

            // Start next wave after delay
            if (currentWaveIndex + 1 < config.TotalWaves)
            {
                StartCoroutine(StartNextWaveDelayed());
            }
            else
            {
                allWavesComplete = true;
                OnAllWavesCompleted?.Invoke();
            }
        }

        /// <summary>
        /// Start next wave after delay
        /// </summary>
        private IEnumerator StartNextWaveDelayed()
        {
            yield return new WaitForSeconds(config.waveDelay);
            StartNextWave();
        }

        /// <summary>
        /// Reset the wave manager (for restart)
        /// </summary>
        public void ResetWaves()
        {
            StopAllCoroutines();

            currentWaveIndex = -1;
            enemiesSpawnedThisWave = 0;
            enemiesAlive = 0;
            totalKills = 0;
            waveInProgress = false;
            allWavesComplete = false;

            // Deactivate all pooled enemies
            foreach (var enemy in enemyPool)
            {
                if (enemy != null)
                {
                    enemy.SetActive(false);
                }
            }

            StartCoroutine(StartFirstWave());
        }
    }
}
