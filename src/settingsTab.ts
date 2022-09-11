import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import QuoteOfTheDay from "./main";

export default class QotDSettingsTab extends PluginSettingTab {
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
			.setName("Quote Template Placeholder")
			.setDesc(
				"Format the way the quote placeholder is used when creating a note from template"
			)
			.addText((text) => {
				text.setPlaceholder("Quote Template Placeholder")
					.setValue(this.plugin.settings.quoteTemplatePlaceholder)
					.onChange(async (value) => {
						console.log("New Quote template placeholder: " + value);
						this.plugin.settings.quoteTemplatePlaceholder = value;
						await this.plugin.saveSettings();
					});
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
