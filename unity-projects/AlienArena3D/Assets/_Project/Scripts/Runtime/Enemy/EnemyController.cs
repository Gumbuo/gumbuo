using UnityEngine;
using UnityEngine.AI;
using AlienArena.Combat;

namespace AlienArena.Enemy
{
    /// <summary>
    /// Enemy controller handling movement and AI behavior.
    /// Ported from Godot enemy.gd (212 lines)
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public class EnemyController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private EnemyStats stats;

        [Header("Target Finding")]
        [SerializeField] private LayerMask playerLayer;
        [SerializeField] private float targetUpdateInterval = 0.5f;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        // Components
        private NavMeshAgent agent;
        private EnemyHealth health;
        private Animator animator;

        // State
        private Transform currentTarget;
        private EnemyState currentState = EnemyState.Idle;
        private float targetUpdateTimer;
        private float attackCooldownTimer;
        private bool canAttack = true;

        // Animation parameters
        private static readonly int SpeedParam = Animator.StringToHash("Speed");
        private static readonly int AttackTrigger = Animator.StringToHash("Attack");

        public EnemyStats Stats => stats;
        public EnemyState CurrentState => currentState;
        public Transform CurrentTarget => currentTarget;

        public enum EnemyState
        {
            Idle,
            Chasing,
            Attacking,
            Dead
        }

        private void Awake()
        {
            agent = GetComponent<NavMeshAgent>();
            health = GetComponent<EnemyHealth>();
            animator = GetComponentInChildren<Animator>();

            if (stats == null)
            {
                Debug.LogError($"EnemyController on {gameObject.name}: EnemyStats not assigned!");
            }
        }

        private void Start()
        {
            InitializeAgent();
        }

        private void OnEnable()
        {
            if (health != null)
            {
                health.OnDeath += HandleDeath;
            }
        }

        private void OnDisable()
        {
            if (health != null)
            {
                health.OnDeath -= HandleDeath;
            }
        }

        /// <summary>
        /// Initialize NavMeshAgent with stats values
        /// </summary>
        private void InitializeAgent()
        {
            if (stats == null) return;

            agent.speed = stats.moveSpeed;
            agent.angularSpeed = stats.rotationSpeed;
            agent.stoppingDistance = stats.stoppingDistance;
        }

        /// <summary>
        /// Reset enemy for object pooling
        /// </summary>
        public void ResetEnemy()
        {
            currentState = EnemyState.Idle;
            currentTarget = null;
            canAttack = true;
            attackCooldownTimer = 0;

            if (agent != null)
            {
                agent.enabled = true;
                agent.isStopped = false;
            }

            if (health != null)
            {
                health.Initialize();
            }
        }

        private void Update()
        {
            if (currentState == EnemyState.Dead) return;

            UpdateTargetFinding();
            UpdateCooldowns();
            UpdateStateMachine();
            UpdateAnimator();
        }

        /// <summary>
        /// Periodically find the nearest player
        /// </summary>
        private void UpdateTargetFinding()
        {
            targetUpdateTimer -= Time.deltaTime;

            if (targetUpdateTimer <= 0)
            {
                targetUpdateTimer = targetUpdateInterval;
                FindNearestPlayer();
            }
        }

        /// <summary>
        /// Find and set the nearest player as target
        /// </summary>
        private void FindNearestPlayer()
        {
            // Find all players
            Collider[] players = Physics.OverlapSphere(transform.position, 100f, playerLayer);

            Transform nearest = null;
            float nearestDistance = float.MaxValue;

            foreach (Collider player in players)
            {
                // Check if player is alive
                IDamageable damageable = player.GetComponent<IDamageable>();
                if (damageable != null && damageable.IsDead) continue;

                float distance = Vector3.Distance(transform.position, player.transform.position);
                if (distance < nearestDistance)
                {
                    nearestDistance = distance;
                    nearest = player.transform;
                }
            }

            currentTarget = nearest;

            if (showDebugInfo && currentTarget != null)
            {
                Debug.Log($"{gameObject.name} targeting {currentTarget.name} at distance {nearestDistance}");
            }
        }

        /// <summary>
        /// Update attack cooldown
        /// </summary>
        private void UpdateCooldowns()
        {
            if (!canAttack)
            {
                attackCooldownTimer -= Time.deltaTime;
                if (attackCooldownTimer <= 0)
                {
                    canAttack = true;
                }
            }
        }

