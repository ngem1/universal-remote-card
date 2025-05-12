import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

@customElement('roku-keyboard')
export class RokuKeyboard extends BaseKeyboard {
	keyMap = {
		Backspace: 'backspace',
		Enter: 'enter',
	};
	inputMap = {
		deleteContentBackward: 'backspace',
		insertLineBreak: 'enter',
	};

	sendText(text: string) {
		this.hass.callService('remote', 'send_command', {
			entity_id: this.action.remote_id,
			command: `Lit_${text}`,
		});
	}

	sendKey(key: string) {
		this.hass.callService('remote', 'send_command', {
			entity_id: this.action.remote_id,
			command: key,
		});
	}

	sendSearch(text: string) {
		this.hass.callService('roku', 'search', {
			entity_id: this.action.media_player_id,
			keyword: text,
		});
	}
}
