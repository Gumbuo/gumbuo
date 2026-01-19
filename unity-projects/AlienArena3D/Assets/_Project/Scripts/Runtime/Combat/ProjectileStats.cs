using UnityEngine;

namespace AlienArena.Combat
{
    /// <summary>
    /// ScriptableObject containing projectile configuration values.
    /// Create instances via Assets > Create > AlienArena > Projectile Stats
    /// </summary>
    [CreateAssetMenu(fileName = "ProjectileStats", menuName = "AlienArena/Projectile Stats")]
    public class ProjectileStats : ScriptableObject
    {
        [Header("Movement")]
        [Tooltip("Speed of the projectile in units per second")]
        public float speed = 20.0f;

        [Header("Combat")]
        [Tooltip("Damage dealt on hit")]
        public int damage = 20;

        [Header("Lifetime")]
        [Tooltip("How long the projectile exists before despawning")]
        public float lifetime = 3.0f;

        [Header("Visual Effects")]
        [Tooltip("Particle effect to spawn on hit")]
        public GameObject hitVFX;

        [Tooltip("Trail effect (optional)")]
        public GameObject trailVFX;

        [Header("Audio")]
        [Tooltip("Sound to play on spawn")]
        public AudioClip spawnSound;

        [Tooltip("Sound to play on hit")]
        public AudioClip hitSound;
    }
}
