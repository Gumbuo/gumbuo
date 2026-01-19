using System;
using System.Collections;
using UnityEngine;
using AlienArena.Combat;

namespace AlienArena.Player
{
    /// <summary>
    /// Player-specific health component with respawn logic.
    /// Ported from Godot player.gd health logic.
    /// </summary>
    public class PlayerHealth : Health
    {
        [Header("Player Configuration")]
        [SerializeField] private PlayerStats stats;

        [Header("Respawn")]
        [SerializeField] private bool canRespawn = true;

        // Components
        private PlayerController controller;

        // Events
        public event Action OnRespawnStarted;
        public event Action OnRespawnComplete;

        public override int MaxHealth => stats != null ? stats.maxHealth : 100;

        protected override void Awake()
        {
            base.Awake();
            controller = GetComponent<PlayerController>();

            if (stats == null && controller != null)
            {
                stats = controller.Stats;
            }
        }

        /// <summary>
        /// Handle player death with respawn
        /// </summary>
        protected override void HandleDeath(GameObject killer)
        {
            // Disable player visuals/collision temporarily
            DisablePlayerVisuals();

            if (canRespawn)
            {
                StartCoroutine(RespawnSequence());
            }
        }

        /// <summary>
        /// Respawn the player after delay
        /// </summary>
        private IEnumerator RespawnSequence()
        {
            OnRespawnStarted?.Invoke();

            // Wait for respawn delay
            float delay = stats != null ? stats.respawnDelay : 2.0f;
            yield return new WaitForSeconds(delay);

            // Get spawn position
            Vector3 spawnPos = GetSpawnPosition();

            // Reset health
            Initialize();

            // Enable visuals
            EnablePlayerVisuals();

            // Notify controller
            if (controller != null)
            {
                controller.OnRespawn(spawnPos);
            }

            OnRespawnComplete?.Invoke();

            if (showDebugInfo)
            {
                Debug.Log($"Player respawned at {spawnPos}");
            }
        }

        /// <summary>
        /// Get a spawn position for the player
        /// </summary>
        private Vector3 GetSpawnPosition()
        {
            if (stats != null && stats.spawnPositions != null && stats.spawnPositions.Length > 0)
            {
                // Return random spawn position
                int index = UnityEngine.Random.Range(0, stats.spawnPositions.Length);
                return stats.spawnPositions[index];
            }

            // Default to current position
            return transform.position;
        }

        /// <summary>
        /// Disable player visuals during death
        /// </summary>
        private void DisablePlayerVisuals()
        {
            foreach (var rend in renderers)
            {
                if (rend != null)
                {
                    rend.enabled = false;
                }
            }

            // Disable collider
            var colliders = GetComponentsInChildren<Collider>();
            foreach (var col in colliders)
            {
                col.enabled = false;
            }
        }

        /// <summary>
        /// Enable player visuals after respawn
        /// </summary>
        private void EnablePlayerVisuals()
        {
            foreach (var rend in renderers)
            {
                if (rend != null)
                {
                    rend.enabled = true;
                }
            }

            // Enable collider
            var colliders = GetComponentsInChildren<Collider>();
            foreach (var col in colliders)
            {
                col.enabled = true;
            }
        }

        /// <summary>
        /// Damage flash effect (red flash for players)
        /// </summary>
        protected override IEnumerator DamageFlash()
        {
            Color flashColor = stats != null ? stats.damageFlashColor : Color.red;
            float duration = stats != null ? stats.damageFlashDuration : 0.1f;

            yield return FlashColor(flashColor, duration);
        }

        /// <summary>
        /// Set whether player can respawn
        /// </summary>
        public void SetCanRespawn(bool value)
        {
            canRespawn = value;
        }

        /// <summary>
        /// Force immediate respawn (for testing)
        /// </summary>
        [ContextMenu("Force Respawn")]
        public void ForceRespawn()
        {
            if (!isDead)
            {
                // Kill first
                TakeDamage(MaxHealth + 1, null);
            }
        }
    }
}
