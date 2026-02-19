// ═══════════════════════════════════════════════════════════════════════
//  INPUT MANAGER - Abstraction layer for input handling
//  Phase 1: Foundation Enhancement
// ═══════════════════════════════════════════════════════════════════════

/**
 * InputManager provides a mode-agnostic input handling system.
 * Modes can query input state without directly handling events.
 */
export class InputManager {
  constructor() {
    this.keys = new Set();
    this.keysPressed = new Set(); // Keys pressed this frame
    this.keysReleased = new Set(); // Keys released this frame
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = new Set();
    this.mousePressed = new Set();
    this.mouseReleased = new Set();

    // Gamepad: tracks keys held via gamepad so they can be cleared each frame
    this._gpHeldKeys = new Set();
    // Track previous gamepad button states to detect press edges
    this._gpPrevButtons = [];

    this.setupListeners();
  }

  setupListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.key)) {
        this.keysPressed.add(e.key);
      }
      this.keys.add(e.key);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
      this.keysReleased.add(e.key);
    });

    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.mouseButtons.has(e.button)) {
        this.mousePressed.add(e.button);
      }
      this.mouseButtons.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
      this.mouseReleased.add(e.button);
    });

    // Touch (for mobile)
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mousePos.x = touch.clientX;
        this.mousePos.y = touch.clientY;
        this.mousePressed.add(0); // Treat as left mouse button
        this.mouseButtons.add(0);
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mousePos.x = touch.clientX;
        this.mousePos.y = touch.clientY;
      }
    });

    window.addEventListener('touchend', () => {
      this.mouseButtons.delete(0);
      this.mouseReleased.add(0);
    });
  }

  /**
   * Check if a key is currently held down
   * @param {string} key - The key to check
   * @returns {boolean}
   */
  isKeyDown(key) {
    return this.keys.has(key);
  }

  /**
   * Check if a key was just pressed this frame
   * @param {string} key - The key to check
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keysPressed.has(key);
  }

  /**
   * Check if a key was just released this frame
   * @param {string} key - The key to check
   * @returns {boolean}
   */
  isKeyReleased(key) {
    return this.keysReleased.has(key);
  }

  /**
   * Check if any of the given keys are down
   * @param {Array<string>} keys - Array of keys to check
   * @returns {boolean}
   */
  isAnyKeyDown(keys) {
    return keys.some(key => this.keys.has(key));
  }

  /**
   * Check if mouse button is down (0=left, 1=middle, 2=right)
   * @param {number} button - Mouse button number
   * @returns {boolean}
   */
  isMouseDown(button = 0) {
    return this.mouseButtons.has(button);
  }

  /**
   * Check if mouse button was just pressed
   * @param {number} button - Mouse button number
   * @returns {boolean}
   */
  isMousePressed(button = 0) {
    return this.mousePressed.has(button);
  }

  /**
   * Get current mouse position
   * @returns {{x: number, y: number}}
   */
  getMousePos() {
    return { ...this.mousePos };
  }

  /**
   * Get mouse position relative to canvas
   * @param {HTMLCanvasElement} canvas
   * @returns {{x: number, y: number}}
   */
  getCanvasMousePos(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: this.mousePos.x - rect.left,
      y: this.mousePos.y - rect.top,
    };
  }

  /**
   * Clear frame-specific input (call at end of frame)
   */
  clearFrameInput() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mousePressed.clear();
    this.mouseReleased.clear();
  }

  /**
   * Get directional input (-1, 0, or 1 for x and y)
   * Supports WASD and Arrow keys. Checks both currently-held keys
   * and just-pressed keys so brief taps also register (needed for
   * grid-based discrete movement in fast environments).
   * @returns {{x: number, y: number}}
   */
  getDirectionalInput() {
    let x = 0;
    let y = 0;

    const active = (k) => this.keys.has(k) || this.keysPressed.has(k);

    // Horizontal
    if (['ArrowLeft', 'a', 'A'].some(active)) x -= 1;
    if (['ArrowRight', 'd', 'D'].some(active)) x += 1;

    // Vertical
    if (['ArrowUp', 'w', 'W'].some(active)) y -= 1;
    if (['ArrowDown', 's', 'S'].some(active)) y += 1;

    return { x, y };
  }

  /**
   * Check for common actions
   * @returns {Object} Object with action flags
   */
  getActions() {
    return {
      pause: this.isKeyPressed('Escape'),
      help: this.isKeyPressed('h') || this.isKeyPressed('H'),
      confirm: this.isKeyPressed('Enter') || this.isKeyPressed(' '),
      cancel: this.isKeyPressed('Escape'),
    };
  }

  /**
   * Poll the Gamepad API and inject directional + action keys for the current
   * frame. Call once per frame before processing input.
   *
   * Mapping (first connected gamepad):
   *   Left stick / D-pad  → ArrowLeft/Right/Up/Down
   *   A (button 0)        → Enter
   *   B (button 1)        → Escape
   *   X (button 2)        → Space (action / pulse)
   *   Y (button 3)        → j     (archetype)
   *   LB (button 4)       → Shift
   *   Start (button 9)    → Escape
   */
  pollGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

    // Clear keys that were held via gamepad last frame
    for (const k of this._gpHeldKeys) {
      this.keys.delete(k);
    }
    this._gpHeldKeys.clear();

    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (!gp || !gp.connected) continue;

      const DEADZONE = 0.42;
      const ax = gp.axes[0] || 0;  // horizontal
      const ay = gp.axes[1] || 0;  // vertical

      // Directional mappings: [condition, key]
      const dirMap = [
        [ax < -DEADZONE || gp.buttons[14]?.pressed,  'ArrowLeft'],
        [ax >  DEADZONE || gp.buttons[15]?.pressed,  'ArrowRight'],
        [ay < -DEADZONE || gp.buttons[12]?.pressed,  'ArrowUp'],
        [ay >  DEADZONE || gp.buttons[13]?.pressed,  'ArrowDown'],
      ];
      for (const [active, key] of dirMap) {
        if (active) {
          if (!this.keys.has(key)) this.keysPressed.add(key);
          this.keys.add(key);
          this._gpHeldKeys.add(key);
        }
      }

      // Button press edges (only fire keysPressed on transition low→high)
      const buttonMap = [
        [0, 'Enter'],    // A
        [1, 'Escape'],   // B
        [2, ' '],        // X
        [3, 'j'],        // Y → archetype
        [4, 'Shift'],    // LB → matrix toggle
        [9, 'Escape'],   // Start
      ];
      const prev = this._gpPrevButtons;
      for (const [idx, key] of buttonMap) {
        const nowPressed = (gp.buttons[idx]?.value ?? 0) > 0.5;
        const wasPressed = !!prev[idx];
        if (nowPressed && !wasPressed) {
          this.keysPressed.add(key);
          this.keys.add(key);
          this._gpHeldKeys.add(key);
        } else if (!nowPressed && wasPressed) {
          this.keys.delete(key);
        }
        prev[idx] = nowPressed;
      }

      break; // Use only the first connected gamepad
    }
  }
}

export default InputManager;
