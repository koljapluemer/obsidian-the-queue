import {
	App,
	MarkdownPreviewView,
	Modal,
	Notice,
	Component,
	TFile,
	setIcon,
} from "obsidian";

import * as ebisu from "ebisu-js";

import QueueFilterModal from "./QueueFilterModal";
import QueueNote from "../classes/QueueNote";
import { Settings } from "http2";

export default class TheQueueModal extends Modal {
	component: Component;
	settings: Settings;

	constructor(app: App, settings) {
		super(app);
		this.settings = settings;
	}

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

	keywordFilter: string = "All Notes";

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
			const frontmatter = metadata?.frontmatter;
			if (!frontmatter) {
				const qNote = new QueueNote();
			} else {
				const qType = metadata?.frontmatter?.["q-type"] ?? null;
				const qTopic = metadata?.frontmatter?.["q-topic"] ?? null;
				const qKeywords = metadata?.frontmatter?.["q-keywords"] ?? null;
				const qPriority = metadata?.frontmatter?.["q-priority"] ?? null;
				const qInterval = metadata?.frontmatter?.["q-interval"] ?? null;

				const qData = metadata?.frontmatter?.["q-data"];
				const model = qData?.model ?? null;
				const lastSeen = qData?.["last-seen"] ?? null;
				const leechCount = qData?.["leech-count"] ?? null;

				const qNote = new QueueNote(
					qType,
					qTopic,
					qKeywords,
					qPriority,
					qInterval,
					{ model, lastSeen, leechCount }
				);

				// exclude q-type: exclude
				if (qNote.getShouldBeExcluded()) {
					return;
				}
				// if keywordFilter is not "All Notes", check if note has that keyword
				if (this.keywordFilter !== "All Notes") {
					if (!qNote.getKeywords().includes(this.keywordFilter)) {
						return;
					}
				}

				if (
					qNote.getType() === "article" &&
					qNote.getIsCurrentlyDue()
				) {
					this.selectionsOfPickableNotes.dueArticles.push(note);
				} else if (qNote.getType() === "book-started") {
					if (qNote.getIsCurrentlyDue()) {
						this.selectionsOfPickableNotes.dueStartedBooks.push(
							note
						);
					}
					this.selectionsOfPickableNotes.startedBooksEvenIfNotDue.push(
						note
					);
				} else if (qNote.getType() === "book") {
					this.selectionsOfPickableNotes.newBooks.push(note);
				} else if (
					qNote.getType() === "check" &&
					qNote.getIsCurrentlyDue()
				) {
					this.selectionsOfPickableNotes.dueChecks.push(note);
				} else if (
					qNote.getType() === "habit" &&
					qNote.getIsCurrentlyDue()
				) {
					this.selectionsOfPickableNotes.dueHabits.push(note);
				} else if (
					qNote.getType() === "todo" &&
					qNote.getIsCurrentlyDue()
				) {
					this.selectionsOfPickableNotes.dueTodos.push(note);
				} else if (qNote.getType() === "learn-started") {
					// this is an array of one, containing only the note with the lowest predicted recall
					// we have this as [] so it's consistent with the other selections
					// exclude notes with a recall so high that rep is useless rn
					const predictedRecall = qNote.getPredictedRecall();
					if (
						predictedRecall < this.settings.desiredRecallThreshold
					) {
						this.reasonablyRepeatableLearnNotesCounter += 1;
						if (
							qNote.getPredictedRecall() < lowestPredictedRecall
						) {
							lowestPredictedRecall = predictedRecall;
							this.selectionsOfPickableNotes.startedLearnNoteMostCloseToForgetting =
								[note];
						}
					}
				} else if (qNote.getType() === "learn") {
					this.selectionsOfPickableNotes.newLearns.push(note);
				} else if (qNote.getIsCurrentlyDue()) {
					this.selectionsOfPickableNotes.dueMisc.push(note);
				}
			}
		});
		console.info(
			`Nr. of learn cards with predicted recall < ${this.settings.desiredRecallThreshold}: ${this.reasonablyRepeatableLearnNotesCounter}`
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

			// assume stuff will be remembered for different kinds of interval, depending on user's confidence
			// hard = 1m, medium = 2h, easy = 48h
			// give the time in hours!
			let model;
			// use initial scoring and (with guessed initial halflifes)
			if (answer === "hard") {
				model = ebisu.defaultModel(1 / 60);
			} else if (answer === "medium") {
				model = ebisu.defaultModel(2);
			} else if (answer === "easy") {
				model = ebisu.defaultModel(24);
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
			// handle leech counting
			if (score === 0) {
				// if score is 0, increment leech count
				if (frontmatter["q-data"]["leech-count"]) {
					frontmatter["q-data"]["leech-count"] += 1;
				} else {
					frontmatter["q-data"]["leech-count"] = 1;
				}
			} else {
				// if score is not 0, reset leech count
				frontmatter["q-data"]["leech-count"] = 0;
			}
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
				// add 0.5 to leech count
				if (frontmatter["q-data"]["leech-count"]) {
					frontmatter["q-data"]["leech-count"] += 0.5;
				} else {
					frontmatter["q-data"]["leech-count"] = 0.5;
				}
			} else {
				// if answer is Not Today, add 1 to leech count, else reset to 0
				if (answer === "not-today") {
					if (frontmatter["q-data"]["leech-count"]) {
						frontmatter["q-data"]["leech-count"] += 1;
					} else {
						frontmatter["q-data"]["leech-count"] = 1;
					}
				} else {
					frontmatter["q-data"]["leech-count"] = 0;
				}
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
				// add 0.5 to leech count
				if (frontmatter["q-data"]["leech-count"]) {
					frontmatter["q-data"]["leech-count"] += 0.5;
				} else {
					frontmatter["q-data"]["leech-count"] = 0.5;
				}
			} else if (answer === "not-today") {
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() + 16 * 60 * 60 * 1000
				).toISOString();
				// add 1 to leech count
				if (frontmatter["q-data"]["leech-count"]) {
					frontmatter["q-data"]["leech-count"] += 1;
				} else {
					frontmatter["q-data"]["leech-count"] = 1;
				}
			} else {
				// calculate 24h a day, except for the last day, which should only last 16h
				frontmatter["q-data"]["dueat"] = new Date(
					new Date().getTime() +
						24 * 60 * 60 * 1000 * (interval - 1) +
						16 * 60 * 60 * 1000
				).toISOString();
				// reset leech count
				frontmatter["q-data"]["leech-count"] = 0;
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
					`allowing to pick new learn cards, because we only have ${this.reasonablyRepeatableLearnNotesCounter} flashcards with predicted recall < ${this.settings.desiredRecallThreshold}`
				);
				if (this.selectionsOfPickableNotes.newLearns.length > 0) {
					pickableSelections.push("newLearns");
				} else {
					console.info("actually, we have no new learn cards");
				}
			} else {
				console.info(
					`not picking new learn cards, because we have ${this.reasonablyRepeatableLearnNotesCounter} flashcards with predicted recall < ${this.settings.desiredRecallThreshold}`
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
				text: this.keywordFilter,
			});
			if (this.keywordFilter === "All Notes") {
				setIcon(queueSettingsButton, "filter");
			}
			// on click open QueueFilterModal
			queueSettingsButton.addEventListener("click", () => {
				new QueueFilterModal(this.app, (keywordFilter) => {
					this.keywordFilter = keywordFilter;
					this.loadNewNote();
				}).open();
			});

			const closeModalButton = headerEl.createEl("button", {});
			setIcon(closeModalButton, "cross");
			closeModalButton.addEventListener("click", () => {
				this.close();
			});

			// MAIN CONTENT
			const contentEl = modalEl.createDiv("contentEl");
			const title = randomNote.name.replace(".md", "");
			let renderedContent = content;
			let initiallyHiddenContent: String;

			// check if first line is ---!!!!!
			// if so, we have frontmatter that we should treat omit
			if (content.startsWith("---")) {
				const splitNote = content.split("---");
				// rendered content is everything after 2nd index, rejoined
				renderedContent = splitNote.slice(2).join("---");
			}

			if (noteType === "learn-started") {
				// TODO: what if we have badly formatted learn card with no (or multiple separators)
				const splitNote = renderedContent.split("---");
				renderedContent = splitNote[0];
				initiallyHiddenContent = splitNote[1];
			}
			// add title of note before front, with a # to make it a title
			renderedContent = `# ${title}\n\n` + renderedContent;

			MarkdownPreviewView.renderMarkdown(
				renderedContent,
				contentEl,
				randomNote.path,
				Component
			);

			const buttonRow = contentEl.createDiv("button-row");

			function appendScoreButton(
				randomNote: TFile,
				parent,
				label,
				returnValue
			) {
				const button = parent.createEl("button", {
					text: label,
				});
				button.addEventListener("click", () => {
					handleScoring(randomNote, returnValue);
				});
			}

			if (noteType === "learn") {
				appendScoreButton(randomNote, buttonRow, "Seems Hard", "hard");
				appendScoreButton(
					randomNote,
					buttonRow,
					"I'll Try to Remember",
					"medium"
				);
				appendScoreButton(
					randomNote,
					buttonRow,
					"Easy, Got It",
					"easy"
				);
			} else if (noteType === "learn-started") {
				buttonRow
					.createEl("button", {
						text: "Reveal",
					})
					.addEventListener("click", () => {
						contentEl.empty();
						MarkdownPreviewView.renderMarkdown(
							renderedContent +
								"\n---\n" +
								initiallyHiddenContent,
							contentEl,
							randomNote.path,
							this.component
						);
						const secondButtonRow =
							contentEl.createDiv("button-row");

						appendScoreButton(
							randomNote,
							secondButtonRow,
							"Wrong",
							"wrong"
						);
						appendScoreButton(
							randomNote,
							secondButtonRow,
							"Correct",
							"correct"
						);
						appendScoreButton(
							randomNote,
							secondButtonRow,
							"Easy",
							"easy"
						);
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
