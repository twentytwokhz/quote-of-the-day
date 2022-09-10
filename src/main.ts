import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import QotDSettingsTab from "./settingsTab";

interface QotDSettings {
	quoteFormat: string;
	quoteTagFormat: string;
	quoteTemplatePlaceholder: string;
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
> &mdash; <cite>{author}</cite>✍️`,
	quoteTagFormat: `> ---
> {tags}`,
	quoteTemplatePlaceholder: "{{qotd}}",
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
			text = text + "\n" + quoteTags;
		}
		return text;
	};

	updateQuotePlaceholder = async () => {
		//replace with what is needed
		const file = this.app.workspace.getActiveFile();
		let t = await this.app.vault.read(file);
		if (t.contains(this.settings.quoteTemplatePlaceholder)) {
			let qod = await this.getRandomQuote();
			let quote = this.getMarkdownFromQuote(qod);
			let s = t.replace(this.settings.quoteTemplatePlaceholder, quote);
			this.app.vault.modify(file, s);
		}
	};

	getRandomQuote = async () => {
		let qod: QuoteOfDay = {
			content: "Oops, I did it again 🙊",
			author: "Britney Error 😢",
			tags: ["error"],
		};
		try {
			let response = await fetch(`${QUOTE_API_URL}/random`);
			let result = await response.json();
			if (!result.statusCode) {
				qod = result;
			}
		} catch (err) {
			console.log(err);
			new Notice(err.message);
		}
		return qod;
	};

	async onload() {
		await this.loadSettings();

		// highlight-start
		this.registerInterval(
			window.setInterval(() => this.updateQuotePlaceholder(), 5000)
		);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "qotd-random",
			name: "Insert Random Quote of the Day",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				let qod = await this.getRandomQuote();
				editor.replaceSelection(this.getMarkdownFromQuote(qod));
			},
		});

		this.addCommand({
			id: "qotd-tag",
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
						if (!validSelection) {
							return false;
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
						//retrieve random quote
						throw new Error("Invalid tag");
					}
					const tag = sel.substr(0, MAX_TAG_CHARS).trim();
					let response = await fetch(
						`${QUOTE_API_URL}/random?tags=${tag}`
					);
					let result = await response.json();
					if (!result.statusCode) {
						qod = result;
					}
				} catch (err) {
					console.log(err);
					new Notice(err.message);
				}
				editor.replaceSelection(this.getMarkdownFromQuote(qod));
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QotDSettingsTab(this.app, this));
	}

	onunload() {
		// Unhook the 'change' event
		this.app.workspace.iterateCodeMirrors((cm) => {
			cm.off("change", this.onChange);
		});
	}

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
