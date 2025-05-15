import { CSSResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ICirclepadConfig } from '../models/interfaces';
import { BaseRemoteElement } from './base-remote-element';
import './remote-button';
import { RemoteButton } from './remote-button';

@customElement('remote-circlepad')
export class RemoteCirclepad extends BaseRemoteElement {
	@property() config!: ICirclepadConfig;
	key2Button: Record<string, string> = {
		ArrowUp: 'up',
		ArrowDown: 'down',
		ArrowLeft: 'left',
		ArrowRight: 'right',
		Enter: 'center',
		' ': 'center',
	};

	render() {
		return html`
			<remote-button
				class="direction"
				id="up"
				title="Up"
				part="dpad-up"
				tabindex="-1"
				.hass=${this.hass}
				.config=${{
					entity_id: this.config.entity_id,
					autofill_default_fields: this.config.autofill_entity_id,
					haptics: this.config.haptics,
					...this.config.up,
				}}
				.icons=${this.icons}
			></remote-button>
			<div class="center-row">
				<remote-button
					class="direction"
					id="left"
					title="Left"
					part="dpad-left"
					tabindex="-1"
					.hass=${this.hass}
					.config=${{
						entity_id: this.config.entity_id,
						autofill_default_fields: this.config.autofill_entity_id,
						haptics: this.config.haptics,
						...this.config.left,
					}}
					.icons=${this.icons}
				></remote-button>
				<remote-button
					id="center"
					title="Center"
					part="dpad-center"
					tabindex="-1"
					.hass=${this.hass}
					.config=${this.config ?? {}}
					.icons=${this.icons}
				></remote-button>
				<remote-button
					class="direction"
					id="right"
					title="Right"
					part="dpad-right"
					tabindex="-1"
					.hass=${this.hass}
					.config=${{
						entity_id: this.config.entity_id,
						autofill_default_fields: this.config.autofill_entity_id,
						haptics: this.config.haptics,
						...this.config.right,
					}}
					.icons=${this.icons}
				></remote-button>
			</div>
			<remote-button
				class="direction"
				id="down"
				title="Down"
				part="dpad-down"
				tabindex="-1"
				.hass=${this.hass}
				.config=${{
					entity_id: this.config.entity_id,
					autofill_default_fields: this.config.autofill_entity_id,
					haptics: this.config.haptics,
					...this.config.down,
				}}
				.icons=${this.icons}
			></remote-button>
		`;
	}

	onKey(e: KeyboardEvent) {
		const id = this.key2Button[e.key];
		if (id) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const button = this.shadowRoot?.getElementById(id) as RemoteButton;
			if (button) {
				const direction = e.type == 'keydown' ? 'Down' : 'Up';
				button[`onPointer${direction}`](
					new window.PointerEvent(
						`pointer${direction.toLowerCase()}`,
						{
							...e,
							isPrimary: true,
							clientX: 1,
							clientY: 1,
						},
					),
				);
			}
		}
	}

	firstUpdated() {
		super.firstUpdated();
		const buttons = (this.shadowRoot?.querySelectorAll('remote-button') ??
			[]) as RemoteButton[];
		for (const button of buttons) {
			button.removeAttribute('tabindex');
			button.onKey = () => {};
		}
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				:host {
					height: var(--dpad-size);
					width: var(--dpad-size);
					min-height: var(--dpad-size);
					min-width: var(--dpad-size);
					border-radius: var(--dpad-size);
					display: flex;
					flex-direction: column;
					background: #1f1f1f;
					overflow: hidden;

					--dpad-size: min(340px, 80vw);
					--center-button-size: min(160px, 40vw);
					--direction-button-size: min(177px, 50vw);
					--size: min(48px, 14vw);
					--icon-color: #c4c7c5;
				}

				:host(:focus-visible) {
					box-shadow: 0 0 0 2px
						var(--icon-color, var(--primary-text-color));
				}

				.center-row {
					display: flex;
					flex-direction: row;
					width: 100%;
					justify-content: space-evenly;
				}
				#center {
					height: var(--center-button-size);
					width: var(--center-button-size);
					border-radius: var(--center-button-size);
					background: #5e5e5e;
					z-index: 1;
				}
				#center::part(button) {
					border-radius: var(--center-button-size);
				}

				.direction::part(button) {
					position: absolute;
					height: var(--direction-button-size);
					width: var(--direction-button-size);
					border-radius: 0;
					rotate: -45deg;
				}
				.direction::part(icon),
				.direction::part(label) {
					rotate: 45deg;
				}

				:host([dir='rtl']) .center-row {
					flex-direction: row-reverse;
				}
			`,
		];
	}
}
