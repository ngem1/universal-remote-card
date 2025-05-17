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
			<div class="circlepad">
				<remote-button
					class="direction"
					id="up"
					title="Up"
					part="up"
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
						part="left"
						tabindex="-1"
						.hass=${this.hass}
						.config=${{
							entity_id: this.config.entity_id,
							autofill_default_fields:
								this.config.autofill_entity_id,
							haptics: this.config.haptics,
							...this.config.left,
						}}
						.icons=${this.icons}
					></remote-button>
					<remote-button
						id="center"
						title="Center"
						part="center"
						tabindex="-1"
						.hass=${this.hass}
						.config=${this.config ?? {}}
						.icons=${this.icons}
					></remote-button>
					<remote-button
						class="direction"
						id="right"
						title="Right"
						part="right"
						tabindex="-1"
						.hass=${this.hass}
						.config=${{
							entity_id: this.config.entity_id,
							autofill_default_fields:
								this.config.autofill_entity_id,
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
					part="down"
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
			</div>
			${this.buildStyles(this.config.styles)}
		`;
	}

	async onKey(e: KeyboardEvent) {
		const id = this.key2Button[e.key];
		if (id) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const button = this.shadowRoot?.getElementById(id) as RemoteButton;
			if (button) {
				const direction = e.type == 'keydown' ? 'Down' : 'Up';
				await button[`onPointer${direction}`](
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
			button.onKey = async () => {};
		}
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				:host {
					aspect-ratio: 1 / 1;
					width: 340px;
					border-radius: 999px;
					display: flex;
					flex-direction: column;
					background: #1f1f1f;
					overflow: hidden;

					--size: min(48px, 12vw);
					--icon-color: #c4c7c5;
				}

				:host(:focus-visible) {
					box-shadow: 0 0 0 2px
						var(--icon-color, var(--primary-text-color));
				}

				.circlepad {
					all: inherit;
					max-width: 100%;
					aspect-ratio: 1 / 1;
					scale: 1;
				}

				.center-row {
					height: 48%;
					width: 100%;
					aspect-ratio: 3 / 1;
					display: flex;
					flex-direction: row;
					justify-content: space-evenly;
					align-items: center;
				}
				#center {
					aspect-ratio: 1 / 1;
					height: 100%;
					border-radius: 999px;
					background: #5e5e5e;
					z-index: 1;
				}
				#center::part(button) {
					border-radius: 999px;
				}

				.direction {
					width: 26%;
					aspect-ratio: 1 / 1;
				}

				.direction::part(button) {
					position: absolute;
					height: 200%;
					width: 200%;
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
