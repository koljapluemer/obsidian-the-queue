import { App, Modal, Notice, Component } from "obsidian";

import { pickRandomNoteWithPriorityWeighting } from "components/utils/randomSelection";
import { Settings } from "http2";
import { getSortedSelectionsOfPickableNotes } from "components/utils/getSortedSelectionsOfPickableNotes";
import { render } from "components/utils/renderModalNote";
import QueueNote from "components/classes/QueueNote";
import QueuePrompt from "components/classes/QueuePrompt";
import { PromptType } from "components/classes/QueuePrompt";

export default class TheQueueModal extends Modal {
	component: Component;
	settings: Settings;

	constructor(app: App, settings: any) {
		super(app);
		this.settings = settings;
	}

	qNotes: QueueNote[] = [];
	// currentQueueNote: QueueNote;
	currentQueuePrompt: QueuePrompt;
	keywordFilter: string = "All Notes";

	loadNewNote(lastOpenedNoteName: string | null = null) {
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
				loadingLastNote = true;
				const qNote = QueueNote.createFromNoteFile(possibleNotes[0]);
				let promptType = qNote.guessPromptType();
				// if we have promptType saved in localStorage, use that instead
				const savedPromptType = localStorage.getItem(
					"lastOpenedPromptType"
				);
				if (savedPromptType) {
					// if it's one of the special cases, overwrite it
					if (savedPromptType === "orphans" || savedPromptType === "improvables") {
						promptType = savedPromptType as PromptType;
					}
				}

				this.currentQueuePrompt = new QueuePrompt(qNote, promptType);
				foundNoteToOpen = true;

				if (promptType === "orphans") {
					// if we're looking at an orphan check:
					// check nrOflinks now, if they were added, we are done with the task at hand
					// and should get a new card
					// for this, just let the function continue
					if (qNote.getNrOfLinks() > 0) {
						loadingLastNote = false;
						localStorage.removeItem("lastOpenedNoteName");
						localStorage.removeItem("lastOpenedPromptType");
					}
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
				(this.settings as any).desiredRecallThreshold
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

	async onOpen() {
		// loop markdown files, create qNote for each
		this.qNotes = this.app.vault.getMarkdownFiles().map((file) => {
			return QueueNote.createFromNoteFile(file);
		});
		const lastNote = localStorage.getItem("lastOpenedNoteName") || null;
		this.loadNewNote(lastNote);

		if (!localStorage.getItem(`q-log-${(app as any).appId}`)) {
			localStorage.setItem(
				`q-log-${(app as any).appId}`,
				JSON.stringify([])
			);
		}
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
