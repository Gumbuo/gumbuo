using System.Collections.Generic;
using UnityEngine;

namespace AlienArena.Utilities
{
    /// <summary>
    /// Generic object pool for reusing GameObjects.
    /// Use for projectiles, enemies, VFX, etc.
    /// </summary>
    public class ObjectPool : MonoBehaviour
    {
        [Header("Pool Configuration")]
        [SerializeField] private GameObject prefab;
        [SerializeField] private int initialSize = 10;
        [SerializeField] private bool expandable = true;
        [SerializeField] private int maxSize = 100;

        [Header("Organization")]
        [SerializeField] private Transform poolContainer;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        private Queue<GameObject> availableObjects = new Queue<GameObject>();
        private List<GameObject> allObjects = new List<GameObject>();

        public int AvailableCount => availableObjects.Count;
        public int TotalCount => allObjects.Count;

        private void Awake()
        {
            if (poolContainer == null)
            {
                poolContainer = transform;
            }

            InitializePool();
        }

        /// <summary>
        /// Initialize the pool with initial objects
        /// </summary>
        private void InitializePool()
        {
            if (prefab == null)
            {
                Debug.LogError($"ObjectPool on {gameObject.name}: No prefab assigned!");
                return;
            }

            for (int i = 0; i < initialSize; i++)
            {
                CreateNewObject();
            }

            if (showDebugInfo)
            {
                Debug.Log($"ObjectPool initialized with {initialSize} objects");
            }
        }

        /// <summary>
        /// Create a new pooled object
        /// </summary>
        private GameObject CreateNewObject()
        {
            GameObject obj = Instantiate(prefab, poolContainer);
            obj.SetActive(false);
            availableObjects.Enqueue(obj);
            allObjects.Add(obj);
            return obj;
        }

        /// <summary>
        /// Get an object from the pool
        /// </summary>
        /// <returns>A pooled GameObject, or null if pool is empty and not expandable</returns>
        public GameObject Get()
        {
            return Get(Vector3.zero, Quaternion.identity);
        }

        /// <summary>
        /// Get an object from the pool with position and rotation
        /// </summary>
        public GameObject Get(Vector3 position, Quaternion rotation)
        {
            GameObject obj = null;

            // Try to get from available objects
            while (availableObjects.Count > 0)
            {
                obj = availableObjects.Dequeue();
                if (obj != null) break;
            }

            // Create new if expandable
            if (obj == null)
            {
                if (expandable && allObjects.Count < maxSize)
                {
                    obj = CreateNewObject();
                    availableObjects.Dequeue(); // Remove from available since we're using it
                }
                else
                {
                    if (showDebugInfo)
                    {
                        Debug.LogWarning($"ObjectPool on {gameObject.name}: Pool exhausted!");
                    }
                    return null;
                }
            }

            // Set position and rotation
            obj.transform.position = position;
            obj.transform.rotation = rotation;
            obj.SetActive(true);

            // Reset IPoolable components
            var poolables = obj.GetComponents<IPoolable>();
            foreach (var poolable in poolables)
            {
                poolable.OnSpawn();
            }

            if (showDebugInfo)
            {
                Debug.Log($"ObjectPool: Got object. Available: {availableObjects.Count}");
            }

            return obj;
        }

        /// <summary>
        /// Return an object to the pool
        /// </summary>
        public void Return(GameObject obj)
        {
            if (obj == null) return;

            // Notify IPoolable components
            var poolables = obj.GetComponents<IPoolable>();
            foreach (var poolable in poolables)
            {
                poolable.OnDespawn();
            }

            obj.SetActive(false);
            obj.transform.SetParent(poolContainer);
            availableObjects.Enqueue(obj);

            if (showDebugInfo)
            {
                Debug.Log($"ObjectPool: Returned object. Available: {availableObjects.Count}");
            }
        }

        /// <summary>
        /// Return all active objects to the pool
        /// </summary>
        public void ReturnAll()
        {
            foreach (var obj in allObjects)
            {
                if (obj != null && obj.activeInHierarchy)
                {
                    Return(obj);
                }
            }
        }

        /// <summary>
        /// Destroy all pooled objects
        /// </summary>
        public void Clear()
        {
            foreach (var obj in allObjects)
            {
                if (obj != null)
                {
                    Destroy(obj);
                }
            }

            allObjects.Clear();
            availableObjects.Clear();
        }

        /// <summary>
        /// Preload additional objects
        /// </summary>
        public void Preload(int count)
        {
            for (int i = 0; i < count && allObjects.Count < maxSize; i++)
            {
                CreateNewObject();
            }
        }
    }

    /// <summary>
    /// Interface for poolable objects to receive spawn/despawn callbacks
    /// </summary>
    public interface IPoolable
    {
        void OnSpawn();
        void OnDespawn();
    }
}
