import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

@customElement('apple-tv-keyboard')
export class AppleTvKeyboard extends BaseKeyboard {
  keyMap = { Enter: 'select' };
  inputMap = { insertLineBreak: 'select' };
  closeOnEnter = false;
  searchReady = false;

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    // Textbox replaces, Keyboard appends per-keystroke
    this.replaceOnSend = this.action?.action === 'textbox';
  }

  private send(commands: string[]) {
    const entity =
      (this.action as any).remote_id || (this.action as any).device;

    this.hass.callService('remote', 'send_command', {
      entity_id: entity,
      command: commands, // one flat string, e.g. "keyboard.text_set Hello"
    });
  }

  private clean(text: string) {
    return (text ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\t/g, ' ')
      .trim();
  }

  sendText(text: string) {
    const t = this.clean(text);
    if (!t) return;

    if (this.action.action === 'textbox') {
      this.send([`keyboard.text_set ${t}`]);   // replace whole field
    } else {
      this.send([`keyboard.text_append ${t}`]); // append as you type
    }
  }

  sendKey(key: string) {
    if (key === 'select') this.send(['select']);
  }

  sendSearch(_text: string) {}
}
