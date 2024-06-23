import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { getInputSourceManager } from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

let panelButton;

const LangSwitchBtn = GObject.registerClass({
}, class extends GObject.Object {
	constructor() {
		super();
		this._signalId = 0;
		this._keyboard = Main.panel.statusArea.keyboard;
		this._inputSourceManager = getInputSourceManager();
	}

	enable() {
		this._keyboard.container.hide();
		this._addButton();
	}

	disable() {
		this._keyboard.container.show();
		this._removeButton();
	}

	_addButton() {
		this._label = new St.Label({
			text: '-',
			x_expand: true,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
		});
		this._signalId = this._inputSourceManager.connect('current-source-changed', this._updateLabel.bind(this));
		this._updateLabel();

		this._panelButton = new PanelMenu.Button(0.0, 'Language Switcher', false);
		this._panelButton.add_child(this._label);
		this._panelButton.connect('button-press-event', this._switchInputMethod.bind(this));

		// Use -1 with Dash to Panel
		Main.panel.addToStatusArea('Indicator', this._panelButton, 0, 'right');
	}

	_removeButton() {
		if (this._signalId) {
			this._inputSourceManager.disconnect(this._signalId);
			this._signalId = 0;
		}

		this._label.destroy();
		this._label = null;
		this._panelButton.destroy();
		this._panelButton = null;
	}

	_updateLabel() {
		this._label.text = (this._inputSourceManager.currentSource.shortName).toUpperCase();
	}

	_switchInputMethod() {
		const numOfInputSources = Object.keys(this._inputSourceManager.inputSources).length;
		const currentInput = this._inputSourceManager.currentSource;
		const nextInput = this._inputSourceManager.inputSources[(currentInput.index + 1) % numOfInputSources];
		nextInput.activate();
	}
});

export default class extends Extension {
	enable() {
		panelButton = new LangSwitchBtn();
		panelButton.enable();
	}

	disable() {
		panelButton.disable();
		panelButton = null;
	}
}