import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

@customElement('apple-tv-keyboard')
export class AppleTvKeyboard extends BaseKeyboard {
  // Map Enter to Apple TV "select"
  keyMap = { Enter: 'select' };
  inputMap = { insertLineBreak: 'select' };

  // Keep dialog open in "keyboard" mode (Textbox has a Send button)
  closeOnEnter = false;
  searchReady = false;

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    // Replace-on-send for Textbox, append per-keystroke for Keyboard
    this.replaceOnSend = this.action?.action === 'textbox';
  }

  private send(commands: string[]) {
    // Ensure this.action.device is your Apple TV remote entity (e.g. remote.lounge_apple_tv)
    this.hass.callService('remote', 'send_command', {
      entity_id: this.action.device,
      command: commands,
    });
  }

  private clean(text: string) {
    return (text ?? '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ');
  }

  sendText(text: string) {
    const t = this.clean(text);
    if (!t) return;

    if (this.action.action === 'textbox') {
      // Replace the entire text field on the Apple TV
      this.send([`keyboard.text_set ${t}`]);
    } else {
      // Append as the user types
      this.send([`keyboard.text_append ${t}`]);
    }
  }

  sendKey(key: string) {
    if (key === 'select') this.send(['select']);
    // If you want arrows later:
    // if (key === 'left') this.send(['left']);
    // if (key === 'right') this.send(['right']);
    // if (key === 'up') this.send(['up']);
    // if (key === 'down') this.send(['down']);
  }

  sendSearch(_text: string) {
    // No dedicated search pipe for Apple TV here
  }
}
