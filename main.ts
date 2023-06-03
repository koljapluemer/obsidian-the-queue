import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Queue",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				// new SampleModal(this.app).open();
				new ExampleModal(this.app, (result) => {
					new Notice(`Hello, ${result}!`);
				}).open();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");
	}

	onunload() {}
}

export class ExampleModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	loadNewCard() {
		new Notice('Loading new card...');

		const { contentEl } = this;
		contentEl.addClass("queue-modal");

		// get a random card
		const randomCard = this.app.vault
			.getFiles()
			.filter((file) => file.extension === "md")[
			Math.floor(Math.random() * this.app.vault.getFiles().length)
		];
		// load the content of the random card
		this.app.vault.read(randomCard).then((content) => {
			if (!content) {
				new Notice('No content found...');
				return;
			}
			new Notice('Found random card...');

			contentEl.createEl("p", { text: content });

			const buttonRow = contentEl.createDiv("button-row");

			new Setting(buttonRow).addButton((btn) =>
				btn
					.setButtonText("Show Next")
					.setCta()
					.onClick(() => {
						contentEl.empty();
						this.loadNewCard();
					})
			);
		});
	}

	onOpen() {
		this.loadNewCard();
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
