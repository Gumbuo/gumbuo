using System;
using System.Collections;
using UnityEngine;
using AlienArena.Combat;

namespace AlienArena.Enemy
{
    /// <summary>
    /// Enemy-specific health component.
    /// Ported from Godot enemy.gd health logic.
    /// </summary>
    public class EnemyHealth : Health
    {
        [Header("Enemy Configuration")]
        [SerializeField] private EnemyStats stats;

        [Header("Death")]
        [SerializeField] private float destroyDelay = 0.5f;

        // Events
        public event Action<GameObject> OnKilled; // Passes the killer

        private EnemyController controller;

        public override int MaxHealth => stats != null ? stats.maxHealth : 50;

        protected override void Awake()
        {
            base.Awake();
            controller = GetComponent<EnemyController>();

            if (stats == null && controller != null)
            {
                stats = controller.Stats;
            }
        }

        /// <summary>
        /// Handle enemy death
        /// </summary>
        protected override void HandleDeath(GameObject killer)
        {
            OnKilled?.Invoke(killer);

            // Start destroy sequence
            StartCoroutine(DestroySequence());
        }

        /// <summary>
        /// Destroy enemy after delay (for animation)
        /// </summary>
        private IEnumerator DestroySequence()
        {
            yield return new WaitForSeconds(destroyDelay);

            // Return to pool or destroy
            gameObject.SetActive(false);

            // If no pool is handling us, destroy
            // The pool will handle recycling if one exists
        }

        /// <summary>
        /// Damage flash effect (white flash for enemies)
        /// </summary>
        protected override IEnumerator DamageFlash()
        {
            Color flashColor = stats != null ? stats.damageFlashColor : Color.white;
            float duration = stats != null ? stats.damageFlashDuration : 0.1f;

            yield return FlashColor(flashColor, duration);
        }
    }
}
