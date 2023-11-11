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

interface TheQueueSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TheQueueSettings = {
	mySetting: "default",
};

let newLearnItemsThisSessionCount = 0;

export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Queue",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				// new SampleModal(this.app).open();
				new TheQueueModal(this.app).open();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");
	}

	onunload() {}
}

export class TheQueueModal extends Modal {
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
			// exclude notes with the tag #inactive
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
	}

	async handleScoring(note: TFile, answer: string = "") {
		// get type from q-type frontmatter property
		const metadata = this.app.metadataCache.getFileCache(note);
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
		const newFrontMatter = frontmatter;
		app.fileManager.processFrontMatter(note, (frontmatter) => {
			frontmatter["q-data"] = newFrontMatter["q-data"];
			frontmatter["q-type"] = newFrontMatter["q-type"];
		});

		this.loadNewNote();
	}

	loadNewNote(lastOpenendNoteName: string = "") {
		this.loadNotes();
		let randomNote: TFile;

		if (lastOpenendNoteName) {
			// in this case, load the same note (not actually random)
			// find note by name
			const possibleNotes = this.markdownFiles.filter((file) => {
				return file.name === lastOpenendNoteName;
			});
			if (possibleNotes.length > 0) {
				randomNote = possibleNotes[0];
			}
		} else {
			// RANDOM CARD PICK
			// if no note was loaded, pick a random note

			// for each of the selectionsOfPickableNotes, judge by certain conditions whether she should include them in the note pick
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
			// pick a random selection, then pick a random note from selection of that name
			if (pickableSelections.length > 0) {
				const randomSelection =
					pickableSelections[
						Math.floor(Math.random() * pickableSelections.length)
					];
				randomNote =
					this.selectionsOfPickableNotes[randomSelection][
						Math.floor(
							Math.random() *
								this.selectionsOfPickableNotes[randomSelection]
									.length
						)
					];
			} else {
				// pop up a notice that there are no more notes to review (close modal)
				new Notice("No more notes to review!");
				this.close();
				return;
			}
		}

		// RENDER FUNCTION

		// save note name to local storage
		localStorage.setItem("lastOpenendNoteName", randomNote.name);

		const { modalEl } = this;
		modalEl.empty();
		modalEl.addClass("queue-modal");

		const headerEl = modalEl.createDiv("headerEl");
		// create button to jump to note
		const jumpToNoteButton = headerEl.createEl("button", {
			text: "Jump to note",
		});
		jumpToNoteButton.addEventListener("click", () => {
			this.app.workspace.openLinkText(randomNote.path, "", true);
			this.close();
		});

		const contentEl = modalEl.createDiv("contentEl");

		this.currentQueueNote = randomNote!;
		const noteType =
			this.app.metadataCache!.getFileCache(randomNote)!.frontmatter![
				"q-type"
			];
		// load the content of the random note
		this.app.vault.read(randomNote).then((content) => {
			if (!content) {
				return;
			}
			const splitNote = content.split("---");

			// if metadata has property frontmatter, treat differently
			const metadata = this.app.metadataCache.getFileCache(randomNote);
			let front = "";
			let back = "";
			// check if frontmatter exists, or if content has more than one ---
			if (metadata?.frontmatter || splitNote.length > 2) {
				front = splitNote[2];
				back = splitNote[3];
			} else {
				front = splitNote[0];
				back = splitNote[1];
			}
			// add title of note before front, with a # to make it a title
			const title = randomNote.name.replace(".md", "");
			front = `# ${title}\n\n${front}`;

			const noteContent = MarkdownPreviewView.renderMarkdown(
				front,
				contentEl,
				randomNote.path,
				Component
			);

			const buttonRow = contentEl.createDiv("button-row");
			// check if the property tag: "#learn" exists in nested object tags
			if (noteType === "learn" || noteType === "learn-started") {
				buttonRow
					.createEl("button", {
						text: "Reveal",
					})
					.addEventListener("click", () => {
						contentEl.empty();
						MarkdownPreviewView.renderMarkdown(
							front + "\n---\n" + back,
							contentEl,
							randomNote.path,
							this.component
						);
						const buttonRow = contentEl.createDiv("button-row");

						buttonRow
							.createEl("button", {
								text: "Wrong",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomNote, "wrong");
							});

						buttonRow
							.createEl("button", {
								text: "Correct",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomNote, "correct");
							});

						buttonRow
							.createEl("button", {
								text: "Easy",
							})
							.addEventListener("click", () => {
								this.handleScoring(randomNote, "easy");
							});
					});
			} else if (noteType === "habit") {
				// not today, do later, done
				buttonRow
					.createEl("button", {
						text: "Not Today",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "not-today");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "later");
					});

				buttonRow
					.createEl("button", {
						text: "Done",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "done");
					});

				// todo
			} else if (noteType === "todo") {
				// delete, later, not today, done
				buttonRow
					.createEl("button", {
						text: "Delete",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "delete");
					});

				buttonRow
					.createEl("button", {
						text: "Not Today",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "not-today");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "later");
					});

				buttonRow
					.createEl("button", {
						text: "Completed",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "completed");
					});
			}
			// check:
			else if (noteType === "check") {
				// no, kind of, yes
				buttonRow
					.createEl("button", {
						text: "No",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "no");
					});

				buttonRow
					.createEl("button", {
						text: "Kind of",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "kind-of");
					});

				buttonRow
					.createEl("button", {
						text: "Yes",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "yes");
					});
			}
			// book or article
			else if (
				noteType === "book" ||
				noteType === "book-started" ||
				noteType === "article"
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
						this.handleScoring(randomNote, "not-today");
					});

				buttonRow
					.createEl("button", {
						text: "Later",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "later");
					});

				buttonRow
					.createEl("button", {
						text: "Done",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "done");
					});

				buttonRow
					.createEl("button", {
						text: "Finished",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "finished");
					});
			} else {
				buttonRow
					.createEl("button", {
						text: "Show Less Often",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "show-less");
					});
				buttonRow
					.createEl("button", {
						text: "Ok, Cool",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "show-next");
					});

				buttonRow
					.createEl("button", {
						text: "Show More Often",
					})
					.addEventListener("click", () => {
						this.handleScoring(randomNote, "show-more");
					});
			}
		});
	}

	onOpen() {
		const lastNote = localStorage.getItem("lastOpenendNoteName") || "";
		this.loadNewNote(lastNote);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
