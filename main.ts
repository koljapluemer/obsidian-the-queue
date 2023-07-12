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
	startedBookNotes: TFile[];
	priorityNotes: TFile[];

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
		console.log(
			`not considering due date, there a ${this.markdownFiles.length} notes`
		);
		// get active book notes
		this.startedBookNotes = this.markdownFiles.filter((note) => {
			let willBeIncluded = false;
			// check if its a book, and contains the tag 'started
			if (this.getTypeOfNote(note) === "book") {
				const tags = this.app.metadataCache.getFileCache(note)?.tags;
				if (tags) {
					if (
						tags.filter((tag) => tag.tag === "#started").length > 0
					) {
						willBeIncluded = true;
					}
				}
			}
			return willBeIncluded;
		});
		console.log("found started book notes", this.startedBookNotes);
		// if less than 5 books, find a new random book and add it to the list
		if (this.startedBookNotes.length < 5) {
			const newBook = this.markdownFiles.filter((note) => {
				return this.getTypeOfNote(note) === "book";
			});

			this.startedBookNotes.push(
				newBook[Math.floor(Math.random() * newBook.length)]
			);
			console.log("added new book, list is now", this.startedBookNotes);
		}

		// get priority notes
		this.priorityNotes = this.markdownFiles.filter((note) => {
			let willBeIncluded = false;
			// check for tag #priority
			const tags = this.app.metadataCache.getFileCache(note)?.tags;
			if (tags) {
				if (tags.filter((tag) => tag.tag === "#priority").length > 0) {
					willBeIncluded = true;
				}
			}
			return willBeIncluded;
		});
		console.log("found priority notes", this.priorityNotes);
	}

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
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

		const answersToPraise = [
			"yes",
			"finished",
			"done",
			"correct",
			"easy",
			"completed",
		];
		if (answersToPraise.includes(answer)) {
			new Notice("Good job!");
		}

		// if type is book, check if the tag #started is present, otherwise append it
		if (type === "book") {
			// string search in card content
			this.app.vault.read(card).then((content) => {
				if (!content.includes("#started")) {
					if (answer !== "not-today" && answer !== "later") {
						const newContent = content + "\n\n#started";
						this.app.vault.modify(card, newContent);
					}
				}
			});
		}

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

				// console.log("item before answer", item);
				item = supermemo(item, answerGrade);
				// console.log(`item after answer ${answerGrade}`, item);

				frontmatter["interval"] = item.interval;
				frontmatter["repetition"] = item.repetition;
				frontmatter["efactor"] = item.efactor;
				frontmatter["dueAt"] = new Date(
					new Date().getTime() + item.interval * 24 * 60 * 60 * 1000
				).toISOString();
			});
			// hand case 'finished': delete tag 'book' and 'article' and add 'misc'
		} else if (answer == "finished") {
			// remove book and article tags
			this.app.fileManager.processFrontMatter(card, (frontmatter) => {
				const tags = frontmatter["tags"] || [];
				frontmatter["tags"] = tags.filter(
					(tag: string) => tag !== "#book" && tag !== "#article"
				);
			});
			// also remove the tags from the notes content itself
			this.app.vault.read(card).then((content) => {
				// string match #book and #article and remove them
				let newContent = content
					.replace(/#book/g, "")
					.replace(/#article/g, "");
				newContent += "\n#misc";
				this.app.vault.modify(card, newContent);
			});
		} else if (answer == "delete" || answer == "completed") {
			// delete note
			this.app.vault.delete(card);
		} else if (answer == "later") {
			// set dueAt to in 10 minutes
			const newDate = new Date();
			newDate.setMinutes(newDate.getMinutes() + 10);
			this.app.fileManager.processFrontMatter(card, (frontmatter) => {
				frontmatter["dueAt"] = newDate.toISOString();
			});
		} else {
			const answersWhereIntervalIsAdded = [
				"not-today",
				"later",
				"done",
				"no",
				"kind-of",
				"yes",
				"finished",
				"show-next",
				"show-less",
				"show-more",
			];

			if (answer == "show-less") {
				// half interval (minimum 1)
				const metadata = this.app.metadataCache.getFileCache(card);
				let noteInterval = 1;
				if (metadata) {
					if (metadata.frontmatter) {
						metadata.frontmatter["interval"] =
							Math.max(1, metadata.frontmatter["interval"] / 2) ||
							1;
					}
				}
			} else if (answer == "show-more") {
				// double interval, max 128
				const metadata = this.app.metadataCache.getFileCache(card);
				let noteInterval = 1;
				if (metadata) {
					if (metadata.frontmatter) {
						metadata.frontmatter["interval"] =
							Math.min(
								128,
								metadata.frontmatter["interval"] * 2
							) || 1;
					}
				}
			}

			if (answersWhereIntervalIsAdded.includes(answer)) {
				console.log("adding interval");
				// get interval either from frontmatter or set to 1
				const metadata = this.app.metadataCache.getFileCache(card);
				let noteInterval = 1;
				if (metadata) {
					console.log("metadata found");
					if (metadata.frontmatter) {
						noteInterval = metadata.frontmatter["interval"];
						console.log(
							"frontmatter found, note Interval is",
							noteInterval
						);
					}
				}
				if (!noteInterval) {
					noteInterval = 1;
				}

				const newDate = new Date();
				// console.log("my interval is", noteInterval);
				newDate.setDate(newDate.getDate() + noteInterval);

				// set frontmatter property dueAt to date in 24 hours, dont overwrite other properties
				// TODO: this is a hack. find out why frontmatter is overwritten?! May not be here, but earlier?
				this.app.fileManager.processFrontMatter(card, (frontmatter) => {
					frontmatter["dueAt"] = newDate.toISOString();
					frontmatter["interval"] = noteInterval;
				});
			}
		}

		this.loadNewCard();
	}

	loadNewCard(lastOpenendNoteName: string = "") {
		this.loadNotes();
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

		if (!randomCard!) {
			// TODO: exclude the current note from the random selection
			// with 30% chance, pick a priority note
			if (Math.random() < 0.3) {
				console.log("executing: picking a priority note");
				const duePriorityNotes: TFile[] = this.priorityNotes.filter(
					(file) => {
						let willBeIncluded = false;
						const dueAt =
							app.metadataCache.getFileCache(file)?.frontmatter
								?.dueAt;
						console.log("dueAt of card", dueAt);
						if (!dueAt) {
							willBeIncluded = true;
						} else {
							willBeIncluded = dueAt < new Date().toISOString();
							console.log(
								`dueAt is ${dueAt}, and it's ${new Date().toISOString()}, so willBeIncluded is ${willBeIncluded}`
							);

							return willBeIncluded;
						}
					}
				);
				randomCard =
					duePriorityNotes[
						Math.floor(Math.random() * duePriorityNotes.length)
					];
			} else {
				console.log("no last opened note, getting new random");

				const availableTypes = [
					"learn",
					"book",
					"article",
					"misc",
					"todo",
					"habit",
					"check",
				];
				const randomType =
					availableTypes[
						Math.floor(Math.random() * availableTypes.length)
					];
				// book is treated special, because there is a small list of started books
				if (randomType === "book") {
					// if there is more than 0 started books, pick one of them
					if (this.startedBookNotes.length > 0) {
						console.log("executing: picking a book");
						const dueBooks = this.startedBookNotes.filter(
							(file) => {
								let willBeIncluded = false;
								const dueAt =
									app.metadataCache.getFileCache(file)
										?.frontmatter?.dueAt;
								console.log("dueAt of card", dueAt);
								if (!dueAt) {
									willBeIncluded = true;
								} else {
									willBeIncluded =
										dueAt < new Date().toISOString();
									console.log(
										`dueAt is ${dueAt}, and it's ${new Date().toISOString()}, so willBeIncluded is ${willBeIncluded}`
									);

									return willBeIncluded;
								}
							}
						);
						randomCard =
							dueBooks[
								Math.floor(Math.random() * dueBooks.length)
							];
					}
				} else {
					console.log(
						"executing: picking a random card of type",
						randomType
					);
					// get a random card
					const possibleCards = this.markdownFiles.filter((file) => {
						// return true;
						let isDue = false;
						const dueAt =
							app.metadataCache.getFileCache(file)?.frontmatter
								?.dueAt;
						if (!dueAt) {
							isDue = true;
						} else {
							isDue = dueAt < new Date().toISOString();
						}
						const isOfCorrectTagType =
							this.getTypeOfNote(file) === randomType;

						return isOfCorrectTagType && isDue;
					});
					console.log(
						`of type ${randomType}, there are`,
						possibleCards.length,
						"due cards"
					);
					randomCard =
						possibleCards[
							Math.floor(Math.random() * possibleCards.length)
						];
				}
			}
		}
		console.log("openend note from type", randomCard);
		// if we have no more notes, first, try to get any kind of due random note, without consideration of type
		if (!randomCard) {
			console.log("executing: picking a random card of any type");
			const possibleCards = this.markdownFiles.filter((file) => {
				// return true;
				let isDue = false;
				const dueAt =
					app.metadataCache.getFileCache(file)?.frontmatter?.dueAt;
				if (!dueAt) {
					isDue = true;
				} else {
					isDue = dueAt < new Date().toISOString();
				}

				return isDue;
			});
			randomCard =
				possibleCards[Math.floor(Math.random() * possibleCards.length)];
		}
		// if card is still undefined, show a message 'No more Notes' and close the modal
		if (!randomCard) {
			new Notice("No more notes!");
			this.close();
			return;
		}

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
				console.log("No content found...");
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
