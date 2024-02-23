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
			let qNote: QueueNote;
			if (!frontmatter) {
				qNote = new QueueNote();
			} else {
				qNote = QueueNote.createFromMetadata(frontmatter);
			}

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

			if (qNote.getType() === "article" && qNote.getIsCurrentlyDue()) {
				this.selectionsOfPickableNotes.dueArticles.push(note);
			} else if (qNote.getType() === "book-started") {
				if (qNote.getIsCurrentlyDue()) {
					this.selectionsOfPickableNotes.dueStartedBooks.push(note);
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
				if (predictedRecall < this.settings.desiredRecallThreshold) {
					this.reasonablyRepeatableLearnNotesCounter += 1;
					if (qNote.getPredictedRecall() < lowestPredictedRecall) {
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
		});
		console.info(
			`Nr. of learn cards with predicted recall < ${this.settings.desiredRecallThreshold}: ${this.reasonablyRepeatableLearnNotesCounter}`
		);
	}

	handleScoring(note: TFile, answer: string = "") {

		const metadata = this.app.metadataCache.getFileCache(note);
		const frontmatter = metadata?.frontmatter;
		let qNote: QueueNote;
		if (!frontmatter) {
			qNote = new QueueNote();
		} else {
			qNote = QueueNote.createFromMetadata(frontmatter);
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

		if (qNote.getType() === "learn") {
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
			qNote.setModel(model);
			qNote.setLastSeen(new Date().toISOString());
			qNote.startLearning();
		}

		// learning cards that we have seen before
		// TODO: make stuff like this robust against metadata being broken/missing (and think about what to even do)
		if (qNote.getType() === "learn-started") {

			// score: wrong = 0, correct = 1, easy = 2
			const score = answer === "wrong" ? 0 : answer === "correct" ? 1 : 2;
			// handle leech counting
			if (score === 0) {
				qNote.incrementLeechCount(1);
			} else {
				qNote.resetLeechCount();
			}
			qNote.setNewModel(score);
		}

		// note: "book" means *unstarted* book
		if (qNote.getType() === "book") {
			// if later, set in 10m
			if (answer === "later") {
				qNote.setDueLater("a bit later");
			} else {
				qNote.setDueLater("day later");
			}
			// only convert to started if answer is not "not-today" or "later"
			if (answer !== "not-today" && answer !== "later") {
				qNote.startReadingBook();
			}
		}



		if (qNote.getType() === "book-started") {
			if (answer === "later") {
				qNote.setDueLater("a bit later");
				qNote.incrementLeechCount(0.5);
			} else if (answer === "not-today") {
				qNote.setDueLater("day later");
				qNote.incrementLeechCount(1);
			} else if (answer === "done") {
				qNote.setDueLater("day later");
				qNote.resetLeechCount();
			} else if (answer === "finished") {
				qNote.setDueLater("day later");
				qNote.resetLeechCount();
				qNote.finishReadingBook();
			}

		}


		// article works essentially the same as book-started
		if (qNote.getType() === "article") {
			if (answer === "later") {
				qNote.setDueLater("a bit later");
			} else {
				qNote.setDueLater("day later");
			}
			// check if finished
			if (answer === "finished") {
				qNote.finishReadingArticle();
			}
		}



		if (
			qNote.getType() === "check" ||
			qNote.getType() === "habit" ||
			qNote.getType() === "todo"
		) {
			if (answer === "later") {
				qNote.setDueLater("a bit later");
				qNote.incrementLeechCount(0.5);
			} else if (answer === "not-today") {
				qNote.setDueLater("day later");
				qNote.incrementLeechCount(1);
			} else {
				qNote.setDueLater("day later");
				qNote.resetLeechCount();
			}
		}

		// if it's habit, or todo, and the answer is not-today, prompt excuse on the note
		if (
			(qNote.getType() === "habit" || qNote.getType() === "todo") &&
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
		if (qNote.getType() === "todo") {
			if (answer === "completed") {
				// delete note
				this.app.vault.trash(note, true);
			}
		}

		if (qNote.getType() === "misc") {
			if (answer === "show-less") {
				qNote.decrementPriority(1);
			
			} else if (answer === "show-more") {
				qNote.incrementPriority(1);
			}
			qNote.setDueLater("day later");
		}

		// write metadata to file
		
		app.fileManager.processFrontMatter(note, (frontmatter) => {
			if (qNote.getActuallyStoredType()) {
				frontmatter["q-type"] = qNote.getActuallyStoredType();
			}
			if (qNote.getActuallyStoredInterval()) {
				frontmatter["q-interval"] = qNote.getActuallyStoredInterval();
			}
			if (qNote.getActuallyStoredPriority()) {
				frontmatter["q-priority"] = qNote.getActuallyStoredPriority();
			}
			if (qNote.getData()) {
				frontmatter["q-data"] = qNote.getData();
			}
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
		const qNote.getType() =
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

			if (qNote.getType() === "learn-started") {
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

			if (qNote.getType() === "learn") {
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
			} else if (qNote.getType() === "learn-started") {
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
			} else if (qNote.getType() === "habit") {
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
			} else if (qNote.getType() === "todo") {
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
			else if (qNote.getType() === "check") {
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
				qNote.getType() === "book" ||
				qNote.getType() === "book-started" ||
				qNote.getType() === "article"
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
