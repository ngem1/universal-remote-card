import { IElementConfig } from '../../interfaces';

/**
 * This is a list of common streaming apps, their icons, and the deep links to open them in Android TV, mostly collected from the following Home Assistant Community Forum guide.
 * Not all have been tested, if any do not work please let me know!
 * https://community.home-assistant.io/t/android-tv-remote-app-links-deep-linking-guide/567921
 */
export const androidTVDefaultSources: IElementConfig[] = [
	{
		type: 'button',
		name: 'abciview',
		tap_action: { action: 'source', source: 'iview://' },
		icon: 'abciview',
	},
	
];
