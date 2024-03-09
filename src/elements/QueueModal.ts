import { App, Modal, Notice, TFile } from "obsidian";

import { getSortedSelectionsOfPickableNotes } from "../utils/getSortedSelectionsOfPickableNotes";
import { render } from "../utils/renderModalNote";
import QueueNote from "../classes/QueueNote";
import QueuePrompt from "../classes/QueuePrompt";
import { PromptType } from "../classes/QueuePrompt";
import { pickRandomNoteWithPriorityWeighting } from "../utils/randomSelection";
import QueueLog from "../classes/QueueLog";

/** Basically the modal itself, mainly tasked with loading a new note. */
export default class QueueModal extends Modal {
	settings: any;

	constructor(app: App, settings: {}) {
		super(app);
		this.settings = settings;
	}

	qNotes: QueueNote[] = [];
	currentQueuePrompt: QueuePrompt;
	keywordFilter: string = "All notes";

	statisticsAboutDueNotesSavedThisSession = false;

	/** Selects a new note to display and calls the render function to display it.
	 * Essentially, this function merely gets all selections (getSortedSelectionsOfPickableNotes),
	 * picks a random one, and then gets a random note from that selection (randomSelection/pickRandomNoteWithPriorityWeighting).
	 *
	 * This function is long and fairly complicated because it is possible that the user closes the QueueModal, for example to edit a note.
	 * In that case, the same note should be opened again when the QueueModal is opened again — however, the whole plugin context is freed when this happened.
	 * For this reason, we save the last opened note in localStorage, and load it again when the QueueModal is opened.
	 *
	 * However, there is additional complexity: The 'orphan' is an artificial note type where the user is prompted to connect a previously unconnected note.
	 * For this, the user closes the QueueModal, connects the note, and then opens the QueueModal again.
	 *
	 * For this reason, we have a fairly large state explosion. We have to check whether there is a a previous note saved, then whether it still exist,
	 * then whether it's an orphan note, and then whether it has been connected (essentially).
	 * That is 90% of what happens in this function, and also the main reason that we need the wrapper class `QueuePrompt` around `QueueNote`.
	 *
	 */
	loadNewNote(lastOpenedNoteName: string | null = null) {
		let loadingLastNote = false;
		let foundNoteToOpen = false;

		if (lastOpenedNoteName !== null) {
			// in this case, load the same note we had open before (not actually random)
			// find note by name
			const lastOpenedFile = this.app.vault.getAbstractFileByPath(lastOpenedNoteName);
			if (lastOpenedFile instanceof TFile) {
				const qNote = QueueNote.createFromNoteFile(lastOpenedFile, this.app);
				loadingLastNote = qNote.getIsCurrentlyDue(this.settings.desiredRecallThreshold);
			
				if (loadingLastNote) {
					let promptType = qNote.guessPromptType();
					// if we have promptType saved in localStorage, use that instead
					const savedPromptType = localStorage.getItem(
						"lastOpenedPromptType"
					);
					if (savedPromptType) {
						// if it's one of the special cases, just get a new note
						// so far, we cannot elegantly check whether the task has been done for any
						if (
							savedPromptType === "orphans" ||
							savedPromptType === "improvables" ||
							savedPromptType === "learnLeeches"
						) {
							promptType = savedPromptType as PromptType;
							loadingLastNote = false;
							localStorage.removeItem("lastOpenedNoteName");
							localStorage.removeItem("lastOpenedPromptType");
						}
					}

					if (loadingLastNote) {
						this.currentQueuePrompt = new QueuePrompt(
							qNote,
							promptType
						);
						foundNoteToOpen = true;
					}
				}
			}
		}

		if (!loadingLastNote) {
			// RANDOM NOTE PICK
			// if no note was loaded, pick a random note
			const pickableSelections = getSortedSelectionsOfPickableNotes(
				this.qNotes,
				this.keywordFilter,
				this.currentQueuePrompt?.qNote || null,
				!this.statisticsAboutDueNotesSavedThisSession,
				this.settings
			);
			// this little variable makes sure that we save the dueStatistic in the logs
			// only once per session
			this.statisticsAboutDueNotesSavedThisSession = true;
			// pick a random selection, then pick a random note from selection of that name
			// count nr of keys in object
			const keys = Object.keys(pickableSelections);
			if (keys.length > 0) {
				// pick a random value from the object
				const randomKey = keys[Math.floor(Math.random() * keys.length)];
				const randomNote = pickRandomNoteWithPriorityWeighting(
					pickableSelections[randomKey]
				);
				this.currentQueuePrompt = new QueuePrompt(
					randomNote,
					randomKey as PromptType
				);
				foundNoteToOpen = true;
			}
		}

		if (!foundNoteToOpen) {
			new Notice("No more notes to review!");
			this.close();
			return;
		}

		localStorage.setItem(
			"lastOpenedNoteName",
			this.currentQueuePrompt.qNote.noteFile.name
		);
		localStorage.setItem(
			"lastOpenedPromptType",
			this.currentQueuePrompt.promptType
		);
		QueueLog.addLog("note-opened", {
			note: this.currentQueuePrompt.qNote.getQueueValuesAsObj(),
			promptType: this.currentQueuePrompt.promptType,
		});

		render(this.currentQueuePrompt, this);
	}

	/** Opens the modal, and loads the first note. */
	onOpen() {
		// loop markdown files, create qNote for each
		this.qNotes = this.app.vault.getMarkdownFiles().map((file) => {
			const qNote = QueueNote.createFromNoteFile(file, this.app);
			return qNote;
		});
		const lastNote = localStorage.getItem("lastOpenedNoteName") || null;
		this.loadNewNote(lastNote);
		this.analyzeNotesOnImprovability();
	}

	async analyzeNotesOnImprovability() {
		this.qNotes.forEach((qNote) => {
			qNote.setIsImprovable(this.app);
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
