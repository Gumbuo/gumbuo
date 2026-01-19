using System;
using System.Collections;
using UnityEngine;

namespace AlienArena.Combat
{
    /// <summary>
    /// Camera shake effect system.
    /// Ported from Godot camera_manager.gd shake logic.
    /// </summary>
    public class CameraShake : MonoBehaviour
    {
        [Header("Shake Presets (Matching Godot)")]
        [SerializeField] private float hitIntensity = 0.3f;
        [SerializeField] private float hitDuration = 0.15f;

        [SerializeField] private float meleeIntensity = 0.5f;
        [SerializeField] private float meleeDuration = 0.2f;

        [SerializeField] private float explosionIntensity = 0.8f;
        [SerializeField] private float explosionDuration = 0.4f;

        [Header("Settings")]
        [SerializeField] private float shakeDecay = 5f;

        // Singleton for easy access
        public static CameraShake Instance { get; private set; }

        // Static events for shake requests (decoupled from singleton)
        public static Action HitShakeRequested;
        public static Action MeleeShakeRequested;
        public static Action ExplosionShakeRequested;

        // State
        private Vector3 originalPosition;
        private float currentIntensity;
        private float currentDuration;
        private float shakeTimer;
        private bool isShaking;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(this);
                return;
            }
            Instance = this;

            originalPosition = transform.localPosition;
        }

        private void OnEnable()
        {
            HitShakeRequested += TriggerHitShake;
            MeleeShakeRequested += TriggerMeleeShake;
            ExplosionShakeRequested += TriggerExplosionShake;
        }

        private void OnDisable()
        {
            HitShakeRequested -= TriggerHitShake;
            MeleeShakeRequested -= TriggerMeleeShake;
            ExplosionShakeRequested -= TriggerExplosionShake;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void Update()
        {
            if (!isShaking) return;

            shakeTimer -= Time.deltaTime;

            if (shakeTimer <= 0)
            {
                // Shake complete
                isShaking = false;
                transform.localPosition = originalPosition;
                return;
            }

            // Calculate decaying intensity
            float progress = shakeTimer / currentDuration;
            float intensity = currentIntensity * progress;

            // Apply random offset
            Vector3 offset = new Vector3(
                UnityEngine.Random.Range(-1f, 1f) * intensity,
                UnityEngine.Random.Range(-1f, 1f) * intensity,
                0 // Don't shake in Z for 2.5D/top-down feel
            );

            transform.localPosition = originalPosition + offset;
        }

        /// <summary>
        /// Trigger a camera shake with custom parameters
        /// </summary>
        public void Shake(float intensity, float duration)
        {
            // Only override if new shake is stronger
            if (isShaking && intensity < currentIntensity) return;

            currentIntensity = intensity;
            currentDuration = duration;
            shakeTimer = duration;
            isShaking = true;
        }

        /// <summary>
        /// Trigger hit shake preset (projectile hits)
        /// </summary>
        public void TriggerHitShake()
        {
            Shake(hitIntensity, hitDuration);
        }

        /// <summary>
        /// Trigger melee shake preset
        /// </summary>
        public void TriggerMeleeShake()
        {
            Shake(meleeIntensity, meleeDuration);
        }

        /// <summary>
        /// Trigger explosion shake preset
        /// </summary>
        public void TriggerExplosionShake()
        {
            Shake(explosionIntensity, explosionDuration);
        }

        /// <summary>
        /// Immediately stop any active shake
        /// </summary>
        public void StopShake()
        {
            isShaking = false;
            transform.localPosition = originalPosition;
        }
    }
}
