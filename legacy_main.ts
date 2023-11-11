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
	currentQueueNote: TFile;

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

		let selectionsOfPickableNotes: any = {
			dueArticles: [],
			newBooks: [],
			dueStartedBooks: [],
			dueChecks: [],
			dueHabits: [],
			dueTodos: [],
			newLearns: [],
			dueStartedLearns: [],
			dueMisc: [],
		};
		this.markdownFiles.forEach((note) => {
			// check if markdown file, otherwise skip:
			if (note.extension !== "md") {
				return;
			}
			// series of conditionals to fit into one of the above categories
			// type can be checked by q-type
			const metadata = this.app.metadataCache.getFileCache(note);
			if (metadata?.frontmatter) {
				const qType = metadata.frontmatter["q-type"];
				// exclude q-type: exclude
				if (qType === "exclude") {
					return;
				}
				// whether due can be checked by q-data.dueat (format is UNIX timestamp)
				// dueat property may not exist, check for it
				let noteIsCurrentlyDue = true;
				if (metadata.frontmatter["q-data"]?.hasOwnProperty("dueat")) {
					// dueat format is YYYY-MM-DDTHH:MM:SS, make sure to compare correctly with current time
					const dueAt = metadata.frontmatter["q-data"]["dueat"];
					const currentTime = new Date().toISOString();
					noteIsCurrentlyDue = dueAt < currentTime;
					
				}
				if (qType === "article" && noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueArticles.push(note);
				} else if (qType === "book-started") {
					if (noteIsCurrentlyDue) {
						selectionsOfPickableNotes.dueStartedBooks.push(note);
					}
				} else if (qType === "book") {
					selectionsOfPickableNotes.newBooks.push(note);
				} else if (qType === "check" && noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueChecks.push(note);
				} else if (qType === "habit" && noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueHabits.push(note);
				} else if (qType === "todo" && noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueTodos.push(note);
				} else if (qType === "learn-started" && noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueStartedLearns.push(note);
				} else if (qType === "learn") {
					selectionsOfPickableNotes.newLearns.push(note);
				} else if (noteIsCurrentlyDue) {
					selectionsOfPickableNotes.dueMisc.push(note);
				}
			}
		});

		console.log("selectionsOfPickableNotes", selectionsOfPickableNotes);

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
		// if less than 5 books, find a new random book and add it to the list
		if (this.startedBookNotes.length < 5) {
			const newBook = this.markdownFiles.filter((note) => {
				return this.getTypeOfNote(note) === "book";
			});

			this.startedBookNotes.push(
				newBook[Math.floor(Math.random() * newBook.length)]
			);
			console.warn("added new book, list is now", this.startedBookNotes);
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

				item = supermemo(item, answerGrade);

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
				// get interval either from frontmatter or set to 1
				const metadata = this.app.metadataCache.getFileCache(card);
				let noteInterval = 1;
				if (metadata) {
					if (metadata.frontmatter) {
						noteInterval = metadata.frontmatter["interval"];
					}
				}
				if (!noteInterval) {
					noteInterval = 1;
				}

				const newDate = new Date();
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
			// with 30% chance, pick a priority note
			if (Math.random() < 0.3) {
				const duePriorityNotes: TFile[] = this.priorityNotes.filter(
					(file) => {
						// exclude the current note from the random selection
						if (this.currentQueueNote) {
							if (file.name === this.currentQueueNote.name) {
								return false;
							}
						}
						let willBeIncluded = false;
						const dueAt =
							app.metadataCache.getFileCache(file)?.frontmatter
								?.dueAt;
						if (!dueAt) {
							willBeIncluded = true;
						} else {
							willBeIncluded = dueAt < new Date().toISOString();

							return willBeIncluded;
						}
					}
				);
				randomCard =
					duePriorityNotes[
						Math.floor(Math.random() * duePriorityNotes.length)
					];
			} else {

				const availableTypes = [
					"learn",
					"book",
					"article",
					"misc",
					"todo",
					"habit",
					"check",
				];
				// const randomType =
				// 	availableTypes[
				// 		Math.floor(Math.random() * availableTypes.length)
				// 	];
				const randomType = "book";

				// book is treated special, because there is a small list of started books
				if (randomType === "book") {
					// if there is more than 0 started books, pick one of them (we fill up this list earlier, having none here means no books are in system)
					if (this.startedBookNotes.length > 0) {
						const dueBooks = this.startedBookNotes.filter(
							(file) => {
								// exclude the current note from the random selection
								if (this.currentQueueNote) {
									if (
										file.name === this.currentQueueNote.name
									) {
										return false;
									}
								}
								let willBeIncluded = false;
								const dueAt =
									app.metadataCache.getFileCache(file)
										?.frontmatter?.dueAt;
								if (!dueAt) {
									willBeIncluded = true;
								} else {
									willBeIncluded =
										dueAt < new Date().toISOString();

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
					// get a random card
					const possibleCards = this.markdownFiles.filter((file) => {
						// exclude the current note from the random selection
						if (this.currentQueueNote) {
							if (file.name === this.currentQueueNote.name) {
								return false;
							}
						}
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
					randomCard =
						possibleCards[
							Math.floor(Math.random() * possibleCards.length)
						];
				}
			}
		}
		// if we have no more notes, first, try to get any kind of due random note, without consideration of type
		if (!randomCard) {
			const possibleCards = this.markdownFiles.filter((file) => {
				// exclude the current note from the random selection
				if (this.currentQueueNote) {
					if (file.name === this.currentQueueNote.name) {
						return false;
					}
				}
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
