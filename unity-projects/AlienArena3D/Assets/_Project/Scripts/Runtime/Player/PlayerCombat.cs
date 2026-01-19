using System;
using System.Collections;
using UnityEngine;
using AlienArena.Combat;

namespace AlienArena.Player
{
    /// <summary>
    /// Handles player combat: ranged attacks (projectiles) and melee attacks.
    /// Ported from Godot player.gd combat logic.
    /// </summary>
    public class PlayerCombat : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private PlayerStats stats;

        [Header("Ranged Attack")]
        [SerializeField] private Transform projectileSpawnPoint;

        [Header("Melee Attack")]
        [SerializeField] private Transform meleeHitboxCenter;
        [SerializeField] private LayerMask meleeTargetLayers;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // Components
        private PlayerController controller;
        private Animator animator;

        // State
        private float shootCooldownTimer;
        private float meleeCooldownTimer;
        private bool canShoot = true;
        private bool canMelee = true;

        // Animation triggers
        private static readonly int AttackRangedTrigger = Animator.StringToHash("Attack_Ranged");
        private static readonly int AttackMeleeTrigger = Animator.StringToHash("Attack_Melee");

        // Events
        public event Action OnRangedAttack;
        public event Action OnMeleeAttack;

        private void Awake()
        {
            controller = GetComponent<PlayerController>();
            animator = GetComponentInChildren<Animator>();

            if (stats == null && controller != null)
            {
                stats = controller.Stats;
            }

            // Create default spawn point if not assigned
            if (projectileSpawnPoint == null)
            {
                projectileSpawnPoint = transform;
            }

            // Create default melee hitbox center if not assigned
            if (meleeHitboxCenter == null)
            {
                meleeHitboxCenter = transform;
            }
        }

        private void Update()
        {
            UpdateCooldowns();
        }

        /// <summary>
        /// Update attack cooldown timers
        /// </summary>
        private void UpdateCooldowns()
        {
            if (!canShoot)
            {
                shootCooldownTimer -= Time.deltaTime;
                if (shootCooldownTimer <= 0)
                {
                    canShoot = true;
                }
            }

            if (!canMelee)
            {
                meleeCooldownTimer -= Time.deltaTime;
                if (meleeCooldownTimer <= 0)
                {
                    canMelee = true;
                }
            }
        }

        /// <summary>
        /// Attempt to fire a ranged attack (projectile)
        /// </summary>
        /// <param name="direction">Direction to fire</param>
        /// <returns>True if attack was performed</returns>
        public bool TryRangedAttack(Vector3 direction)
        {
            if (!canShoot || stats == null) return false;

            // Start cooldown
            canShoot = false;
            shootCooldownTimer = stats.shootCooldown;

            // Spawn projectile
            SpawnProjectile(direction);

            // Play animation
            if (animator != null)
            {
                animator.SetTrigger(AttackRangedTrigger);
            }

            OnRangedAttack?.Invoke();

            if (showDebugInfo)
            {
                Debug.Log($"Player {controller?.PlayerNumber ?? 0} fired projectile in direction {direction}");
            }

            return true;
        }

        /// <summary>
        /// Spawn a projectile in the given direction
        /// </summary>
        private void SpawnProjectile(Vector3 direction)
        {
            if (stats.projectilePrefab == null)
            {
                Debug.LogWarning($"PlayerCombat: No projectile prefab assigned in PlayerStats!");
                return;
            }

            // Calculate spawn position (slightly in front of player)
            Vector3 spawnPos = projectileSpawnPoint.position + direction.normalized * 0.5f;
            spawnPos.y = transform.position.y + 1f; // Offset to chest height

            // Spawn projectile
            GameObject projectileObj = Instantiate(stats.projectilePrefab, spawnPos, Quaternion.LookRotation(direction));

            // Initialize projectile
            Projectile projectile = projectileObj.GetComponent<Projectile>();
            if (projectile != null)
            {
                projectile.Initialize(direction, gameObject, stats.projectileDamage, stats.projectileSpeed, stats.projectileLifetime);
            }
        }

        /// <summary>
        /// Attempt to perform a melee attack
        /// </summary>
        /// <returns>True if attack was performed</returns>
        public bool TryMeleeAttack()
        {
            if (!canMelee || stats == null) return false;

            // Start cooldown
            canMelee = false;
            meleeCooldownTimer = stats.meleeCooldown;

            // Perform melee hit detection
            PerformMeleeHit();

            // Play animation
            if (animator != null)
            {
                animator.SetTrigger(AttackMeleeTrigger);
            }

            OnMeleeAttack?.Invoke();

            if (showDebugInfo)
            {
                Debug.Log($"Player {controller?.PlayerNumber ?? 0} performed melee attack");
            }

            return true;
        }

        /// <summary>
        /// Detect and damage targets in melee range
        /// </summary>
        private void PerformMeleeHit()
        {
            // Get the direction we're facing
            Vector3 attackDirection = controller != null ? controller.FacingDirection : transform.forward;

            // Calculate attack center (in front of player)
            Vector3 attackCenter = meleeHitboxCenter.position + attackDirection * (stats.meleeRange * 0.5f);

            // Find all colliders in range
            Collider[] hits = Physics.OverlapSphere(attackCenter, stats.meleeRange, meleeTargetLayers);

            int hitCount = 0;
            foreach (Collider hit in hits)
            {
                // Don't hit ourselves
                if (hit.gameObject == gameObject) continue;
                if (hit.transform.IsChildOf(transform)) continue;

                // Check if the target is damageable
                IDamageable damageable = hit.GetComponent<IDamageable>();
                if (damageable == null)
                {
                    damageable = hit.GetComponentInParent<IDamageable>();
                }

                if (damageable != null && !damageable.IsDead)
                {
                    damageable.TakeDamage(stats.meleeDamage, gameObject);
                    hitCount++;

                    if (showDebugInfo)
                    {
                        Debug.Log($"Melee hit {hit.gameObject.name} for {stats.meleeDamage} damage");
                    }
                }
            }

            // Request camera shake if we hit something
            if (hitCount > 0)
            {
                // Camera shake will be handled by CameraShake.Instance or event system
                CameraShake.MeleeShakeRequested?.Invoke();
            }
        }

        /// <summary>
        /// Get remaining shoot cooldown (0-1)
        /// </summary>
        public float GetShootCooldownNormalized()
        {
            if (canShoot) return 0;
            return shootCooldownTimer / stats.shootCooldown;
        }

        /// <summary>
        /// Get remaining melee cooldown (0-1)
        /// </summary>
        public float GetMeleeCooldownNormalized()
        {
            if (canMelee) return 0;
            return meleeCooldownTimer / stats.meleeCooldown;
        }

#if UNITY_EDITOR
        /// <summary>
        /// Draw melee range in editor
        /// </summary>
        private void OnDrawGizmosSelected()
        {
            if (stats == null) return;

            Gizmos.color = Color.red;
            Vector3 attackDirection = Application.isPlaying && controller != null
                ? controller.FacingDirection
                : transform.forward;

            Transform center = meleeHitboxCenter != null ? meleeHitboxCenter : transform;
            Vector3 attackCenter = center.position + attackDirection * (stats.meleeRange * 0.5f);

            Gizmos.DrawWireSphere(attackCenter, stats.meleeRange);
        }
#endif
    }
}