        /// <summary>
        /// State machine update
        /// </summary>
        private void UpdateStateMachine()
        {
            switch (currentState)
            {
                case EnemyState.Idle:
                    if (currentTarget != null)
                    {
                        TransitionTo(EnemyState.Chasing);
                    }
                    break;

                case EnemyState.Chasing:
                    if (currentTarget == null)
                    {
                        TransitionTo(EnemyState.Idle);
                        return;
                    }

                    // Move toward target
                    agent.SetDestination(currentTarget.position);

                    // Check if in attack range
                    float distanceToTarget = Vector3.Distance(transform.position, currentTarget.position);
                    if (distanceToTarget <= stats.attackRange)
                    {
                        TransitionTo(EnemyState.Attacking);
                    }
                    break;

                case EnemyState.Attacking:
                    if (currentTarget == null)
                    {
                        TransitionTo(EnemyState.Idle);
                        return;
                    }

                    // Stop moving while attacking
                    agent.isStopped = true;

                    // Face target
                    Vector3 lookDir = (currentTarget.position - transform.position).normalized;
                    lookDir.y = 0;
                    if (lookDir != Vector3.zero)
                    {
                        transform.rotation = Quaternion.Slerp(
                            transform.rotation,
                            Quaternion.LookRotation(lookDir),
                            Time.deltaTime * stats.rotationSpeed * 0.1f
                        );
                    }

                    // Perform attack if cooldown ready
                    if (canAttack)
                    {
                        PerformAttack();
                    }

                    // Check if target moved out of range
                    float dist = Vector3.Distance(transform.position, currentTarget.position);
                    if (dist > stats.attackRange * 1.5f)
                    {
                        TransitionTo(EnemyState.Chasing);
                    }
                    break;

                case EnemyState.Dead:
                    // Do nothing
                    break;
            }
        }

        /// <summary>
        /// Transition to a new state
        /// </summary>
        private void TransitionTo(EnemyState newState)
        {
            if (currentState == newState) return;

            // Exit current state
            switch (currentState)
            {
                case EnemyState.Attacking:
                    agent.isStopped = false;
                    break;
            }

            currentState = newState;

            if (showDebugInfo)
            {
                Debug.Log($"{gameObject.name} transitioned to {newState}");
            }
        }

        /// <summary>
        /// Perform melee attack on target
        /// </summary>
        private void PerformAttack()
        {
            if (currentTarget == null) return;

            canAttack = false;
            attackCooldownTimer = stats.attackCooldown;

            // Play attack animation
            if (animator != null)
            {
                animator.SetTrigger(AttackTrigger);
            }

            // Deal damage
            IDamageable targetHealth = currentTarget.GetComponent<IDamageable>();
            if (targetHealth == null)
            {
                targetHealth = currentTarget.GetComponentInParent<IDamageable>();
            }

            if (targetHealth != null && !targetHealth.IsDead)
            {
                targetHealth.TakeDamage(stats.damage, gameObject);

                if (showDebugInfo)
                {
                    Debug.Log($"{gameObject.name} attacked {currentTarget.name} for {stats.damage} damage");
                }
            }

            // Play attack sound
            if (stats.attackSound != null)
            {
                AudioSource.PlayClipAtPoint(stats.attackSound, transform.position);
            }
        }

        /// <summary>
        /// Update animator parameters
        /// </summary>
        private void UpdateAnimator()
        {
            if (animator == null) return;

            float speed = agent.velocity.magnitude / stats.moveSpeed;
            animator.SetFloat(SpeedParam, speed);
        }

        /// <summary>
        /// Handle enemy death
        /// </summary>
        private void HandleDeath()
        {
            TransitionTo(EnemyState.Dead);
            agent.enabled = false;

            // Spawn death VFX
            if (stats.deathVFX != null)
            {
                GameObject vfx = Instantiate(stats.deathVFX, transform.position, Quaternion.identity);
                Destroy(vfx, 2f);
            }

            // Play death sound
            if (stats.deathSound != null)
            {
                AudioSource.PlayClipAtPoint(stats.deathSound, transform.position);
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (stats == null) return;

            // Draw attack range
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, stats.attackRange);

            // Draw line to target
            if (currentTarget != null)
            {
                Gizmos.color = Color.yellow;
                Gizmos.DrawLine(transform.position, currentTarget.position);
            }
        }
#endif
    }
}
