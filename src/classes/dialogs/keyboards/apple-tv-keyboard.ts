import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

@customElement('apple-tv-keyboard')
export class AppleTvKeyboard extends BaseKeyboard {
  // Map Enter to a "select" press on the Apple TV remote.
  keyMap = {
    Enter: 'select',
  };

  // We don't rely on backspace here, as HA/pyatv doesn't expose a discrete delete key
  // (we use append + textbox replace patterns instead).
  inputMap = {
    insertLineBreak: 'select',
  };

  // Keep the dialog open on Enter in "keyboard" mode; we’ll close in textbox mode.
  closeOnEnter = false;

  // For Apple TV:
  // - "keyboard" mode: append characters as you type.
  // - "textbox" mode: replace the entire text when you press Send.
  // Paste behaves like textbox (replace).
  replaceOnSend = false;

  private sendCommand(commands: string[]) {
    // NOTE: this.action.device should be the Apple TV remote entity,
    // same as used by other platform handlers in the card.
    // If your card passes a different field (e.g., action.remote_id), adjust here.
    this.hass.callService('remote', 'send_command', {
      entity_id: this.action.device,
      command: commands,
    });
  }

  // Called on each character typed in "keyboard" mode and also by textbox/paste.
  sendText(text: string) {
    // If we're in textbox mode, or a paste, we want to REPLACE:
    // BaseKeyboard calls sendText for paste and textbox button.
    // We can detect textbox vs keyboard by action.action.
    if (this.action.action === 'textbox') {
      // Replace onscreen text with the whole buffer
      this.sendCommand([`keyboard.text_set ${text}`]);
      return;
    }

    // In "keyboard" mode, append per character keystroke
    // (BaseKeyboard passes single chars for insertText/composition).
    // If a user pastes while in keyboard mode, BaseKeyboard already delays for replaceOnSend;
    // but we’ll treat it as append-by-chunk which Apple TV accepts as well.
    this.sendCommand([`keyboard.text_append ${text}`]);
  }

  sendKey(key: string) {
    if (!key) return;

    // Enter mapped to "select" on the Apple TV remote.
    if (key === 'select') {
      this.sendCommand(['select']);
      return;
    }

    // You could add more mappings if you want:
    // e.g. arrow keys during keyboard mode:
    // Left/Right/Up/Down => 'left'/'right'/'up'/'down'
    // Example:
    // if (key === 'left') this.sendCommand(['left']);
  }

  // Optional: Expose a clear action (not wired to a key by default)
  sendSearch(_text: string) {
    // Search not supported for Apple TV in this card
    // (set searchReady=false if your platform registry uses it)
  }
}
