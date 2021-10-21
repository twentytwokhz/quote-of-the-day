import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from "obsidian";

interface QotDSettings {
	quoteApiUrl: string;
}

interface QuoteOfDay {
	text: string,
	author: string
}

const DEFAULT_SETTINGS: QotDSettings = {
	quoteApiUrl: "https://type.fit/api/quotes",
};

export default class QuoteOfTheDay extends Plugin {
	settings: QotDSettings;

	random_item = (data: Array<QuoteOfDay>) => {
		return data[Math.floor(Math.random() * data.length)];
	};

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "qotd-editor-command",
			name: "Insert Quote of the Day",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				let qod = {
					text: 'Oops, I did it again 🙊',
					author: 'Britney Error 😢'
				};
				try { 
					let response = await fetch(this.settings.quoteApiUrl);
					let data = await response.json();
					
					qod = this.random_item(data);
				}
				catch (err) {
					console.log(err);
				}
				let text = `
> ${qod.text}
>
> &mdash; <cite>${qod.author}</cite>`;
				editor.replaceSelection(text);
			},
			hotkeys: [
				{
					modifiers: ["Ctrl", "Shift"],
					key: "Q",
				},
			],
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QotDSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class QotDSettingsTab extends PluginSettingTab {
	plugin: QuoteOfTheDay;

	constructor(app: App, plugin: QuoteOfTheDay) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Quote of the Day Settings'});

		new Setting(containerEl)
			.setName('Quote API URL')
			.setDesc('URL of the quote API to use')
			.addText(text => text
				.setPlaceholder('Enter Quote API Url')
				.setValue(this.plugin.settings.quoteApiUrl)
				.onChange(async (value) => {
					console.log('New Url: ' + value);
					this.plugin.settings.quoteApiUrl = value;
					await this.plugin.saveSettings();
				}));
	}
}