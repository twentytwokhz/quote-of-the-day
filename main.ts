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
	quoteFormat: string;
	quoteTagFormat: string;
	showTags: boolean;
}

interface QuoteOfDay {
	content: string;
	author: string;
	tags: Array<string>;
}

const QUOTE_API_URL = "https://api.quotable.io";
const MAX_TAG_CHARS = 25;

const DEFAULT_SETTINGS: QotDSettings = {
	quoteFormat: `> {content}
>
> &mdash; <cite>{author}</cite>✍️`,
	quoteTagFormat: `>
> ---
> {tags}`,
	showTags: false,
};

export default class QuoteOfTheDay extends Plugin {
	settings: QotDSettings;

	getMarkdownFromQuote = (qod: QuoteOfDay) => {
		let text = this.settings.quoteFormat
			.replace("{content}", qod.content)
			.replace("{author}", qod.author);
		if (this.settings.showTags) {
			let tags = qod.tags.map((t) => `#${t}`).join(" ");
			let quoteTags = this.settings.quoteTagFormat.replace(
				"{tags}",
				tags
			);
			text += `
			${quoteTags}`;
		}
		return text;
	};

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "qotd-editor-command",
			name: "Insert Random Quote of the Day",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				let qod: QuoteOfDay = {
					content: "Oops, I did it again 🙊",
					author: "Britney Error 😢",
					tags: ["error"],
				};
				try {
					let response = await fetch(`${QUOTE_API_URL}/random`);
					qod = await response.json();
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

		this.addCommand({
			id: "qotd-editor-command",
			name: "Insert Random Quote of the Day by selected tag",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				let markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						const sel = markdownView.editor.getSelection();
						const validSelection = sel && sel.length > 2;
						if (validSelection) {
						}
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}

				return true;
			},
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				let qod: QuoteOfDay = {
					content: "Oops, cannot find that tag 🙊",
					author: "Tag Error 😢",
					tags: ["error"],
				};
				try {
					const sel = editor.getSelection();
					const validSelection = sel && sel.length > 2;
					if (!validSelection) {
						throw new Error("Invalid tag");
					}
					const tag = sel.substr(0, MAX_TAG_CHARS).trim();
					let response = await fetch(
						`${QUOTE_API_URL}/random?tags=${tag}`
					);
					qod = await response.json();
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
			.setName("Quote Format")
			.setDesc("Format the way the quote is displayed")
			.addTextArea((text) => {
				text.setPlaceholder("Quote format")
					.setValue(this.plugin.settings.quoteFormat)
					.onChange(async (value) => {
						console.log("New Quote format: " + value);
						//add quote format validation
						let valid =
							value.contains("{author}") &&
							value.contains("{content}");
						if (!valid) {
							new Notice(
								"Invalid format! Missing {author} or {content} field"
							);
							return;
						}
						this.plugin.settings.quoteFormat = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr("rows", 4);
				text.inputEl.addClass("settings_area");
			});

		new Setting(containerEl)
			.setName("Quote Tag Format")
			.setDesc("Format the way the quote tags are displayed")
			.addTextArea((text) => {
				text.setPlaceholder("Quote tag format")
					.setValue(this.plugin.settings.quoteTagFormat)
					.onChange(async (value) => {
						console.log("New Quote tag format: " + value);
						//add tag format validation
						let valid = value.contains("{tags}");
						if (!valid) {
							new Notice("Invalid format! Missing {tags} field");
							return;
						}
						this.plugin.settings.quoteTagFormat = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr("rows", 4);
				text.inputEl.addClass("settings_area");
			});

		new Setting(containerEl)
			.setName("Show Quote Tags")
			.setDesc("Display the quote tags")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showTags)
					.onChange(async (value) => {
						console.log("New Show tags: " + value);
						this.plugin.settings.showTags = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
