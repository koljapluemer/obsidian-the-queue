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
	setIcon,
} from "obsidian";

import { supermemo, SuperMemoItem, SuperMemoGrade } from "supermemo";
import * as ebisu from "ebisu-js";

let keywordFilter = "all-notes";

// Remember to rename these classes and interfaces!

interface TheQueueSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TheQueueSettings = {
	mySetting: "default",
};

// define QueueSettingsModal:
class QueueSettingsModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		// loop through all notes, and generate a set from all found values in the q-keywords frontmatter list property
		const allKeywords = new Set();

		const allNotes = this.app.vault.getMarkdownFiles();
		allNotes.forEach((note) => {
			const metadata = this.app.metadataCache.getFileCache(note);
			const keywordsProperty = metadata?.frontmatter?.["q-keywords"]
			if (keywordsProperty) {
				// check type of keywordsProperty
				const typeOfKeywordsProperty = typeof keywordsProperty;
				console.info("Type", typeOfKeywordsProperty);
				// if it's an array, loop through, if it's a string, add it to the set
				if (Array.isArray(keywordsProperty)) {
					keywordsProperty.forEach((keyword:String) => {
						allKeywords.add(keyword);
					});
				} else if (typeof keywordsProperty === "string") {
					allKeywords.add(keywordsProperty);
				}
			}
		});
		let { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Filter Queue" });
		// add more text to describe
		contentEl.createEl("p", {
			text: "Show only notes with q-keyword:",
		});
		// make a radio button group with all the keywords
		const radioGroup = contentEl.createDiv("queue-settings-radio-group");
		// first, make an 'all notes' option (input first, then label) [RADIO BUTTON!!!]
		const allNotesWrapper = radioGroup.createDiv(
			"queue-settings-radio-wrapper"
		);
		const allNotesInput = allNotesWrapper.createEl("input", {
			type: "radio",
			value: "all-notes",
		});
		// set name property to q-keyword, so that only one can be selected at a time
		allNotesInput.name = "q-keyword";
		allNotesInput.checked = keywordFilter === "all-notes";
		const allNotesLabel = allNotesWrapper.createEl("label", {
			text: "All Notes",
		});
		// then, make an option for each keyword
		allKeywords.forEach((keyword) => {
			const keywordWrapper = radioGroup.createDiv(
				"queue-settings-radio-wrapper"
			);
			const keywordInput = keywordWrapper.createEl("input", {
				type: "radio",
				value: keyword,
			});
			keywordInput.name = "q-keyword";
			keywordInput.checked = keywordFilter === keyword;
			const keywordLabel = keywordWrapper.createEl("label", {
				text: keyword,
			});
		});

		// on change, set keywordFilter to the value of the selected radio button
		radioGroup.addEventListener("change", (evt) => {
			keywordFilter = (evt.target as HTMLInputElement).value;
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		const queueInstantIconEl = this.addRibbonIcon(
			"dice",
			"Instant Queue",
			(evt: MouseEvent) => {
				new TheQueueModal(this.app).open();
			}
		);
		// add settings tab
		this.addSettingTab(new QueueSettingsTab(this.app, this));
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
		startedLearnNoteMostCloseToForgetting: [],
		dueMisc: [],
	};

	// only tracking this to know whether to pick new learn notes
	reasonablyRepeatableLearnNotesCounter = 0;

	loadNotes() {
		// reset arrays
		this.selectionsOfPickableNotes = {
			dueArticles: [],
			newBooks: [],
			dueStartedBooks: [],
			startedBooksEvenIfNotDue: [],
			dueChecks: [],
			dueHabits: [],
			dueTodos: [],
			newLearns: [],
			startedLearnNoteMostCloseToForgetting: [],
			dueMisc: [],
		};

		// get all nodes, exclude inactive notes
		// TODO: make a toggle in settings deciding whether you want this
		// because alternatively, everything without q-type may be ignored
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

		let lowestPredictedRecall = 1;
		this.reasonablyRepeatableLearnNotesCounter = 0;

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
				// if keywordFilter is not "all-notes", check if note has that keyword
				if (keywordFilter !== "all-notes") {
					if (!frontmatter["q-keywords"]) {
						return;
					} else if (
						!frontmatter["q-keywords"].includes(keywordFilter)
					) {
						return;
					}
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
				} else if (qType === "learn-started") {
					try {
						// var predictedRecall = ebisu.predictRecall(model, elapsed, true);
						const model = frontmatter["q-data"]["model"];
						const elapsedTime =
							(new Date().getTime() -
								new Date(
									frontmatter["q-data"]["last-seen"]
								).getTime()) /
							1000 /
							60 /
							60;

						const predictedRecall = ebisu.predictRecall(
							model,
							elapsedTime,
							true
						);
						// this is an array of one, containing only the note with the lowest predicted recall
						// we have this as [] so it's consistent with the other selections

						// TODO: magic number
						// exclude notes with a recall so high that rep is useless rn
						console.info(note.name, predictedRecall);
						if (predictedRecall < 0.8) {
							this.reasonablyRepeatableLearnNotesCounter += 1;

							if (predictedRecall < lowestPredictedRecall) {

								lowestPredictedRecall = predictedRecall;
								this.selectionsOfPickableNotes.startedLearnNoteMostCloseToForgetting =
									[note];
							}
						}
					} catch (error) {
						// purge q-data and set note back to learn q-type
						frontmatter["q-data"] = {};
						frontmatter["q-type"] = "learn";
						// write metadata to file
						const newFrontMatter = frontmatter;
						app.fileManager.processFrontMatter(
							note,
							(frontmatter) => {
								frontmatter["q-data"] =
									newFrontMatter["q-data"];
								frontmatter["q-type"] =
									newFrontMatter["q-type"];
							}
						);
					}
				} else if (qType === "learn") {
					this.selectionsOfPickableNotes.newLearns.push(note);
				} else if (noteIsCurrentlyDue) {
					this.selectionsOfPickableNotes.dueMisc.push(note);
				}
			}
		});
		console.info(
			"Nr. of learn cards worth repeating: ",
			this.reasonablyRepeatableLearnNotesCounter
		);
	}

	handleScoring(note: TFile, answer: string = "") {
		// get type from q-type frontmatter property
		const metadata = this.app.metadataCache.getFileCache(note);
		const frontmatter = metadata!.frontmatter!;
		const noteType = frontmatter["q-type"];
		let interval =
			frontmatter["q-interval"] || frontmatter["interval"] || 1;
		if (!frontmatter["q-data"]) {
			frontmatter["q-data"] = {};
		}

		// save to localstorage q-log
		const qLog = JSON.parse(localStorage.getItem(`q-log-${app.appId}`)!);
		qLog.push({
			noteName: note.name,
			answer: answer,
			time: new Date().toISOString(),
			noteMetadata: frontmatter,
		});
		localStorage.setItem(`q-log-${app.appId}`, JSON.stringify(qLog));

		if (noteType === "learn") {
			// check if q-data exists and is a dict, otherwise create it

			// assume stuff will be remembered for different kinds of interval, depending on score
			// wrong = 10s, correct = 2h, easy = 1d
			// give the time in hours!
			let model;
			// but first, we check if there is "earlier dirt": an "interval" or "q-interval" property, hinting at old SM stuff:
			if (frontmatter["interval"] || frontmatter["q-interval"]) {
				// if so, use that property as halflife for the model:
				const halflife =
					frontmatter["interval"] || frontmatter["q-interval"];
				model = ebisu.defaultModel(halflife * 24);
			} else {
				// elsewise, we use the actual scoring and our guessed initial values
				if (answer === "wrong") {
					model = ebisu.defaultModel((1 / 3600) * 10);
				} else if (answer === "correct") {
					model = ebisu.defaultModel(2);
				} else {
					model = ebisu.defaultModel(24);
				}
			}

			frontmatter["q-data"]["model"] = model;
			frontmatter["q-data"]["last-seen"] = new Date().toISOString();
			frontmatter["q-type"] = "learn-started";
		}

		// learning cards that we have seen before
		// TODO: make stuff like this robust against metadata being broken/missing (and think about what to even do)
		if (noteType === "learn-started") {
			const lastSeen = frontmatter["q-data"]["last-seen"];
			const model = frontmatter["q-data"]["model"];

			// score: wrong = 0, correct = 1, easy = 2
			const score = answer === "wrong" ? 0 : answer === "correct" ? 1 : 2;
			// elapsed in h
			const elapsed =
				(new Date().getTime() - new Date(lastSeen).getTime()) /
				1000 /
				60 /
				60;
			const newModel = ebisu.updateRecall(
				model,
				score,
				2,
				Math.max(elapsed, 0.01)
			);
			frontmatter["q-data"]["model"] = newModel;
			frontmatter["q-data"]["last-seen"] = new Date().toISOString();
		}

		// note: "book" means *unstarted* book
		if (noteType === "book") {
			// if later, set in 10m
			if (answer === "later") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 10 * 60 * 1000
				).toISOString();
			} else {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 16 * 60 * 60 * 1000
				).toISOString();
			}
			// only convert to started if answer is not "not-today" or "later"
			if (answer !== "not-today" && answer !== "later") {
				frontmatter["q-type"] = "book-started";
			}
		}

		if (noteType === "book-started") {
			if (answer === "later") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 10 * 60 * 1000
				).toISOString();
			} else {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 16 * 60 * 60 * 1000
				).toISOString();
			}
			// check if finished
			if (answer === "finished") {
				frontmatter["q-type"] = "misc";
			}
		}

		// article works the same as book-started
		if (noteType === "article") {
			if (answer === "later") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 10 * 60 * 1000
				).toISOString();
			} else {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 16 * 60 * 60 * 1000
				).toISOString();
			}
			// check if finished
			if (answer === "finished") {
				frontmatter["q-type"] = "misc";
			}
		}

		if (
			noteType === "check" ||
			noteType === "habit" ||
			noteType === "todo"
		) {
			if (answer === "later") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 10 * 60 * 1000
				).toISOString();
			} else if (answer === "not-today") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 16 * 60 * 60 * 1000
				).toISOString();
			} else {
				// calculate 24h a day, except for the last day, which should only last 16h
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() +
						24 * 60 * 60 * 1000 * (interval - 1) +
						16 * 60 * 60 * 1000
				).toISOString();
			}
		}

		// if it's habit, or todo, and the answer is not-today, prompt excuse on the note
		if (
			(noteType === "habit" || noteType === "todo") &&
			answer === "not-today"
		) {
			// at bottom of the note, add following text
			// - *excuse 2024-02-1-: *

			const formattedDate = new Date().toISOString().split("T")[0];
			const excuse = `\n\n- *excuse ${formattedDate}*: `;
			this.app.vault.append(note, excuse);
			// go to note; close modal
			this.app.workspace.openLinkText(note.path, "", true);
			this.close();
			
		}

		// just handle the special case of todo being completed (due is handled in the condition before)
		if (noteType === "todo") {
			if (answer === "completed") {
				// delete note
				this.app.vault.trash(note, true);
			}
		}

		if (noteType === "misc" || noteType === "" || !noteType) {
			// if show less, double interval, max 365
			// if show more, halve interval, min 1
			if (answer === "show-less") {
				interval = Math.min(interval * 2, 365);
			} else if (answer === "show-more") {
				interval = Math.max(interval / 2, 1);
			}
			frontmatter["q-data"]["dueat"] = new Date(
				new Date().getTime() +
					24 * 60 * 60 * 1000 * (interval - 1) +
					16 * 60 * 60 * 1000
			).toISOString();
		}

		// write metadata to file
		const newFrontMatter = frontmatter;
		app.fileManager.processFrontMatter(note, (frontmatter) => {
			frontmatter["q-data"] = newFrontMatter["q-data"];
			frontmatter["q-type"] = newFrontMatter["q-type"];
			frontmatter["q-interval"] = interval;
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
		}

		if (!randomNote) {
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
			} else {
				// console.info(
				// 	`not picking new books, because we have ${this.selectionsOfPickableNotes.startedBooksEvenIfNotDue.length} started books (or no new books)`
				// );
			}
			if (this.selectionsOfPickableNotes.dueStartedBooks.length > 0) {
				pickableSelections.push("dueStartedBooks");
				console.info(
					`Nr of started books that are due: ${this.selectionsOfPickableNotes.dueStartedBooks.length}`
				);
			}
			if (this.selectionsOfPickableNotes.dueChecks.length > 0) {
				pickableSelections.push("dueChecks");
				console.info(
					`Nr of check-ins that are due: ${this.selectionsOfPickableNotes.dueChecks.length}`
				);
			}
			if (this.selectionsOfPickableNotes.dueHabits.length > 0) {
				pickableSelections.push("dueHabits");
				console.info(
					`Nr of habits that are due: ${this.selectionsOfPickableNotes.dueHabits.length}`
				);
			}
			if (this.selectionsOfPickableNotes.dueTodos.length > 0) {
				pickableSelections.push("dueTodos");
				console.info(
					`Nr of todos that are due: ${this.selectionsOfPickableNotes.dueTodos.length}`
				);
			}
			// only allow new learns when we have less than n started learns with halflife less than a day
			if (this.reasonablyRepeatableLearnNotesCounter < 10) {
				console.info(
					`picking new learn cards, because we have ${this.reasonablyRepeatableLearnNotesCounter} started learn cards with halflife of less than a day.`
				);
				if (this.selectionsOfPickableNotes.newLearns.length > 0) {
					pickableSelections.push("newLearns");
				} else {
					console.info('actually, we have no new learn cards')
				}
			} else {
				console.info(
					`not picking new learn cards, because we have ${this.reasonablyRepeatableLearnNotesCounter} started learn cards with halflife of less than a day.`
				);
			}

			if (
				this.selectionsOfPickableNotes
					.startedLearnNoteMostCloseToForgetting.length > 0
			) {
				pickableSelections.push(
					"startedLearnNoteMostCloseToForgetting"
				);
			}
			if (this.selectionsOfPickableNotes.dueMisc.length > 0) {
				pickableSelections.push("dueMisc");
			}
			// pick a random selection, then pick a random note from selection of that name
			if (pickableSelections.length > 0) {
				const randomSelection =
					pickableSelections[
						Math.floor(Math.random() * pickableSelections.length)
					];
				console.info(`Picking from: ${randomSelection}`);
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
			const metadata = this.app.metadataCache.getFileCache(randomNote);

			// HEADER
			const headerEl = modalEl.createDiv("headerEl");

			// use q-topic frontmatter property if it exists, otherwise empty
			// give id #modal-topic to make it easy to style
			const topicLabel = headerEl.createEl("span", {
				text: metadata?.frontmatter?.["q-topic"] || "",
			});
			topicLabel.id = "modal-topic";

			// create button to jump to note
			const jumpToNoteButton = headerEl.createEl("button", {});
			setIcon(jumpToNoteButton, "pencil");
			jumpToNoteButton.addEventListener("click", () => {
				this.app.workspace.openLinkText(randomNote.path, "", true);
				this.close();
			});
			// button to open queue settings dialog (add filter to button, but override if its default)
			const queueSettingsButton = headerEl.createEl("button", {
				text: keywordFilter,
			});
			if (keywordFilter === "all-notes") {
				setIcon(queueSettingsButton, "filter");
			}
			// on click open QueueSettingsModal
			queueSettingsButton.addEventListener("click", () => {
				new QueueSettingsModal(this.app).open();
			});

			const closeModalButton = headerEl.createEl("button", {});
			setIcon(closeModalButton, "cross");
			closeModalButton.addEventListener("click", () => {
				this.close();
			});

			// MAIN CONTENT
			const contentEl = modalEl.createDiv("contentEl");

			const splitNote = content.split("---");

			// if metadata has property frontmatter, treat differently
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

		if (!localStorage.getItem(`q-log-${app.appId}`)) {
			localStorage.setItem(`q-log-${app.appId}`, JSON.stringify([]));
		}
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

class QueueSettingsTab extends PluginSettingTab {
	plugin: TheQueue;

	constructor(app: App, plugin: TheQueue) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Data export button (export q-log from localstorage as json)
		// Data reset button

		new Setting(containerEl)
			.setName("Logging Data!")
			.addButton((button) =>
				button.setButtonText("Export Logs").onClick(() => {
					const log = localStorage.getItem(`q-log-${app.appId}`);
					const blob = new Blob([log], { type: "application/json" });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `q-log-${app.appId}.json`;
					a.click();
				})
			)
			.addButton((button) =>
				button.setButtonText("Reset Logs").onClick(() => {
					localStorage.setItem(
						`q-log-${app.appId}`,
						JSON.stringify([])
					);
				})
			);
	}
}
