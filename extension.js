const Main = imports.ui.main;
const { GObject, St, Clutter } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const getInputSourceManager = imports.ui.status.keyboard.getInputSourceManager;

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

function init() {

}

function enable() {
	panelButton = new LangSwitchBtn();
	panelButton.enable();
}

function disable() {
	panelButton.disable();
	panelButton = null;
}