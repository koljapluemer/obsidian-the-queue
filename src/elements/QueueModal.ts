import { App, Modal, Notice, Component } from "obsidian";

import { getSortedSelectionsOfPickableNotes } from "../utils/getSortedSelectionsOfPickableNotes";
import { render } from "../utils/renderModalNote";
import QueueNote from "../classes/QueueNote";
import QueuePrompt from "../classes/QueuePrompt";
import { PromptType } from "../classes/QueuePrompt";
import { pickRandomNoteWithPriorityWeighting } from "../utils/randomSelection";

/** Basically the modal itself, mainly tasked with loading a new note. */
export default class QueueModal extends Modal {
	component: Component;
	settings: any;

	constructor(app: App, settings: any) {
		super(app);
		this.settings = settings;
	}

	qNotes: QueueNote[] = [];
	// currentQueueNote: QueueNote;
	currentQueuePrompt: QueuePrompt;
	keywordFilter: string = "All Notes";

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
	 * For this reason, we have a fairly large stage explosion. We have to check whether there is a a previous note saved, then whether it still exist,
	 * then whether it's an orphan note, and then whether it has been connected (essentially).
	 * That is 90% of what happens in this function, and also the main reason that we need the wrapper class `QueuePrompt` around `QueueNote`.
	 *
	 */
	async loadNewNote(lastOpenedNoteName: string | null = null) {
		let loadingLastNote = false;
		let foundNoteToOpen = false;

		if (lastOpenedNoteName !== null) {
			// in this case, load the same note we had open before (not actually random)
			// find note by name
			const possibleNotes = this.app.vault
				.getMarkdownFiles()
				.filter((file) => {
					return file.name === lastOpenedNoteName;
				});
			if (possibleNotes.length > 0) {
				const qNote = QueueNote.createFromNoteFile(possibleNotes[0]);
				loadingLastNote = qNote.getIsCurrentlyDue();
				if (loadingLastNote) {
					let promptType = qNote.guessPromptType();
					// if we have promptType saved in localStorage, use that instead
					const savedPromptType = localStorage.getItem(
						"lastOpenedPromptType"
					);
					if (savedPromptType) {
						// if it's one of the special cases, overwrite it
						if (
							savedPromptType === "orphans" ||
							savedPromptType === "improvables"
						) {
							promptType = savedPromptType as PromptType;
						}
					}


					this.currentQueuePrompt = new QueuePrompt(
						qNote,
						promptType
					);
					foundNoteToOpen = true;

					// for orphans and improvables, trust that the edit is made
					// because change in file may not be registered very quickly, and that makes it *very* frustrating
					// TODO: think about an elegant solution for this
					if (
						promptType === "orphans" ||
						promptType === "improvables"
					) {
						loadingLastNote = false;
						localStorage.removeItem("lastOpenedNoteName");
						localStorage.removeItem("lastOpenedPromptType");
					}
				} else {
					console.info(
						`last note ${qNote.noteFile.name} was loaded, but is not due. Skipping.`
					);
				}
			}
		}

		if (!loadingLastNote) {
			// RANDOM CARD PICK
			// if no note was loaded, pick a random note
			const pickableSelections = getSortedSelectionsOfPickableNotes(
				this.qNotes,
				this.keywordFilter,
				this.currentQueuePrompt?.qNote || null,
				this.settings.desiredRecallThreshold
			);
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

		render(this.currentQueuePrompt, this);
	}

	/** Opens the modal, and loads the first note. */
	onOpen() {
		// loop markdown files, create qNote for each
		this.qNotes = this.app.vault.getMarkdownFiles().map((file) => {
			const qNote = QueueNote.createFromNoteFile(file);
			return qNote;
		});
		const lastNote = localStorage.getItem("lastOpenedNoteName") || null;
		this.loadNewNote(lastNote);
		this.analyzeNotesOnImprovability();
	}

	async analyzeNotesOnImprovability() {
		this.qNotes.forEach((qNote) => {
			qNote.setIsImprovable();
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
