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
	TFile,
	FrontMatterCache,
} from "obsidian";

import { supermemo, SuperMemoItem, SuperMemoGrade } from "supermemo";

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
	markdownFiles: any[];

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.markdownFiles = app.vault.getMarkdownFiles();

		console.log("amount of due notes", this.markdownFiles.length);
		this.onSubmit = onSubmit;
	}

	handleScoring(card: TFile, answer: string = "") {
		// handle card answer
		// if (cardType === "learn") {
		// 	let item: SuperMemoItem = {
		// 		interval: 0,
		// 		repetition: 0,
		// 		efactor: 2.5,
		// 	  };
		// 	let answerGrade: SuperMemoGrade = 0;
		// 	if (answer === "correct") {
		// 		answerGrade = 3;
		// 	} else if (answer === "easy") {
		// 		answerGrade = 5;
		// 	}
		// 	console.log("item before answer", item);
		// 	item = supermemo(item, answerGrade);
		// 	console.log(`item after answer ${answerGrade}`, item);
		// }

		// await this.app.fileManager.processFrontMatter(note, (frontmatter) => {
		// 	frontmatter["status"] = "In progress";
		// 	frontmatter["review count"] += 1;
		// 	delete frontmatter["ignored"];
		// });

		const dateIn24Hours = new Date();
		dateIn24Hours.setHours(dateIn24Hours.getHours() + 24);
		// set frontmatter property dueAt to date in 24 hours
		// check if frontmatter exists, if not create it
		this.app.fileManager.processFrontMatter(card, (frontmatter) => {
			// setting frontmatter
			frontmatter["dueAt"] = dateIn24Hours.toISOString();
		});

		// console.log("metadata now", this.app.metadataCache.getFileCache(card));

		this.loadNewCard();
	}

	loadNewCard() {
		new Notice("Loading new card...");

		const { modalEl } = this;
		modalEl.empty();
		modalEl.addClass("queue-modal");

		const headerEl = modalEl.createDiv("headerEl");
		// create button to jump to card
		const jumpToCardButton = headerEl.createEl("button", {
			text: "Jump to card",
		});
		jumpToCardButton.addEventListener("click", () => {
			this.app.workspace.openLinkText(randomCard.path, "", true);
			this.close();
		});

		const contentEl = modalEl.createDiv("contentEl");

		// get a random card
		const possibleCards = this.markdownFiles.filter((file) => {
			let willBeIncluded = false;
			const dueAt =
				app.metadataCache.getFileCache(file)?.frontmatter?.dueAt;
			if (!dueAt) {
				willBeIncluded = true;
			} else {
				willBeIncluded = dueAt < new Date().toISOString();
			}

			// exclude cards with the tag #inactive
			const tags = this.app.metadataCache.getFileCache(file)?.tags;
			if (tags) {
				if (tags.filter((tag) => tag.tag === "#inactive").length > 0) {
					willBeIncluded = false;
				}
			}
			return willBeIncluded;
		});
		const randomCard =
			possibleCards[Math.floor(Math.random() * possibleCards.length)];

		console.log("random card", randomCard);

		// load the content of the random card
		this.app.vault.read(randomCard).then((content) => {
			if (!content) {
				new Notice("No content found...");
				return;
			}
			new Notice("Found random card...");

			const splitCard = content.split("---");
			const front = splitCard[0];
			const back = splitCard[1];
			console.log("front", front, "back", back);

			const cardContent = MarkdownPreviewView.renderMarkdown(
				front,
				contentEl,
				randomCard.path,
				this.component
			);

			const tags = this.app.metadataCache.getFileCache(randomCard)!.tags!;

			const buttonRow = contentEl.createDiv("button-row");
			// check if the property tag: "#learn" exists in nested object tags

			if (tags.filter((tag) => tag.tag === "#learn").length > 0) {
				buttonRow
					.createEl("button", {
						text: "Reveal",
					})
					.addEventListener("click", () => {
						contentEl.empty();
						MarkdownPreviewView.renderMarkdown(
							front + "\n---\n" + back,
							contentEl,
							randomCard.path,
							this.component
						);
						const buttonRow = contentEl.createDiv("button-row");

						buttonRow
							.createEl("button", {
								text: "Wrong",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomCard, "wrong");
							});

						buttonRow
							.createEl("button", {
								text: "Correct",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomCard, "correct");
							});

						buttonRow
							.createEl("button", {
								text: "Easy",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomCard, "easy");
							});
					});
			} else if (tags.filter((tag) => tag.tag === "#habit").length > 0) {
				// not today, do later, done
				buttonRow
					.createEl("button", {
						text: "Not Today",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Done",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				// todo
			} else if (tags.filter((tag) => tag.tag === "#todo").length > 0) {
				// delete, later, not today, done
				buttonRow
					.createEl("button", {
						text: "Delete",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Not Today",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Done",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});
			}
			// check:
			else if (tags.filter((tag) => tag.tag === "#check").length > 0) {
				// no, kind of, yes
				buttonRow
					.createEl("button", {
						text: "No",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Kind of",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Yes",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});
			}
			// book or article
			else if (
				tags.filter(
					(tag) => tag.tag === "#book" || tag.tag === "#article"
				).length > 0
			) {
				buttonRow.createEl("span", {
					text: "Read at a bit:",
				});
				// not today, later, done, finished
				buttonRow
					.createEl("button", {
						text: "Not Today",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Done",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});

				buttonRow
					.createEl("button", {
						text: "Finished",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
					});
			} else {
				buttonRow
					.createEl("button", {
						text: "Show Next",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "");
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
