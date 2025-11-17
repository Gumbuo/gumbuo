/**
 * Login UI for Gumbuo Fighters
 * Provides a styled login modal instead of basic prompt
 */

(function() {
  'use strict';

  function createLoginUI() {
    const loginHTML = `
      <div id="gumbuo-login-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-width: 400px;
          width: 90%;
          text-align: center;
        ">
          <h2 style="
            color: white;
            margin: 0 0 10px 0;
            font-size: 28px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          ">🎮 Gumbuo Fighters</h2>
          <p style="
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 30px 0;
            font-size: 14px;
          ">Enter your username to save your progress</p>

          <input
            id="gumbuo-username-input"
            type="text"
            placeholder="Username"
            maxlength="20"
            style="
              width: 100%;
              padding: 15px;
              font-size: 16px;
              border: none;
              border-radius: 10px;
              margin-bottom: 15px;
              box-sizing: border-box;
              background: rgba(255, 255, 255, 0.95);
              color: #333;
            "
          />

          <button id="gumbuo-login-btn" style="
            width: 100%;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            background: #00ff99;
            color: #333;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 10px;
          ">Start Playing</button>

          <button id="gumbuo-guest-btn" style="
            width: 100%;
            padding: 12px;
            font-size: 14px;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 10px;
            background: transparent;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
          ">Play as Guest (No Save)</button>

          <p style="
            color: rgba(255, 255, 255, 0.7);
            margin: 20px 0 0 0;
            font-size: 12px;
          ">Your progress will be saved to the cloud</p>
        </div>
      </div>
    `;

    // Add to page
    const div = document.createElement('div');
    div.innerHTML = loginHTML;
    document.body.appendChild(div.firstElementChild);

    // Add hover effects
    const loginBtn = document.getElementById('gumbuo-login-btn');
    const guestBtn = document.getElementById('gumbuo-guest-btn');
    const usernameInput = document.getElementById('gumbuo-username-input');

    loginBtn.addEventListener('mouseover', () => {
      loginBtn.style.background = '#00cc77';
      loginBtn.style.transform = 'scale(1.05)';
    });

    loginBtn.addEventListener('mouseout', () => {
      loginBtn.style.background = '#00ff99';
      loginBtn.style.transform = 'scale(1)';
    });

    guestBtn.addEventListener('mouseover', () => {
      guestBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      guestBtn.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    });

    guestBtn.addEventListener('mouseout', () => {
      guestBtn.style.background = 'transparent';
      guestBtn.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });

    // Focus input
    usernameInput.focus();

    // Return a promise that resolves with the username
    return new Promise((resolve) => {
      const handleLogin = () => {
        const username = usernameInput.value.trim();
        if (username) {
          removeLoginUI();
          resolve(username);
        } else {
          usernameInput.style.border = '2px solid #ff4444';
          setTimeout(() => {
            usernameInput.style.border = 'none';
          }, 500);
        }
      };

      const handleGuest = () => {
        removeLoginUI();
        resolve(null); // null indicates guest mode
      };

      loginBtn.addEventListener('click', handleLogin);
      guestBtn.addEventListener('click', handleGuest);

      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleLogin();
        }
      });
    });
  }

  function removeLoginUI() {
    const overlay = document.getElementById('gumbuo-login-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
  }

  // Export for use by storage-bridge.js
  window.GumbuoLoginUI = {
    show: createLoginUI,
    hide: removeLoginUI
  };
})();
