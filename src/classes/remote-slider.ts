import { CSSResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { RANGE_MAX, RANGE_MIN, STEP, STEP_COUNT } from '../models/constants';
import { ISliderConfig } from '../models/interfaces';
import { getNumericPixels } from '../utils/styles';
import { BaseRemoteElement } from './base-remote-element';

@customElement('remote-slider')
export class RemoteSlider extends BaseRemoteElement {
	@property() config!: ISliderConfig;

	@state() thumbOffset: number = 0;
	@state() sliderOn: boolean = true;
	@state() pressed: boolean = false;

	range: [number, number] = [RANGE_MIN, RANGE_MAX];
	step: number = STEP;

	vertical: boolean = false;
	thumbWidth: number = 48;
	resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			this.featureWidth = this.vertical
				? entry.contentRect.height
				: entry.contentRect.width;
			this.featureHeight = this.vertical
				? entry.contentRect.width
				: entry.contentRect.height;
			this.setThumbOffset();
		}
	});
	rtl: boolean = false;

	set _value(value: string | number | boolean | undefined) {
		value = Math.max(
			Math.min(Number(value) ?? this.range[0], this.range[1]),
			this.range[0],
		);
		if (!this.precision) {
			value = Math.trunc(value as number);
		}
		this.value = value;
	}

	endAction() {
		super.endAction();
		this.pressed = false;
	}

	onPointerDown(e: PointerEvent) {
		super.onPointerDown(e);
		const slider = e.currentTarget as HTMLInputElement;
		this.pressed = true;

		if (!this.swiping) {
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;
			this._value = slider.value;
			this.setThumbOffset();
			this.sliderOn = true;
		}
	}

	async onPointerUp(e: PointerEvent) {
		this.setThumbOffset();
		const slider = e.currentTarget as HTMLInputElement;
		this.pressed = false;

		if (!this.swiping && this.pointers) {
			this._value = slider.value;
			this.fireHapticEvent('light');
			await this.sendAction('tap_action');
		} else {
			this.getValueFromHass = true;
			this.setValue();
			this.setThumbOffset();
			this.setSliderState();
		}

		this.endAction();
		this.resetGetValueFromHass();
	}

	onPointerMove(e: PointerEvent) {
		super.onPointerMove(e);
		const slider = e.currentTarget as HTMLInputElement;

		// Disable swipe detection for vertical sliders
		if (!this.vertical && this.pointers) {
			// Only consider significant enough movement
			const sensitivity = 50;
			if (
				Math.abs((this.currentX ?? 0) - (this.initialX ?? 0)) <
				Math.abs((this.currentY ?? 0) - (this.initialY ?? 0)) -
					sensitivity
			) {
				this.swiping = true;
				this.getValueFromHass = true;
				this.setValue();
				this.setThumbOffset();
				this.setSliderState();
			} else {
				this._value = slider.value;
			}
		} else {
			this._value = slider.value;
		}
	}

	setValue() {
		super.setValue();
		if (this.getValueFromHass) {
			this._value = this.value;
		}
	}

	setThumbOffset() {
		const maxOffset = (this.featureWidth - this.thumbWidth) / 2;
		this.thumbOffset = Math.min(
			Math.max(
				Math.round(
					((this.featureWidth - this.thumbWidth) /
						(this.range[1] - this.range[0])) *
						((this.value as number) -
							(this.range[0] + this.range[1]) / 2),
				),
				-1 * maxOffset,
			),
			maxOffset,
		);
	}

	setSliderState() {
		this.sliderOn =
			!(
				this.value == undefined ||
				['off', 'idle', null, undefined].includes(
					this.hass.states[this.entityId as string]?.state,
				)
			) || ((this.value as number) ?? this.range[0]) > this.range[0];
	}

	setSliderStyles() {
		let height, width;
		const containerElement = this.shadowRoot?.querySelector('.container');
		if (containerElement) {
			const style = getComputedStyle(containerElement);
			height = style.getPropertyValue('height');
			width = style.getPropertyValue('width');
		}

		const tooltipLabel = `'${this.renderTemplate(
			'{{ value }}{{ unit }}',
		)}'`;
		let tooltipTransform: string;
		let iconTransform: string;
		if (this.vertical) {
			tooltipTransform = `translate(calc(-0.3 * ${
				width ?? 'var(--height)'
			} - 0.8em - 18px), calc(-1 * var(--thumb-offset)))`;
			iconTransform = 'translateY(calc(-1 * var(--thumb-offset)))';
		} else {
			tooltipTransform = `translate(var(--thumb-offset), calc(-0.5 * ${
				height ?? 'var(--height)'
			} - 0.4em - 10px))`;
			iconTransform = 'translateX(var(--thumb-offset))';
		}

		this.style.setProperty('--feature-height', `${this.featureHeight}px`);
		this.style.setProperty('--feature-width', `${this.featureWidth}px`);

		this.style.setProperty('--tooltip-label', tooltipLabel);
		this.style.setProperty('--tooltip-transform', tooltipTransform);
		this.style.setProperty('--icon-transform', iconTransform);

		this.style.setProperty(
			'--thumb-offset',
			`calc(${this.rtl && !this.vertical ? '-1 * ' : ''}${
				this.thumbOffset
			}px)`,
		);

		if (this.vertical) {
			this.style.setProperty('width', 'fit-content');
			this.style.setProperty('align-self', 'stretch');
		}
	}

	buildBackground() {
		return html`<div class="background"></div>`;
	}

	buildTooltip() {
		return html` <div class="tooltip"></div> `;
	}

	buildThumb() {
		return html`<div class="thumb">
			<div class="active"></div>
		</div>`;
	}

	buildSlider() {
		this.setSliderState();

		return html`
			<input
				tabindex="-1"
				type="range"
				min="${this.range[0]}"
				max="${this.range[1]}"
				step=${this.step}
				value="${this.range[0]}"
				.value="${this.value}"
				@pointerdown=${this.onPointerDown}
				@pointerup=${this.onPointerUp}
				@pointermove=${this.onPointerMove}
				@pointercancel=${this.onPointerCancel}
				@pointerleave=${this.onPointerLeave}
				@contextmenu=${this.onContextMenu}
			/>
		`;
	}

	render() {
		this.setValue();

		if (this.config.range) {
			this.range[0] = parseFloat(
				(this.renderTemplate(
					this.config.range[0] as unknown as string,
				) as string) ?? RANGE_MIN,
			);
			this.range[1] = parseFloat(
				(this.renderTemplate(
					this.config.range[1] as unknown as string,
				) as string) ?? RANGE_MAX,
			);
		}

		if (this.config.step) {
			this.step = Number(this.renderTemplate(this.config.step));
		} else {
			this.step = (this.range[1] - this.range[0]) / STEP_COUNT;
		}
		const splitStep = this.step.toString().split('.');
		if (splitStep.length > 1) {
			this.precision = splitStep[1].length;
		} else {
			this.precision = 0;
		}

		this.vertical =
			this.renderTemplate(this.config.vertical ?? false) == true;
		this.rtl = getComputedStyle(this).direction == 'rtl';
		this.setThumbOffset();
		this.setSliderStyles();

		return html`
			<div
				class="container ${classMap({
					off: !this.sliderOn,
					pressed: this.pressed,
					'read-only':
						this.renderTemplate(
							this.config.tap_action?.action as string,
						) == 'none',
					rtl: this.rtl,
					vertical: this.vertical,
				})}"
			>
				${this.buildBackground()}${this.buildSlider()}
				${this.buildThumb()}${this.buildIcon(this.config.icon)}
				${this.buildLabel(this.config.label)}
			</div>
			${this.buildTooltip()}${this.buildStyles(this.config.styles)}
		`;
	}

	updated() {
		// Ensure that both the input range and div thumbs are the same size
		const thumb = this.shadowRoot?.querySelector('.thumb') as HTMLElement;
		const style = getComputedStyle(thumb);
		const userThumbWidth = style.getPropertyValue('--thumb-width');

		let pixels: number;
		if (userThumbWidth) {
			pixels = getNumericPixels(userThumbWidth);
		} else {
			const height = style.getPropertyValue('height');
			pixels = getNumericPixels(height);
		}
		if (!isNaN(pixels) && pixels) {
			this.thumbWidth = pixels;
			this.style.setProperty('--thumb-width', `${this.thumbWidth}px`);
		}
	}

	async onKeyDown(e: KeyboardEvent) {
		const keys = this.vertical
			? ['ArrowDown', 'ArrowUp']
			: ['ArrowLeft', 'ArrowRight'];
		if (keys.includes(e.key)) {
			e.preventDefault();
			this.getValueFromHass = false;
			this._value = Math.min(
				Math.max(
					parseFloat((this.value ?? this.range[0]) as string) +
						(e.key == keys[!this.vertical && this.rtl ? 1 : 0]
							? -1
							: 1) *
							this.step,
					this.range[0],
				),
				this.range[1],
			);
		}
	}

	async onKeyUp(e: KeyboardEvent) {
		const keys = this.vertical
			? ['ArrowDown', 'ArrowUp']
			: ['ArrowLeft', 'ArrowRight'];
		if (keys.includes(e.key)) {
			e.preventDefault();
			await this.sendAction('tap_action');
			this.endAction();
			this.resetGetValueFromHass();
		}
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.resizeObserver.observe(this);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		this.resizeObserver.disconnect();
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				:host {
					display: flex;
					flex-flow: column;
					flex-grow: 0;
					place-content: center space-evenly;
					align-items: center;
					position: relative;
					height: unset;
					width: 100%;
					border: none;
					border-radius: 25px;
					padding: 0px;
					box-sizing: border-box;
					line-height: 0;
					outline: 0px;
					overflow: visible;
					font-size: inherit;
					color: inherit;
					pointer-events: none;
					transition: box-shadow 180ms ease-in-out;

					--color: var(--primary-text-color);
					--height: 48px;
				}
				:host(:focus-visible) {
					box-shadow: 0 0 0 2px
						var(--icon-color, var(--primary-text-color));
				}

				.container {
					all: inherit;
					overflow: hidden;
					height: var(--height);
					align-self: center;
					color: var(
						--background,
						var(
							--lovelace-background,
							var(--primary-background-color)
						)
					);
				}

				.background {
					position: absolute;
					width: 100%;
					height: var(--background-height, 100%);
					background: var(
						--background,
						var(
							--lovelace-background,
							var(--primary-background-color)
						)
					);
				}

				input {
					position: absolute;
					appearance: none;
					-webkit-appearance: none;
					-moz-appearance: none;
					height: inherit;
					width: inherit;
					background: none;
					overflow: hidden;
					touch-action: pan-y;
					pointer-events: all;
					cursor: pointer;
				}
				input:focus-visible {
					outline: none;
				}

				::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: var(--height, 48px);
					width: var(--thumb-width, 12px);
					opacity: 0;
				}
				::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: var(--height, 48px);
					width: var(--thumb-width, 12px);
					opacity: 0;
				}

				.thumb {
					height: var(--height, 48px);
					width: var(--thumb-width, 48px);
					border-radius: var(
						--thumb-border-radius,
						var(--height, 48px)
					);
					background: var(--color);
					opacity: var(--opacity, 1);
					position: absolute;
					pointer-events: none;
					translate: var(--thumb-offset) 0;
					transition:
						translate 180ms ease-in-out,
						background 180ms ease-in-out;
				}
				.thumb .active {
					height: 100%;
					width: 100vw;
					position: absolute;
					right: calc(var(--thumb-width) / 2);
					background: inherit;
				}

				.tooltip {
					background: var(--clear-background-color);
					color: var(--primary-text-color);
					position: absolute;
					border-radius: 0.8em;
					padding: 0.2em 0.4em;
					height: 20px;
					width: fit-content;
					line-height: 20px;
					transform: var(--tooltip-transform);
					display: var(--tooltip-display);
					transition: opacity 180ms ease-in-out 0s;
					opacity: 0;
				}
				.tooltip::after {
					content: var(--tooltip-label, 0);
				}

				.icon {
					color: var(
						--icon-color,
						var(
							--background,
							var(
								--lovelace-background,
								var(--primary-background-color)
							)
						)
					);

					--mdc-icon-size: var(--size, 32px);
				}

				.off .thumb {
					visibility: hidden;
				}

				.pressed .thumb {
					transition: background 180ms ease-in-out;
				}
				.pressed ~ .tooltip {
					transition: opacity 540ms ease-in-out 0s;
					opacity: 1;
				}

				.read-only input {
					pointer-events: none;
					cursor: default;
				}

				.rtl ::-webkit-slider-thumb {
					scale: -1;
				}
				.rtl ::-moz-range-thumb {
					scale: -1;
				}
				.rtl .thumb {
					scale: -1;
				}

				.vertical.container {
					height: var(--feature-width);
					width: var(--height);
				}
				.vertical .background {
					rotate: 270deg;
					width: var(--feature-width);
					height: var(
						--background-height,
						var(--feature-height)
					) !important;
				}
				.vertical input {
					rotate: 270deg;
					height: var(--feature-height);
					width: var(--feature-width);
					touch-action: none;
				}
				.vertical .thumb {
					translate: 0 calc(-1 * var(--thumb-offset));
					rotate: 270deg;
				}
				.vertical .thumb .active {
					width: 100vh;
				}

				.rtl.vertical .background,
				.rtl.vertical input,
				.rtl.vertical .thumb {
					rotate: 90deg;
				}
			`,
		];
	}
}
