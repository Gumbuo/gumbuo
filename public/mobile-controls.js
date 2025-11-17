// Mobile Touch Controls for Alien Catacombs
// Adds virtual joystick and buttons for mobile gameplay

(function() {
  'use strict';

  // Only activate on touch devices
  if (!('ontouchstart' in window)) {
    return;
  }

  // Wait for game canvas to load
  function waitForCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      setTimeout(waitForCanvas, 100);
      return;
    }
    initMobileControls(canvas);
  }

  function initMobileControls(canvas) {
    // Create controls container
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'mobile-controls';
    controlsDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(controlsDiv);

    // Virtual Joystick (bottom-left)
    const joystick = createJoystick();
    controlsDiv.appendChild(joystick.container);

    // Shoot button (bottom-right, large)
    const shootBtn = createButton('FIRE', '100px', '100px', 'right: 20px; bottom: 20px;', '#ff4444');
    controlsDiv.appendChild(shootBtn);

    // Weapon switch buttons (top-right)
    const weapon1Btn = createButton('1', '60px', '60px', 'right: 20px; top: 20px;', '#4488ff');
    const weapon2Btn = createButton('2', '60px', '60px', 'right: 20px; top: 90px;', '#44ff88');
    controlsDiv.appendChild(weapon1Btn);
    controlsDiv.appendChild(weapon2Btn);

    // Setup controls
    setupJoystick(joystick, canvas);
    setupShootButton(shootBtn, canvas);
    setupWeaponButton(weapon1Btn, canvas, '1');
    setupWeaponButton(weapon2Btn, canvas, '2');
  }

  function createJoystick() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: 20px;
      bottom: 20px;
      width: 140px;
      height: 140px;
      pointer-events: auto;
    `;

    const base = document.createElement('div');
    base.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
    `;

    const stick = document.createElement('div');
    stick.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: 3px solid rgba(255, 255, 255, 0.7);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.1s;
    `;

    container.appendChild(base);
    container.appendChild(stick);

    return { container, base, stick };
  }

  function createButton(label, width, height, position, color) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.style.cssText = `
      position: absolute;
      ${position}
      width: ${width};
      height: ${height};
      border-radius: 50%;
      background: ${color};
      border: 4px solid rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      pointer-events: auto;
      user-select: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transition: transform 0.1s, opacity 0.1s;
    `;
    return btn;
  }

  function setupJoystick(joystick, canvas) {
    let isActive = false;
    let startPos = { x: 0, y: 0 };
    let currentKeys = { up: false, down: false, left: false, right: false };

    function updateJoystick(touch) {
      const rect = joystick.container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 40;

      // Clamp stick position
      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      joystick.stick.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;

      // Determine direction and send keyboard events
      const threshold = 15;
      const newKeys = {
        up: deltaY < -threshold,
        down: deltaY > threshold,
        left: deltaX < -threshold,
        right: deltaX > threshold
      };

      // Send key events for changes
      if (newKeys.up !== currentKeys.up) sendKey(canvas, 'w', newKeys.up);
      if (newKeys.down !== currentKeys.down) sendKey(canvas, 's', newKeys.down);
      if (newKeys.left !== currentKeys.left) sendKey(canvas, 'a', newKeys.left);
      if (newKeys.right !== currentKeys.right) sendKey(canvas, 'd', newKeys.right);

      currentKeys = newKeys;
    }

    function resetJoystick() {
      joystick.stick.style.transform = 'translate(-50%, -50%)';
      if (currentKeys.up) sendKey(canvas, 'w', false);
      if (currentKeys.down) sendKey(canvas, 's', false);
      if (currentKeys.left) sendKey(canvas, 'a', false);
      if (currentKeys.right) sendKey(canvas, 'd', false);
      currentKeys = { up: false, down: false, left: false, right: false };
    }

    joystick.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isActive = true;
      updateJoystick(e.touches[0]);
    });

    joystick.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (isActive) {
        updateJoystick(e.touches[0]);
      }
    });

    joystick.container.addEventListener('touchend', (e) => {
      e.preventDefault();
      isActive = false;
      resetJoystick();
    });
  }

  function setupShootButton(btn, canvas) {
    let isShooting = false;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(0.9)';
      btn.style.opacity = '0.8';

      // Send mouse click to canvas center for aiming
      sendMouseClick(canvas, true);
      isShooting = true;
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(1)';
      btn.style.opacity = '1';

      sendMouseClick(canvas, false);
      isShooting = false;
    });
  }

  function setupWeaponButton(btn, canvas, key) {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(0.9)';
      btn.style.opacity = '0.8';
      sendKey(canvas, key, true);

      setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.style.opacity = '1';
        sendKey(canvas, key, false);
      }, 150);
    });
  }

  function sendKey(canvas, key, isPressed) {
    const event = new KeyboardEvent(isPressed ? 'keydown' : 'keyup', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
      cancelable: true
    });
    canvas.dispatchEvent(event);
  }

  function sendMouseClick(canvas, isPressed) {
    const rect = canvas.getBoundingClientRect();
    const event = new MouseEvent(isPressed ? 'mousedown' : 'mouseup', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      bubbles: true,
      cancelable: true,
      button: 0
    });
    canvas.dispatchEvent(event);
  }

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForCanvas);
  } else {
    waitForCanvas();
  }
})();
