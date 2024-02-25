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
			.setName("Filtered Quote Template Placeholder")
			.setDesc(
				"Format the way the filtered quote placeholder is used when creating a note from template"
			)
			.addText((text) => {
				text.setPlaceholder("Filtered Quote Template Placeholder")
					.setValue(this.plugin.settings.filteredQuoteTemplatePlaceholder)
					.onChange(async (value) => {
						console.log("New Filtered Quote template placeholder: " + value);
						this.plugin.settings.filteredQuoteTemplatePlaceholder = value;
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

		new Setting(containerEl)
			.setName("Show Quote Tags Hashtag")
			.setDesc("Display the quote tags with # symbol")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showTagHash)
					.onChange(async (value) => {
						//console.log("New Show tags: " + value);
						this.plugin.settings.showTagHash = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Quote Placeholder Interval")
			.setDesc(
				"Interval to check for quote placeholder presence and quote generation"
			)
			.addSlider((toggle) =>
				toggle
					.setLimits(5, 60, 1)
					.setValue(this.plugin.settings.placeholderInterval)
					.onChange(async (value) => {
						console.log("New placeholderInterval: " + value);
						this.plugin.settings.placeholderInterval = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
			);

		const { moment } = window;
		const filters = filtersList;
		
		let dd = new Setting(this.containerEl)
			.setName("Quote of the Day Filters")
			.setDesc("Current filter: " + this.plugin.getFilters(" , "))
			.addDropdown((dropdown) => {
			  	dropdown.addOption("None", "None");
				filters.forEach((filter, i) => {
					dropdown.addOption(filters[i], filter);
				});
				//dropdown.setValue(this.plugin.settings.filter2);
				dropdown.onChange((val) => {
					if (val == "None") {
						this.plugin.settings.filter = ["None"];
					}
					else
					{
						if (this.plugin.settings.filter.includes(val)) {
							this.plugin.settings.filter =
							this.plugin.settings.filter.filter((i) => i !== val);
						} else {
							this.plugin.settings.filter.push(val);
						}
					}
	  
				  console.log(this.plugin.settings.filter);
				  dd.setDesc("Current filter: " + this.plugin.getFilters(" , "))
				  this.plugin.saveSettings();
				});
				dropdown.selectEl.setAttr("multiple", null);
			});
	}
}

const filtersList = [
	"Age",
	"Athletics",
	"Business",
	"Change",
	"Character",
	"Competition",
	"Conservative",
	"Courage",
	"Creativity",
	"Education",
	"Ethics",
	"Failure",
	"Faith",
	"Family",
	"Famous Quotes",
	"Film",
	"Freedom",
	"Friendship",
	"Future",
	"Generosity",
	"Genius",
	"Gratitude",
	"Happiness",
	"Health",
	"History",
	"Honor",
	"Humor",
	"Humorous",
	"Imagination",
	"Inspirational",
	"Knowledge",
	"Leadership",
	"Life",
	"Literature",
	"Love",
	"Mathematics",
	"Motivational",
	"Nature",
	"Opportunity",
	"Pain",
	"Perseverance",
	"Philosophy",
	"Politics",
	"Power Quotes",
	"Proverb",
	"Religion",
	"Sadness",
	"Science",
	"Self",
	"Self Help",
	"Social Justice",
	"Society",
	"Spirituality",
	"Sports",
	"Stupidity",
	"Success",
	"Technology",
	"Time",
	"Tolerance",
	"Truth",
	"Virtue",
	"War",
	"Weakness",
	"Wellness",
	"Wisdom",
	"Work"
]