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
import { pickRandomNoteWithPriorityWeighting } from "components/utils/randomSelection";
import { Settings } from "http2";
import { getSortedSelectionsOfPickableNotes } from "components/utils/getSortedSelectionsOfPickableNotes";
import { render } from "components/utils/renderModalNote";

export default class TheQueueModal extends Modal {
	component: Component;
	settings: Settings;

	constructor(app: App, settings) {
		super(app);
		this.settings = settings;
	}

	currentQueueNote: TFile | null;
	keywordFilter: string = "All Notes";

	loadNewNote(lastOpenendNoteName: string = "") {
		if (lastOpenendNoteName) {
			// in this case, load the same note we had open before (not actually random)
			// find note by name
			const possibleNotes = this.app.vault.getMarkdownFiles().filter((file) => {
				return file.name === lastOpenendNoteName;
			});
			if (possibleNotes.length > 0) {
				this.currentQueueNote = possibleNotes[0];
			}
		}

		if (!this.currentQueueNote) {
			// RANDOM CARD PICK
			// if no note was loaded, pick a random note

			const pickableSelections = getSortedSelectionsOfPickableNotes(
				this.app.vault.getMarkdownFiles(),
				this.keywordFilter,
				this.currentQueueNote,
				this.settings.desiredRecallThreshold
			);
			// pick a random selection, then pick a random note from selection of that name
			if (pickableSelections.length > 0) {
				console.info(`Pickable selections: ${pickableSelections}`);
				const randomSelection =
					pickableSelections[
						Math.floor(Math.random() * pickableSelections.length)
					];
				console.info(`Picking from: ${randomSelection}`);

				this.currentQueueNote = pickRandomNoteWithPriorityWeighting(
					pickableSelections[randomSelection]
				);
			}
		}

		if (!this.currentQueueNote) {
			new Notice("No more notes to review!");
			this.close();
			return;
		}

		render(QueueNote.createFromNoteFile(this.currentQueueNote), this);
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
