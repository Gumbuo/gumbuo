using System;
using System.Collections;
using UnityEngine;

namespace AlienArena.Combat
{
    /// <summary>
    /// Base health component implementing the IDamageable interface.
    /// Extend this for PlayerHealth and EnemyHealth with specific behaviors.
    /// </summary>
    public abstract class Health : MonoBehaviour, IDamageable
    {
        [Header("Debug")]
        [SerializeField] protected bool showDebugInfo = false;

        protected int currentHealth;
        protected bool isDead;
        protected Renderer[] renderers;
        protected Color[] originalColors;

        public abstract int MaxHealth { get; }
        public int CurrentHealth => currentHealth;
        public bool IsDead => isDead;

        public event Action<int> OnHealthChanged;
        public event Action OnDeath;

        protected virtual void Awake()
        {
            // Cache renderers for damage flash
            renderers = GetComponentsInChildren<Renderer>();
            originalColors = new Color[renderers.Length];
            for (int i = 0; i < renderers.Length; i++)
            {
                if (renderers[i].material.HasProperty("_Color"))
                {
                    originalColors[i] = renderers[i].material.color;
                }
            }
        }

        protected virtual void Start()
        {
            Initialize();
        }

        /// <summary>
        /// Initialize or reset health to max
        /// </summary>
        public virtual void Initialize()
        {
            currentHealth = MaxHealth;
            isDead = false;
            OnHealthChanged?.Invoke(currentHealth);
        }

        /// <summary>
        /// Apply damage to this entity
        /// </summary>
        public virtual void TakeDamage(int amount, GameObject attacker)
        {
            if (isDead) return;
            if (amount <= 0) return;

            currentHealth -= amount;

            if (showDebugInfo)
            {
                Debug.Log($"{gameObject.name} took {amount} damage from {attacker?.name ?? "unknown"}. Health: {currentHealth}/{MaxHealth}");
            }

            OnHealthChanged?.Invoke(currentHealth);

            // Visual feedback
            StartCoroutine(DamageFlash());

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                Die(attacker);
            }
        }

        /// <summary>
        /// Heal this entity
        /// </summary>
        public virtual void Heal(int amount)
        {
            if (isDead) return;
            if (amount <= 0) return;

            currentHealth = Mathf.Min(currentHealth + amount, MaxHealth);
            OnHealthChanged?.Invoke(currentHealth);

            if (showDebugInfo)
            {
                Debug.Log($"{gameObject.name} healed for {amount}. Health: {currentHealth}/{MaxHealth}");
            }
        }

        /// <summary>
        /// Handle death. Override for specific death behaviors.
        /// </summary>
        protected virtual void Die(GameObject killer = null)
        {
            if (isDead) return;
            isDead = true;

            if (showDebugInfo)
            {
                Debug.Log($"{gameObject.name} died! Killed by: {killer?.name ?? "unknown"}");
            }

            OnDeath?.Invoke();
            HandleDeath(killer);
        }

        /// <summary>
        /// Override this in derived classes for specific death handling
        /// </summary>
        protected abstract void HandleDeath(GameObject killer);

        /// <summary>
        /// Override this to customize the damage flash effect
        /// </summary>
        protected abstract IEnumerator DamageFlash();

        /// <summary>
        /// Helper to flash renderers a specific color
        /// </summary>
        protected IEnumerator FlashColor(Color flashColor, float duration)
        {
            // Set flash color
            foreach (var rend in renderers)
            {
                if (rend != null && rend.material.HasProperty("_Color"))
                {
                    rend.material.color = flashColor;
                }
            }

            yield return new WaitForSeconds(duration);

            // Restore original colors
            for (int i = 0; i < renderers.Length; i++)
            {
                if (renderers[i] != null && renderers[i].material.HasProperty("_Color"))
                {
                    renderers[i].material.color = originalColors[i];
                }
            }
        }

        /// <summary>
        /// Get health as a normalized value (0-1)
        /// </summary>
        public float GetHealthNormalized()
        {
            return (float)currentHealth / MaxHealth;
        }
    }
}
