using UnityEngine;

namespace AlienArena.Combat
{
    /// <summary>
    /// Projectile behavior for ranged attacks.
    /// Ported from Godot projectile.gd (32 lines)
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class Projectile : MonoBehaviour
    {
        [Header("Configuration (Override in Initialize)")]
        [SerializeField] private ProjectileStats defaultStats;

        [Header("Visual Effects")]
        [SerializeField] private GameObject hitVFXPrefab;
        [SerializeField] private TrailRenderer trailRenderer;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // Runtime state
        private Vector3 direction;
        private float speed;
        private int damage;
        private float lifetime;
        private float lifeTimer;
        private GameObject shooter;
        private Rigidbody rb;
        private bool hasHit = false;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();

            // Configure rigidbody for projectile physics
            rb.useGravity = false;
            rb.isKinematic = true; // We'll move it manually
            rb.collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;
        }

        /// <summary>
        /// Initialize projectile with all parameters
        /// </summary>
        public void Initialize(Vector3 direction, GameObject source, int damage, float speed, float lifetime)
        {
            this.direction = direction.normalized;
            this.shooter = source;
            this.damage = damage;
            this.speed = speed;
            this.lifetime = lifetime;
            this.lifeTimer = lifetime;
            this.hasHit = false;

            // Rotate to face direction
            if (direction != Vector3.zero)
            {
                transform.rotation = Quaternion.LookRotation(direction);
            }

            if (showDebugInfo)
            {
                Debug.Log($"Projectile initialized: dir={direction}, dmg={damage}, spd={speed}, life={lifetime}");
            }
        }

        /// <summary>
        /// Initialize projectile using stats ScriptableObject
        /// </summary>
        public void Initialize(Vector3 direction, GameObject source, ProjectileStats stats = null)
        {
            var s = stats ?? defaultStats;
            if (s == null)
            {
                Debug.LogError("Projectile: No stats provided and no default stats assigned!");
                Destroy(gameObject);
                return;
            }

            Initialize(direction, source, s.damage, s.speed, s.lifetime);
        }

        private void Update()
        {
            if (hasHit) return;

            // Move projectile
            transform.position += direction * speed * Time.deltaTime;

            // Check lifetime
            lifeTimer -= Time.deltaTime;
            if (lifeTimer <= 0)
            {
                DestroyProjectile();
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (hasHit) return;

            // Don't hit the shooter
            if (other.gameObject == shooter) return;
            if (shooter != null && other.transform.IsChildOf(shooter.transform)) return;

            // Check if we hit something damageable
            IDamageable damageable = other.GetComponent<IDamageable>();
            if (damageable == null)
            {
                damageable = other.GetComponentInParent<IDamageable>();
            }

            if (damageable != null)
            {
                damageable.TakeDamage(damage, shooter);

                if (showDebugInfo)
                {
                    Debug.Log($"Projectile hit {other.gameObject.name} for {damage} damage");
                }

                // Request camera shake
                CameraShake.HitShakeRequested?.Invoke();
            }

            // Hit something (wall or damageable)
            OnHit(other.ClosestPoint(transform.position));
        }

        /// <summary>
        /// Handle projectile hit
        /// </summary>
        private void OnHit(Vector3 hitPoint)
        {
            hasHit = true;

            // Spawn hit VFX
            SpawnHitEffect(hitPoint);

            // Destroy projectile
            DestroyProjectile();
        }

        /// <summary>
        /// Spawn hit particle effect
        /// </summary>
        private void SpawnHitEffect(Vector3 position)
        {
            GameObject vfxPrefab = hitVFXPrefab;

            // Use default stats VFX if available
            if (vfxPrefab == null && defaultStats != null)
            {
                vfxPrefab = defaultStats.hitVFX;
            }

            if (vfxPrefab != null)
            {
                GameObject vfx = Instantiate(vfxPrefab, position, Quaternion.identity);
                Destroy(vfx, 2f); // Auto-destroy after 2 seconds
            }
        }

        /// <summary>
        /// Clean up and destroy the projectile
        /// </summary>
        private void DestroyProjectile()
        {
            // Detach trail so it fades out nicely
            if (trailRenderer != null)
            {
                trailRenderer.transform.SetParent(null);
                Destroy(trailRenderer.gameObject, trailRenderer.time);
            }

            Destroy(gameObject);
        }

#if UNITY_EDITOR
        private void OnDrawGizmos()
        {
            if (!Application.isPlaying) return;

            Gizmos.color = Color.yellow;
            Gizmos.DrawRay(transform.position, direction * 2);
        }
#endif
    }
}
