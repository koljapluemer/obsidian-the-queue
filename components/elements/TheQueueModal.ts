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

import { pickRandomNoteWithPriorityWeighting } from "components/utils/randomSelection";
import { Settings } from "http2";
import { getSortedSelectionsOfPickableNotes } from "components/utils/getSortedSelectionsOfPickableNotes";
import { render } from "components/utils/renderModalNote";
import QueueNote from "components/classes/QueueNote";

export default class TheQueueModal extends Modal {
	component: Component;
	settings: Settings;

	constructor(app: App, settings: any) {
		super(app);
		this.settings = settings;
	}

	qNotes: QueueNote[] = [];
	currentQueueNote: QueueNote | null;
	keywordFilter: string = "All Notes";

	loadNewNote(lastOpenendNoteName: string | null = null) {
		let loadingLastNote = false;

		if (lastOpenendNoteName !== null) {
			// in this case, load the same note we had open before (not actually random)
			// find note by name
			const possibleNotes = this.app.vault
				.getMarkdownFiles()
				.filter((file) => {
					return file.name === lastOpenendNoteName;
				});
			if (possibleNotes.length > 0) {
				loadingLastNote = true;
				this.currentQueueNote = QueueNote.createFromNoteFile(
					possibleNotes[0]
				);
			}
		}

		if (!loadingLastNote) {
			// RANDOM CARD PICK
			// if no note was loaded, pick a random note

			const pickableSelections = getSortedSelectionsOfPickableNotes(
				this.qNotes,
				this.keywordFilter,
				this.currentQueueNote,
				(this.settings as any).desiredRecallThreshold
			);
			// pick a random selection, then pick a random note from selection of that name
			if (pickableSelections.length > 0) {
				const randomSelection =
					pickableSelections[
						Math.floor(Math.random() * pickableSelections.length)
					];
				this.currentQueueNote =
					pickRandomNoteWithPriorityWeighting(randomSelection);
			}
		}

		if (!this.currentQueueNote) {
			new Notice("No more notes to review!");
			this.close();
			return;
		}

		render(this.currentQueueNote, this);
	}

	async onOpen() {
		// loop markdown files, create qNote for each
		this.qNotes = this.app.vault.getMarkdownFiles().map((file) => {
			return QueueNote.createFromNoteFile(file);
		});
		const lastNote = localStorage.getItem("lastOpenendNoteName") || "";
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
