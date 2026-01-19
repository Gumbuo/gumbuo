using System;
using UnityEngine;

namespace AlienArena.Combat
{
    /// <summary>
    /// Interface for any entity that can take damage.
    /// Implement this on players, enemies, destructible objects, etc.
    /// </summary>
    public interface IDamageable
    {
        /// <summary>
        /// Current health of the entity
        /// </summary>
        int CurrentHealth { get; }

        /// <summary>
        /// Maximum health of the entity
        /// </summary>
        int MaxHealth { get; }

        /// <summary>
        /// Whether the entity is dead
        /// </summary>
        bool IsDead { get; }

        /// <summary>
        /// Apply damage to the entity
        /// </summary>
        /// <param name="amount">Amount of damage to apply</param>
        /// <param name="attacker">The GameObject that caused the damage</param>
        void TakeDamage(int amount, GameObject attacker);

        /// <summary>
        /// Heal the entity
        /// </summary>
        /// <param name="amount">Amount to heal</param>
        void Heal(int amount);

        /// <summary>
        /// Event fired when health changes (new health value)
        /// </summary>
        event Action<int> OnHealthChanged;

        /// <summary>
        /// Event fired when the entity dies
        /// </summary>
        event Action OnDeath;
    }
}
