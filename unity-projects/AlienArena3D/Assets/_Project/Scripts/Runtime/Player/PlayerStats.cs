using UnityEngine;

namespace AlienArena.Player
{
    /// <summary>
    /// ScriptableObject containing all player configuration values.
    /// Create instances via Assets > Create > AlienArena > Player Stats
    /// </summary>
    [CreateAssetMenu(fileName = "PlayerStats", menuName = "AlienArena/Player Stats")]
    public class PlayerStats : ScriptableObject
    {
        [Header("Movement")]
        [Tooltip("Movement speed in units per second")]
        public float moveSpeed = 4.5f;

        [Tooltip("Rotation speed in degrees per second")]
        public float rotationSpeed = 720f;

        [Header("Combat - Ranged")]
        [Tooltip("Cooldown between ranged attacks in seconds")]
        public float shootCooldown = 0.3f;

        [Tooltip("Damage dealt by projectiles")]
        public int projectileDamage = 20;

        [Tooltip("Projectile speed in units per second")]
        public float projectileSpeed = 20f;

        [Tooltip("Projectile lifetime in seconds")]
        public float projectileLifetime = 3f;

        [Tooltip("Prefab to spawn for projectiles")]
        public GameObject projectilePrefab;

        [Header("Combat - Melee")]
        [Tooltip("Cooldown between melee attacks in seconds")]
        public float meleeCooldown = 0.5f;

        [Tooltip("Damage dealt by melee attacks")]
        public int meleeDamage = 25;

        [Tooltip("Range of melee attacks in units")]
        public float meleeRange = 2.0f;

        [Header("Health")]
        [Tooltip("Maximum health points")]
        public int maxHealth = 100;

        [Tooltip("Delay before respawning after death")]
        public float respawnDelay = 2.0f;

        [Tooltip("Available spawn positions for this player")]
        public Vector3[] spawnPositions;

        [Header("Visual Feedback")]
        [Tooltip("Color to flash when taking damage")]
        public Color damageFlashColor = Color.red;

        [Tooltip("Duration of damage flash in seconds")]
        public float damageFlashDuration = 0.1f;
    }
}
