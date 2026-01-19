using UnityEngine;

namespace AlienArena.Enemy
{
    /// <summary>
    /// ScriptableObject containing all enemy configuration values.
    /// Create instances via Assets > Create > AlienArena > Enemy Stats
    /// </summary>
    [CreateAssetMenu(fileName = "EnemyStats", menuName = "AlienArena/Enemy Stats")]
    public class EnemyStats : ScriptableObject
    {
        [Header("Identity")]
        [Tooltip("Type identifier for this enemy")]
        public string enemyType = "FireElemental";

        [Header("Movement")]
        [Tooltip("Movement speed in units per second")]
        public float moveSpeed = 3.0f;

        [Tooltip("Rotation speed in degrees per second")]
        public float rotationSpeed = 360f;

        [Tooltip("Distance at which enemy stops to attack")]
        public float stoppingDistance = 1.2f;

        [Header("Combat")]
        [Tooltip("Damage dealt per attack")]
        public int damage = 15;

        [Tooltip("Range at which enemy can attack")]
        public float attackRange = 1.5f;

        [Tooltip("Cooldown between attacks in seconds")]
        public float attackCooldown = 1.0f;

        [Header("Health")]
        [Tooltip("Maximum health points")]
        public int maxHealth = 50;

        [Header("Visual Effects")]
        [Tooltip("Particle effect to spawn on death")]
        public GameObject deathVFX;

        [Tooltip("Color to flash when taking damage")]
        public Color damageFlashColor = Color.white;

        [Tooltip("Duration of damage flash in seconds")]
        public float damageFlashDuration = 0.1f;

        [Header("Audio")]
        [Tooltip("Sound to play on attack")]
        public AudioClip attackSound;

        [Tooltip("Sound to play on death")]
        public AudioClip deathSound;
    }
}
