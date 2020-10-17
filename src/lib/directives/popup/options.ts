export const defaultOptions = {
	'placement': 'top',
	'autoPlacement': true,
	'contentType': 'string',
	'showDelay': 0,
	'hideDelay': 300,
	'hideDelayMobile': 0,
	'hideDelayTouchscreen': 0,
	'zIndex': 0,
	'animationDuration': 300,
	'animationDurationDefault': 300,
	'trigger': 'hover',
	'popupClass': '',
	'display': true,
	'displayMobile': true,
	'displayTouchscreen': true,
	'shadow': true,
	'theme': 'light',
	'offset': 8,
	'maxWidth': '',
	'id': false,
	'hideDelayAfterClick': 2000
}

export const backwardCompatibilityOptions = {
    'delay': 'showDelay',
    'show-delay': 'showDelay',
    'hide-delay': 'hideDelay',
    'hide-delay-mobile': 'hideDelayTouchscreen',
    'hideDelayMobile': 'hideDelayTouchscreen',
    'z-index': 'zIndex',
    'animation-duration': 'animationDuration',
    'animation-duration-default': 'animationDurationDefault',
    'popup-class': 'PopupClass',
    'display-mobile': 'displayTouchscreen',
    'displayMobile': 'displayTouchscreen',
    'max-width': 'maxWidth'
}