import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface QotDSettings {
	quoteApiUrl: string;
	authorProperty: string;
	textProperty: string;
}

interface QuoteOfDay {
	text: string;
	author: string;
}

const DEFAULT_SETTINGS: QotDSettings = {
	quoteApiUrl: "https://type.fit/api/quotes",
	authorProperty: "author",
	textProperty: "text",
};

export default class QuoteOfTheDay extends Plugin {
	settings: QotDSettings;

	getRandomItem = (data: Array<any>) => {
		return data[Math.floor(Math.random() * data.length)];
	};

	getQuote = (data: any) => {
		let quotes = new Array<Object>();
		if (Array.isArray(data)) {
			quotes = data;
		} else {
			quotes = [...quotes, data];
		}
		let quote = this.getRandomItem(quotes);

		let qod: QuoteOfDay = {
			author: quote[this.settings.authorProperty],
			text: quote[this.settings.textProperty],
		};

		return qod;
	};

	getMarkdownFromQuote = (qod: QuoteOfDay) => {
		const text = `
> ${qod.text}
>
> &mdash; <cite>${qod.author}</cite>`;
		return text;
	};

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "qotd-editor-command",
			name: "Insert Quote of the Day",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				let qod: QuoteOfDay = {
					text: "Oops, I did it again 🙊",
					author: "Britney Error 😢",
				};
				try {
					let response = await fetch(this.settings.quoteApiUrl);
					let data = await response.json();
					qod = this.getQuote(data);
				} catch (err) {
					console.log(err);
					new Notice(err.message);
				}
				editor.replaceSelection(this.getMarkdownFromQuote(qod));
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
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Quote of the Day Settings" });

		new Setting(containerEl)
			.setName("Quote API URL")
			.setDesc("URL of the quote API to use")
			.addText((text) =>
				text
					.setPlaceholder("Enter Quote API Url")
					.setValue(this.plugin.settings.quoteApiUrl)
					.onChange(async (value) => {
						console.log("New Url: " + value);
						this.plugin.settings.quoteApiUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Author Property")
			.setDesc("API response property for quote author")
			.addText((text) =>
				text
					.setPlaceholder("API response property for quote author")
					.setValue(this.plugin.settings.authorProperty)
					.onChange(async (value) => {
						console.log("New author property: " + value);
						this.plugin.settings.authorProperty = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Text Property")
			.setDesc("API response property for quote text")
			.addText((text) =>
				text
					.setPlaceholder("API response property for quote text")
					.setValue(this.plugin.settings.textProperty)
					.onChange(async (value) => {
						console.log("New text property: " + value);
						this.plugin.settings.textProperty = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
