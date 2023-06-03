import {
	App,
	Editor,
	MarkdownView,
	MarkdownPreviewView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Component,
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
	component: Component;

	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	loadNewCard() {
		new Notice("Loading new card...");

		const { contentEl } = this;
		contentEl.empty();
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
				new Notice("No content found...");
				return;
			}
			new Notice("Found random card...");

			const cardContent = MarkdownPreviewView.renderMarkdown(
				content,
				contentEl,
				randomCard.path,
				this.component
			);

			const tags = this.app.metadataCache.getFileCache(randomCard)!.tags!;
			console.log("Tags", tags);

			const buttonRow = contentEl.createDiv("button-row");
			// check if the property tag: "#learn" exists in nested object tags
			console.log("type, ", typeof tags);

			if (tags.filter((tag) => tag.tag === "#learn").length > 0) {
				buttonRow
					.createEl("button", {
						text: "Wrong",
					})
					.addEventListener("click", () => {
						this.loadNewCard();
					});
				
				buttonRow
					.createEl("button", {
						text: "Correct",
					})
					.addEventListener("click", () => {
						this.loadNewCard();
					});

				buttonRow
					.createEl("button", {
						text: "Easy",
					})
					.addEventListener("click", () => {
						this.loadNewCard();
					});

					
			} else if (tags.filter((tag) => tag.tag === "#habit").length > 0) {
				// not today, do later, done
				buttonRow
				.createEl("button", {
					text: "Not Today",
				})
				.addEventListener("click", () => {
					this.loadNewCard();
				});
			
			buttonRow
				.createEl("button", {
					text: "Later",
				})
				.addEventListener("click", () => {
					this.loadNewCard();
				});

			buttonRow
				.createEl("button", {
					text: "Done",
				})
				.addEventListener("click", () => {
					this.loadNewCard();
				});
				
			} else {
				buttonRow
				.createEl("button", {
					text: "Show Next",
				})
				.addEventListener("click", () => {
					this.loadNewCard();
				});
			}
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
