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

	getTypeOfNote(note: TFile) {
		// loop tags for occurrences of learn, habit, todo, check, misc, book, article
		// if none found, return misc
		const tags = this.app.metadataCache.getFileCache(note)?.tags;
		if (tags) {
			if (tags.filter((tag) => tag.tag === "#learn").length > 0) {
				return "learn";
			} else if (tags.filter((tag) => tag.tag === "#habit").length > 0) {
				return "habit";
			} else if (tags.filter((tag) => tag.tag === "#todo").length > 0) {
				return "todo";
			} else if (tags.filter((tag) => tag.tag === "#check").length > 0) {
				return "check";
			} else if (tags.filter((tag) => tag.tag === "#misc").length > 0) {
				return "misc";
			} else if (tags.filter((tag) => tag.tag === "#book").length > 0) {
				return "book";
			} else if (
				tags.filter((tag) => tag.tag === "#article").length > 0
			) {
				return "article";
			}
		}
		return "misc";
	}

	handleScoring(card: TFile, answer: string = "") {
		// handle card answer
		const type = this.getTypeOfNote(card);
		if (type === "learn") {
			this.app.fileManager.processFrontMatter(card, (frontmatter) => {
				const interval = frontmatter["interval"] || 0;
				const repetition = frontmatter["repetition"] || 0;
				const efactor = frontmatter["efactor"] || 2.5;

				let item: SuperMemoItem = {
					interval: interval,
					repetition: repetition,
					efactor: efactor,
				};

				let answerGrade: SuperMemoGrade = 0;
				if (answer === "correct") {
					answerGrade = 3;
				} else if (answer === "easy") {
					answerGrade = 5;
				}

				console.log("item before answer", item);
				item = supermemo(item, answerGrade);
				console.log(`item after answer ${answerGrade}`, item);

				frontmatter["interval"] = item.interval;
				frontmatter["repetition"] = item.repetition;
				frontmatter["efactor"] = item.efactor;
				frontmatter["dueAt"] = new Date(
					new Date().getTime() + item.interval * 24 * 60 * 60 * 1000
				).toISOString();
			});
		} else {
			const dateIn24Hours = new Date();
			dateIn24Hours.setHours(dateIn24Hours.getHours() + 24);
			// set frontmatter property dueAt to date in 24 hours
			this.app.fileManager.processFrontMatter(card, (frontmatter) => {
				frontmatter["dueAt"] = dateIn24Hours.toISOString();
			});
		}

		this.loadNewCard();
	}

	loadNewCard(lastOpenendNoteName: string = "") {
		new Notice("Loading new card...");

		let randomCard: TFile;

		if (lastOpenendNoteName) {
			console.log("last opened note", lastOpenendNoteName);
			// in this case, load the same card (not actually random)
			// find note by name
			const possibleCards = this.markdownFiles.filter((file) => {
				return file.name === lastOpenendNoteName;
			});
			if (possibleCards.length > 0) {
				randomCard = possibleCards[0];
			}
		}

		if (!randomCard) {
			console.log("no last opened note, getting new random");
			// get a random card
			const possibleCards = this.markdownFiles.filter((file) => {
				// return true;
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
					if (
						tags.filter((tag) => tag.tag === "#inactive").length > 0
					) {
						willBeIncluded = false;
					}
				}
				return willBeIncluded;
			});
			randomCard =
				possibleCards[Math.floor(Math.random() * possibleCards.length)];
		}
		console.log("openend note", randomCard);

		// save card name to local storage
		localStorage.setItem("lastOpenendNoteName", randomCard.name);

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

		// load the content of the random card
		this.app.vault.read(randomCard).then((content) => {
			if (!content) {
				new Notice("No content found...");
				return;
			}
			// new Notice("Found random card...");

			const splitCard = content.split("---");

			// if metadata has property frontmatter, treat differently
			const metadata = this.app.metadataCache.getFileCache(randomCard);
			let front = "";
			let back = "";
			if (metadata?.frontmatter) {
				front = splitCard[2];
				back = splitCard[3];
			} else {
				front = splitCard[0];
				back = splitCard[1];
			}
			console.log("front", front, "back", back);

			const cardContent = MarkdownPreviewView.renderMarkdown(
				front,
				contentEl,
				randomCard.path,
				this.component
			);

			const tags = this.app.metadataCache.getFileCache(randomCard)!.tags;

			const buttonRow = contentEl.createDiv("button-row");
			// check if the property tag: "#learn" exists in nested object tags
			if (tags) {
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
				} else if (
					tags.filter((tag) => tag.tag === "#habit").length > 0
				) {
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
				} else if (
					tags.filter((tag) => tag.tag === "#todo").length > 0
				) {
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
				else if (
					tags.filter((tag) => tag.tag === "#check").length > 0
				) {
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
			} else {
				// if no tag is set denoting the type, handle as 'misc'
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
		const lastNote = localStorage.getItem("lastOpenendNoteName") || "";
		this.loadNewCard(lastNote);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
