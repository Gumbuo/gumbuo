using System.Collections.Generic;
using UnityEngine;

namespace AlienArena.Camera
{
    /// <summary>
    /// Camera that follows multiple targets (players) with dynamic zoom.
    /// Ported from Godot camera_manager.gd (131 lines)
    /// </summary>
    public class MultiTargetCamera : MonoBehaviour
    {
        [Header("Targets")]
        [SerializeField] private List<Transform> targets = new List<Transform>();

        [Header("Position")]
        [SerializeField] private Vector3 offset = new Vector3(0, 15, -12);
        [SerializeField] private float smoothSpeed = 5.0f;

        [Header("Zoom (Orthographic)")]
        [SerializeField] private float defaultSize = 15f;
        [SerializeField] private float minSize = 8f;
        [SerializeField] private float maxSize = 25f;
        [SerializeField] private float zoomMargin = 3f;
        [SerializeField] private float zoomSmoothSpeed = 3f;

        [Header("Zoom (Perspective)")]
        [SerializeField] private float defaultFOV = 60f;
        [SerializeField] private float minFOV = 40f;
        [SerializeField] private float maxFOV = 80f;

        [Header("Bounds")]
        [SerializeField] private bool useBounds = true;
        [SerializeField] private Vector2 boundsMin = new Vector2(-20, -20);
        [SerializeField] private Vector2 boundsMax = new Vector2(20, 20);

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        private UnityEngine.Camera cam;
        private Vector3 targetPosition;
        private float targetZoom;

        private void Awake()
        {
            cam = GetComponent<UnityEngine.Camera>();

            if (cam == null)
            {
                cam = GetComponentInChildren<UnityEngine.Camera>();
            }

            if (cam == null)
            {
                Debug.LogError("MultiTargetCamera: No Camera component found!");
            }
        }

        private void Start()
        {
            // Initialize zoom
            if (cam != null)
            {
                if (cam.orthographic)
                {
                    cam.orthographicSize = defaultSize;
                }
                else
                {
                    cam.fieldOfView = defaultFOV;
                }
            }
        }

        private void LateUpdate()
        {
            if (targets.Count == 0) return;

            UpdateTargetPosition();
            UpdateZoom();
            ApplyTransform();
        }

        /// <summary>
        /// Calculate the target position (center of all targets)
        /// </summary>
        private void UpdateTargetPosition()
        {
            // Remove null/inactive targets
            targets.RemoveAll(t => t == null || !t.gameObject.activeInHierarchy);

            if (targets.Count == 0)
            {
                return;
            }

            // Calculate center point
            Vector3 centerPoint = GetCenterPoint();

            // Apply offset
            targetPosition = centerPoint + offset;

            // Apply bounds
            if (useBounds)
            {
                targetPosition.x = Mathf.Clamp(targetPosition.x, boundsMin.x + offset.x, boundsMax.x + offset.x);
                targetPosition.z = Mathf.Clamp(targetPosition.z, boundsMin.y + offset.z, boundsMax.y + offset.z);
            }
        }

        /// <summary>
        /// Get the center point of all targets
        /// </summary>
        private Vector3 GetCenterPoint()
        {
            if (targets.Count == 1)
            {
                return targets[0].position;
            }

            var bounds = new Bounds(targets[0].position, Vector3.zero);

            foreach (var target in targets)
            {
                if (target != null && target.gameObject.activeInHierarchy)
                {
                    bounds.Encapsulate(target.position);
                }
            }

            return bounds.center;
        }

        /// <summary>
        /// Update zoom based on target distance
        /// </summary>
        private void UpdateZoom()
        {
            if (targets.Count <= 1)
            {
                targetZoom = cam.orthographic ? defaultSize : defaultFOV;
                return;
            }

            float greatestDistance = GetGreatestDistance();

            if (cam.orthographic)
            {
                // Calculate required orthographic size
                targetZoom = Mathf.Clamp(greatestDistance / 2f + zoomMargin, minSize, maxSize);
            }
            else
            {
                // Calculate required FOV for perspective camera
                float requiredFOV = Mathf.Atan2(greatestDistance / 2f + zoomMargin, offset.magnitude) * Mathf.Rad2Deg * 2f;
                targetZoom = Mathf.Clamp(requiredFOV, minFOV, maxFOV);
            }
        }

        /// <summary>
        /// Get the greatest distance between any two targets
        /// </summary>
        private float GetGreatestDistance()
        {
            var bounds = new Bounds(targets[0].position, Vector3.zero);

            foreach (var target in targets)
            {
                if (target != null && target.gameObject.activeInHierarchy)
                {
                    bounds.Encapsulate(target.position);
                }
            }

            // Use the larger of width or height
            return Mathf.Max(bounds.size.x, bounds.size.z);
        }

        /// <summary>
        /// Apply position and zoom smoothly
        /// </summary>
        private void ApplyTransform()
        {
            // Smooth position
            transform.position = Vector3.Lerp(transform.position, targetPosition, smoothSpeed * Time.deltaTime);

            // Smooth zoom
            if (cam.orthographic)
            {
                cam.orthographicSize = Mathf.Lerp(cam.orthographicSize, targetZoom, zoomSmoothSpeed * Time.deltaTime);
            }
            else
            {
                cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, targetZoom, zoomSmoothSpeed * Time.deltaTime);
            }
        }

        /// <summary>
        /// Add a target to track
        /// </summary>
        public void AddTarget(Transform target)
        {
            if (target != null && !targets.Contains(target))
            {
                targets.Add(target);

                if (showDebugInfo)
                {
                    Debug.Log($"MultiTargetCamera: Added target {target.name}");
                }
            }
        }

        /// <summary>
        /// Remove a target from tracking
        /// </summary>
        public void RemoveTarget(Transform target)
        {
            if (targets.Contains(target))
            {
                targets.Remove(target);

                if (showDebugInfo)
                {
                    Debug.Log($"MultiTargetCamera: Removed target {target.name}");
                }
            }
        }

        /// <summary>
        /// Clear all targets
        /// </summary>
        public void ClearTargets()
        {
            targets.Clear();
        }

        /// <summary>
        /// Set targets directly
        /// </summary>
        public void SetTargets(List<Transform> newTargets)
        {
            targets = new List<Transform>(newTargets);
        }

        /// <summary>
        /// Snap to target position immediately (no smoothing)
        /// </summary>
        public void SnapToTargets()
        {
            UpdateTargetPosition();
            transform.position = targetPosition;

            if (cam.orthographic)
            {
                cam.orthographicSize = targetZoom;
            }
            else
            {
                cam.fieldOfView = targetZoom;
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmos()
        {
            if (!useBounds) return;

            Gizmos.color = Color.cyan;
            Vector3 center = new Vector3(
                (boundsMin.x + boundsMax.x) / 2f,
                0,
                (boundsMin.y + boundsMax.y) / 2f
            );
            Vector3 size = new Vector3(
                boundsMax.x - boundsMin.x,
                1,
                boundsMax.y - boundsMin.y
            );
            Gizmos.DrawWireCube(center, size);
        }
#endif
    }
}
