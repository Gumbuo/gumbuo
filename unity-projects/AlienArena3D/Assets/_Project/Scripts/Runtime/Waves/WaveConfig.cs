using UnityEngine;

namespace AlienArena.Waves
{
    /// <summary>
    /// ScriptableObject containing wave configuration for co-op mode.
    /// Create instances via Assets > Create > AlienArena > Wave Config
    /// </summary>
    [CreateAssetMenu(fileName = "WaveConfig", menuName = "AlienArena/Wave Config")]
    public class WaveConfig : ScriptableObject
    {
        [System.Serializable]
        public class Wave
        {
            [Tooltip("Number of enemies to spawn in this wave")]
            public int enemyCount;

            [Tooltip("Delay between spawning each enemy")]
            public float spawnDelay;

            [Tooltip("Enemy types that can spawn in this wave")]
            public GameObject[] enemyPrefabs;

            [Tooltip("Optional: override enemy stats for this wave")]
            public float healthMultiplier = 1.0f;
            public float damageMultiplier = 1.0f;
            public float speedMultiplier = 1.0f;
        }

        [Header("Wave Configuration")]
        [Tooltip("All waves in this configuration")]
        public Wave[] waves;

        [Header("Timing")]
        [Tooltip("Delay before the first wave starts")]
        public float initialDelay = 3.0f;

        [Tooltip("Delay between waves")]
        public float waveDelay = 5.0f;

        /// <summary>
        /// Initialize with default wave configuration matching Godot values
        /// </summary>
        private void OnEnable()
        {
            if (waves == null || waves.Length == 0)
            {
                InitializeDefaultWaves();
            }
        }

        [ContextMenu("Reset to Default Waves")]
        public void InitializeDefaultWaves()
        {
            waves = new Wave[]
            {
                new Wave { enemyCount = 3,  spawnDelay = 0.50f },
                new Wave { enemyCount = 4,  spawnDelay = 0.40f },
                new Wave { enemyCount = 5,  spawnDelay = 0.40f },
                new Wave { enemyCount = 6,  spawnDelay = 0.30f },
                new Wave { enemyCount = 7,  spawnDelay = 0.30f },
                new Wave { enemyCount = 8,  spawnDelay = 0.25f },
                new Wave { enemyCount = 9,  spawnDelay = 0.25f },
                new Wave { enemyCount = 10, spawnDelay = 0.20f },
                new Wave { enemyCount = 12, spawnDelay = 0.20f },
                new Wave { enemyCount = 15, spawnDelay = 0.15f }
            };
        }

        /// <summary>
        /// Get the total number of waves
        /// </summary>
        public int TotalWaves => waves?.Length ?? 0;

        /// <summary>
        /// Get a specific wave by index
        /// </summary>
        public Wave GetWave(int index)
        {
            if (waves == null || index < 0 || index >= waves.Length)
                return null;
            return waves[index];
        }
    }
}
