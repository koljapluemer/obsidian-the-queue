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

let newLearnItemsThisSessionCount = 0;

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
	startedBookNotes: TFile[];
	priorityNotes: TFile[];
	currentQueueNote: TFile;

	selectionsOfPickableNotes: any = {
		dueArticles: [],
		newBooks: [],
		dueStartedBooks: [],
		startedBooksEvenIfNotDue: [],
		dueChecks: [],
		dueHabits: [],
		dueTodos: [],
		newLearns: [],
		dueStartedLearns: [],
		dueMisc: [],
	};

	loadNotes() {
		this.markdownFiles = app.vault.getMarkdownFiles().filter((note) => {
			let willBeIncluded = true;
			// exclude cards with the tag #inactive
			const tags = this.app.metadataCache.getFileCache(note)?.tags;
			if (tags) {
				if (tags.filter((tag) => tag.tag === "#inactive").length > 0) {
					willBeIncluded = false;
				}
			}
			return willBeIncluded;
		});
		// log how often values for the q-type frontmatter property occur in the notes
		let qTypes: any = {};
		this.markdownFiles.forEach((note) => {
			if (note.extension !== "md") {
				return;
			}
			const metadata = this.app.metadataCache.getFileCache(note);
			if (metadata?.frontmatter) {

				const qType = metadata.frontmatter["q-type"];
				if (qType) {
					if (qTypes[qType]) {
						qTypes[qType] += 1;
					} else {
						qTypes[qType] = 1;
					}
				}
			}
		});
		console.log("qTypes:", qTypes);

		this.markdownFiles.forEach((note) => {
			// check if markdown file, otherwise skip:
			if (note.extension !== "md") {
				return;
			}
			// series of conditionals to fit into one of the above categories
			// type can be checked by q-type
			const metadata = this.app.metadataCache.getFileCache(note);
			if (metadata?.frontmatter) {
				const frontmatter = metadata.frontmatter;
				const qType = frontmatter["q-type"];
				// exclude q-type: exclude
				if (qType === "exclude") {
					return;
				}
				// whether due can be checked by q-data.dueat (format is UNIX timestamp)
				// dueat property may not exist, check for it
				let noteIsCurrentlyDue = true;
				if (frontmatter["q-data"]?.hasOwnProperty("dueat")) {
					// dueat format is YYYY-MM-DDTHH:MM:SS, make sure to compare correctly with current time
					const dueAt = frontmatter["q-data"]["dueat"];
					const currentTime = new Date().toISOString();
					noteIsCurrentlyDue = dueAt < currentTime;
				}
				if (qType === "article" && noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueArticles.push(note);
				} else if (qType === "book-started") {
					if (noteIsCurrentlyDue) {
						this.selectionsOfPickableNotes.dueStartedBooks.push(
							note
						);
					}
					this.selectionsOfPickableNotes.startedBooksEvenIfNotDue.push(
						note
					);
				} else if (qType === "book") {
					this.selectionsOfPickableNotes.newBooks.push(note);
				} else if (qType === "check" && noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueChecks.push(note);
				} else if (qType === "habit" && noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueHabits.push(note);
				} else if (qType === "todo" && noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueTodos.push(note);
				} else if (qType === "learn-started" && noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueStartedLearns.push(note);
				} else if (qType === "learn") {
					this.selectionsOfPickableNotes.newLearns.push(note);
				} else if (noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueMisc.push(note);
				}
			}
		});

		console.log(
			"selectionsOfPickableNotes",
			this.selectionsOfPickableNotes
		);
	}

	handleScoring(card: TFile, answer: string = "") {
		// get type from q-type frontmatter property
		const metadata = this.app.metadataCache.getFileCache(card);
		const frontmatter = metadata!.frontmatter!;
		const noteType = frontmatter["q-type"];

		if (noteType === "learn" || noteType === "learn-started") {
			newLearnItemsThisSessionCount += 1;
			const interval = frontmatter["interval"] || 1;
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000 * interval
			).toISOString();
		}

		if (noteType === "book") {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
			// only convert to started if answer is not "not-today" or "later"
			if (answer !== "not-today" && answer !== "later") {
				frontmatter["q-type"] = "book-started";
			}
		}

		if (noteType === "book-started") {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
			// check if finished
			if (answer === "finished") {
				frontmatter["q-type"] = "misc";
			}
		}

		// article works the same as book-started
		if (noteType === "article") {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
			// check if finished
			if (answer === "finished") {
				frontmatter["q-type"] = "misc";
			}
		}

		if (noteType === "check" || noteType === "habit") {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
		}

		if (noteType === "todo") {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
			if (answer === "completed") {
				frontmatter["q-type"] = "misc";
			}
		}

		if (noteType === "misc" || noteType === "" || !noteType) {
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() + 16 * 60 * 60 * 1000
			).toISOString();
		}

		// write metadata to file
		this.app.fileManager.processFrontMatter(card, (frontmatter) => {
			frontmatter = frontmatter;
		}
		);

		this.loadNewCard(card.name);
	}

	loadNewCard(lastOpenendNoteName: string = "") {
		this.loadNotes();
		let randomCard: TFile;

		if (lastOpenendNoteName) {
			// in this case, load the same card (not actually random)
			// find note by name
			const possibleCards = this.markdownFiles.filter((file) => {
				return file.name === lastOpenendNoteName;
			});
			if (possibleCards.length > 0) {
				randomCard = possibleCards[0];
			}
		} else {
			// RANDOM CARD PICK
			// if no card was loaded, pick a random card

			// for each of the selectionsOfPickableNotes, judge by certain conditions whether she should include them in the card pick
			let pickableSelections: any = [];
			if (this.selectionsOfPickableNotes.dueArticles.length > 0) {
				pickableSelections.push("dueArticles");
			}
			// only include new books when we have less than 5 started books
			if (
				this.selectionsOfPickableNotes.newBooks.length > 0 &&
				this.selectionsOfPickableNotes.startedBooksEvenIfNotDue.length <
					5
			) {
				pickableSelections.push("newBooks");
			}
			if (this.selectionsOfPickableNotes.dueStartedBooks.length > 0) {
				pickableSelections.push("dueStartedBooks");
			}
			if (this.selectionsOfPickableNotes.dueChecks.length > 0) {
				pickableSelections.push("dueChecks");
			}
			if (this.selectionsOfPickableNotes.dueHabits.length > 0) {
				pickableSelections.push("dueHabits");
			}
			if (this.selectionsOfPickableNotes.dueTodos.length > 0) {
				pickableSelections.push("dueTodos");
			}
			if (
				this.selectionsOfPickableNotes.newLearns.length > 0 &&
				newLearnItemsThisSessionCount < 12
			) {
				pickableSelections.push("newLearns");
			}
			if (this.selectionsOfPickableNotes.dueStartedLearns.length > 0) {
				pickableSelections.push("dueStartedLearns");
			}
			if (this.selectionsOfPickableNotes.dueMisc.length > 0) {
				("dueMisc");
			}
			console.log("pickableSelections", pickableSelections);
			// pick a random selection, then pick a random card from selection of that name
			if (pickableSelections.length > 0) {
				const randomSelection =
					pickableSelections[
						Math.floor(Math.random() * pickableSelections.length)
					];
				console.log("randomSelection", randomSelection);
				randomCard =
					this.selectionsOfPickableNotes[randomSelection][
						Math.floor(
							Math.random() *
								this.selectionsOfPickableNotes[randomSelection]
									.length
						)
					];
				console.log("PICKED RANDOM CARD", randomCard);
			} else {
				// pop up a notice that there are no more cards to review (close modal)
				new Notice("No more cards to review!");
				this.close();
			}
		}

		// RENDER FUNCTION

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

		this.currentQueueNote = randomCard;
		// load the content of the random card
		this.app.vault.read(randomCard).then((content) => {
			if (!content) {
				return;
			}
			const splitCard = content.split("---");

			// if metadata has property frontmatter, treat differently
			const metadata = this.app.metadataCache.getFileCache(randomCard);
			// console.log("metadata of note", metadata);
			let front = "";
			let back = "";
			// check if frontmatter exists, or if content has more than one ---
			if (metadata?.frontmatter || splitCard.length > 2) {
				front = splitCard[2];
				back = splitCard[3];
			} else {
				front = splitCard[0];
				back = splitCard[1];
			}
			// console.log("front", front, "back", back);
			// add title of card before front, with a # to make it a title
			const title = randomCard.name.replace(".md", "");
			front = `# ${title}\n\n${front}`;

			const cardContent = MarkdownPreviewView.renderMarkdown(
				front,
				contentEl,
				randomCard.path,
				Component
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
							this.handleScoring(randomCard, "not-today");
						});

					buttonRow
						.createEl("button", {
							text: "Later",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "later");
						});

					buttonRow
						.createEl("button", {
							text: "Done",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "done");
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
							this.handleScoring(randomCard, "delete");
						});

					buttonRow
						.createEl("button", {
							text: "Not Today",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "not-today");
						});

					buttonRow
						.createEl("button", {
							text: "Later",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "later");
						});

					buttonRow
						.createEl("button", {
							text: "Completed",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "completed");
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
							this.handleScoring(randomCard, "no");
						});

					buttonRow
						.createEl("button", {
							text: "Kind of",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "kind-of");
						});

					buttonRow
						.createEl("button", {
							text: "Yes",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "yes");
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
							this.handleScoring(randomCard, "not-today");
						});

					buttonRow
						.createEl("button", {
							text: "Later",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "later");
						});

					buttonRow
						.createEl("button", {
							text: "Done",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "done");
						});

					buttonRow
						.createEl("button", {
							text: "Finished",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "finished");
						});
				} else {
					buttonRow
						.createEl("button", {
							text: "Show Less Often",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "show-less");
						});
					buttonRow
						.createEl("button", {
							text: "Ok, Cool",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "show-next");
						});

					buttonRow
						.createEl("button", {
							text: "Show More Often",
						})
						.addEventListener("click", () => {
							this.handleScoring(randomCard, "show-more");
						});
				}
			} else {
				// if no tag is set denoting the type, handle as 'misc'
				buttonRow
					.createEl("button", {
						text: "Show Less Often",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "show-less");
					});
				buttonRow
					.createEl("button", {
						text: "Ok, Cool",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "show-next");
					});

				buttonRow
					.createEl("button", {
						text: "Show More Often",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomCard, "show-more");
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
