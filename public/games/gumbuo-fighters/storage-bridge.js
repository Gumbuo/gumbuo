/**
 * Gumbuo Game Storage Bridge
 * Syncs localStorage with database backend for persistent storage
 */

(function() {
  'use strict';

  const API_URL = '/api/game-storage';
  const SYNC_DEBOUNCE_MS = 1000; // Wait 1 second before syncing after changes

  let userId = null;
  let syncTimeouts = {};
  let isInitialized = false;

  // Prompt for username on first load
  async function initializeUser() {
    if (isInitialized) return;

    // Check if we have a saved userId in sessionStorage
    let savedUserId = sessionStorage.getItem('gumbuo_game_user_id');

    if (!savedUserId) {
      // Show login UI (if available) or use prompt
      if (window.GumbuoLoginUI && window.GumbuoLoginUI.show) {
        savedUserId = await window.GumbuoLoginUI.show();
      } else {
        savedUserId = prompt('Enter your username to save your game progress:');
      }

      if (savedUserId && savedUserId.trim()) {
        savedUserId = savedUserId.trim().toLowerCase();
        sessionStorage.setItem('gumbuo_game_user_id', savedUserId);
        userId = savedUserId;
        console.log('Game storage initialized for user:', userId);

        // Load data from backend
        await loadAllFromBackend();
      } else {
        console.warn('Playing as guest - game progress will not be saved to server');
        userId = 'guest_' + Date.now(); // Temporary guest ID
      }
    } else {
      userId = savedUserId;
      console.log('Resuming session for user:', userId);
      await loadAllFromBackend();
    }

    isInitialized = true;
  }

  // Load all game data from backend
  async function loadAllFromBackend() {
    if (!userId || userId.startsWith('guest_')) return;

    try {
      // Get list of all files in localStorage
      const gdFiles = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('GDJS_')) {
          gdFiles.push(key.replace('GDJS_', ''));
        }
      }

      // Load each file from backend
      for (const file of gdFiles) {
        const response = await fetch(`${API_URL}?userId=${encodeURIComponent(userId)}&file=${encodeURIComponent(file)}`);
        const result = await response.json();

        if (result.success && result.exists && result.data) {
          // Merge backend data with local data (backend takes priority)
          const localData = getLocalData(file);
          const mergedData = deepMerge(localData, result.data);
          saveLocalData(file, mergedData);
          console.log(`Loaded game data from server for file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error loading game data from server:', error);
    }
  }

  // Save to backend (debounced)
  function syncToBackend(file, data) {
    if (!userId || userId.startsWith('guest_')) return;

    // Clear existing timeout for this file
    if (syncTimeouts[file]) {
      clearTimeout(syncTimeouts[file]);
    }

    // Set new timeout
    syncTimeouts[file] = setTimeout(async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            file,
            data
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log(`Game data synced to server for file: ${file}`);
        } else {
          console.error('Failed to sync game data:', result.error);
        }
      } catch (error) {
        console.error('Error syncing game data to server:', error);
      }
    }, SYNC_DEBOUNCE_MS);
  }

  // Helper functions
  function getLocalData(file) {
    try {
      const item = localStorage.getItem('GDJS_' + file);
      return item ? JSON.parse(item) : {};
    } catch (e) {
      console.error('Error parsing local data:', e);
      return {};
    }
  }

  function saveLocalData(file, data) {
    try {
      localStorage.setItem('GDJS_' + file, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving local data:', e);
    }
  }

  function deepMerge(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Override the GDevelop storage functions to add backend sync
  if (typeof gdjs !== 'undefined' && gdjs.evtTools && gdjs.evtTools.storage) {
    const originalWrite = {
      writeNumber: gdjs.evtTools.storage.writeNumberInJSONFile,
      writeString: gdjs.evtTools.storage.writeStringInJSONFile,
      deleteElement: gdjs.evtTools.storage.deleteElementFromJSONFile,
      clearFile: gdjs.evtTools.storage.clearJSONFile,
      unloadFile: gdjs.evtTools.storage.unloadJSONFile
    };

    // Wrap writeNumberInJSONFile
    gdjs.evtTools.storage.writeNumberInJSONFile = function(filename, path, value) {
      const result = originalWrite.writeNumber.apply(this, arguments);
      const data = getLocalData(filename);
      syncToBackend(filename, data);
      return result;
    };

    // Wrap writeStringInJSONFile
    gdjs.evtTools.storage.writeStringInJSONFile = function(filename, path, value) {
      const result = originalWrite.writeString.apply(this, arguments);
      const data = getLocalData(filename);
      syncToBackend(filename, data);
      return result;
    };

    // Wrap deleteElementFromJSONFile
    gdjs.evtTools.storage.deleteElementFromJSONFile = function(filename, path) {
      const result = originalWrite.deleteElement.apply(this, arguments);
      const data = getLocalData(filename);
      syncToBackend(filename, data);
      return result;
    };

    // Wrap clearJSONFile
    gdjs.evtTools.storage.clearJSONFile = function(filename) {
      const result = originalWrite.clearFile.apply(this, arguments);
      syncToBackend(filename, {});
      return result;
    };

    // Wrap unloadJSONFile to sync before unloading
    gdjs.evtTools.storage.unloadJSONFile = function(filename) {
      const data = getLocalData(filename);
      syncToBackend(filename, data);
      return originalWrite.unloadFile.apply(this, arguments);
    };

    console.log('Game storage bridge initialized - changes will sync to database');
  }

  // Initialize user on page load
  window.addEventListener('DOMContentLoaded', initializeUser);

  // Expose functions for manual control
  window.GumbuoStorageBridge = {
    changeUser: function(newUserId) {
      if (newUserId && newUserId.trim()) {
        userId = newUserId.trim().toLowerCase();
        sessionStorage.setItem('gumbuo_game_user_id', userId);
        console.log('User changed to:', userId);
        loadAllFromBackend();
      }
    },
    getCurrentUser: function() {
      return userId;
    },
    forceSync: function(filename) {
      const data = getLocalData(filename);
      syncToBackend(filename, data);
    },
    logout: function() {
      sessionStorage.removeItem('gumbuo_game_user_id');
      userId = null;
      isInitialized = false;
      console.log('Logged out - reload page to login again');
    }
  };
})();
