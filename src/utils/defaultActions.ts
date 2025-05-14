import { IElementConfig, Platform, Platforms } from '../models/interfaces';
import {
	androidTVDefaultKeys,
	androidTVDefaultSources,
	appleTVDefaultKeys,
	appleTVDefaultSources,
	braviaTVDefaultKeys,
	braviaTVDefaultSources,
	fireTVDefaultKeys,
	fireTVDefaultSources,
	jellyfinTVDefaultKeys,
	kodiDefaultKeys,
	philipsTVDefaultKeys,
	rokuDefaultKeys,
	rokuDefaultSources,
	samsungTVDefaultKeys,
	samsungTVDefaultSources,
	unifiedRemoteDefaultKeys,
	webosDefaultKeys,
	webosDefaultSources,
} from '../models/maps';

export function getDefaultActions(platform: Platform) {
	let defaultKeys: IElementConfig[];
	let defaultSources: IElementConfig[];
	switch (platform) {
		case 'Generic Remote':
			const names: string[] = [];
			defaultKeys = [
				{
					type: 'touchpad',
					name: 'touchpad',
					tap_action: {
						action: 'key',
						key: 'center',
					},
					up: {
						tap_action: { action: 'key', key: 'up' },
						hold_action: { action: 'repeat' },
					},
					down: {
						tap_action: { action: 'key', key: 'down' },
						hold_action: { action: 'repeat' },
					},
					left: {
						tap_action: { action: 'key', key: 'left' },
						hold_action: { action: 'repeat' },
					},
					right: {
						tap_action: { action: 'key', key: 'right' },
						hold_action: { action: 'repeat' },
					},
				},
				{
					type: 'touchpad',
					name: 'dragpad',
					tap_action: {
						action: 'key',
						key: 'center',
					},
					drag_action: {
						action: 'key',
						key: '{{ ("right" if deltaX > 0 else "left") if (deltaX | abs) > (deltaY | abs) else ("down" if deltaY > 0 else "up") }}',
						repeat_delay: 100,
					},
					multi_drag_action: {
						action: 'key',
						key: '{{ ("right" if deltaX > 0 else "left") if (deltaX | abs) > (deltaY | abs) else ("down" if deltaY > 0 else "up") }}',
						repeat_delay: 50,
					},
					up: {},
					down: {},
					left: {},
					right: {},
					icon: 'mdi:drag-variant',
				},
			];
			defaultSources = [];
			for (const p of Platforms.filter((p) => p != 'Generic Remote')) {
				const [keys, sources] = getDefaultActions(p);
				for (const key of keys) {
					if (key.type == 'button' && !names.includes(key.name)) {
						names.push(key.name);
						const action: IElementConfig = {
							type: 'button',
							name: key.name,
							icon: key.icon,
							tap_action: { action: 'key', key: key.name },
						};
						if (key.hold_action) {
							action.hold_action = key.hold_action;
						}
						defaultKeys.push(action);
					}
				}
				for (const source of sources) {
					if (!names.includes(source.name)) {
						names.push(source.name);
						const action: IElementConfig = {
							type: 'button',
							name: source.name,
							icon: source.icon,
							tap_action: { action: 'key', key: source.name },
						};
						if (source.hold_action) {
							action.hold_action = source.hold_action;
						}
						defaultSources.push(action);
					}
				}
			}
			break;
		case 'Unified Remote':
			defaultKeys = unifiedRemoteDefaultKeys;
			defaultSources = [];
			break;
		case 'LG webOS':
			defaultKeys = webosDefaultKeys;
			defaultSources = webosDefaultSources;
			break;
		case 'Samsung TV':
			defaultKeys = samsungTVDefaultKeys;
			defaultSources = samsungTVDefaultSources;
			break;
		case 'Philips TV':
			defaultKeys = philipsTVDefaultKeys;
			defaultSources = [];
			break;
		case 'Jellyfin':
			defaultKeys = jellyfinTVDefaultKeys;
			defaultSources = [];
			break;
		case 'Kodi':
			defaultKeys = kodiDefaultKeys;
			defaultSources = [];
			break;
		case 'Roku':
			defaultKeys = rokuDefaultKeys;
			defaultSources = rokuDefaultSources;
			break;
		case 'Apple TV':
			defaultKeys = appleTVDefaultKeys;
			defaultSources = appleTVDefaultSources;
			break;
		case 'Fire TV':
			defaultKeys = fireTVDefaultKeys;
			defaultSources = fireTVDefaultSources;
			break;
		case 'Sony BRAVIA':
			defaultKeys = braviaTVDefaultKeys;
			defaultSources = braviaTVDefaultSources;
			break;
		case 'Android TV':
		default:
			defaultKeys = androidTVDefaultKeys;
			defaultSources = androidTVDefaultSources;
			break;
	}
	return [defaultKeys, defaultSources];
}
