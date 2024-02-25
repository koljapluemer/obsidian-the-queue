import {
	App,
	Modal,
	Notice,
	Component,
} from "obsidian";

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
	currentQueueNote: QueueNote;
	keywordFilter: string = "All Notes";

	loadNewNote(lastOpenedNoteName: string | null = null) {
		let loadingLastNote = false;
		let foundNoteToOpen = false;
		let specialUsedSelection: "improvables" | "orphans" | null = null;

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
				this.currentQueueNote = QueueNote.createFromNoteFile(
					possibleNotes[0]
				);
				foundNoteToOpen = true;

				// check if specialUsedSelection is in localstorage
				specialUsedSelection = (localStorage.getItem("specialUsedSelection") as 
					"improvables" | "orphans" | null);
				if (specialUsedSelection !== null) {
					if (specialUsedSelection  === "orphans") {
						// if we're looking at an orphan check:
						// check nrOflinks now, if they were added, we are done with the task at hand
						// and should get a new card
						// for this, just let the function continue
						if (this.currentQueueNote.getNrOfLinks() > 0) {
							loadingLastNote = false;
						}
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
				this.currentQueueNote,
				(this.settings as any).desiredRecallThreshold
			);
			// pick a random selection, then pick a random note from selection of that name
			// count nr of keys in object
			const keys = Object.keys(pickableSelections);
			if (keys.length > 0) {
				// pick a random value from the object
				const randomKey = keys[Math.floor(Math.random() * keys.length)];
				this.currentQueueNote =
					pickRandomNoteWithPriorityWeighting(pickableSelections[randomKey]);
				foundNoteToOpen = true;

				if (randomKey === "improvables" || randomKey === "orphans") {
					specialUsedSelection = randomKey;
					localStorage.setItem("specialUsedSelection", randomKey);
				} else {
					localStorage.removeItem("specialUsedSelection");
				}
			}
		}

		if (!foundNoteToOpen) {
			new Notice("No more notes to review!");
			this.close();
			return;
		}

		render(this.currentQueueNote, this, specialUsedSelection);
	}

	async onOpen() {
		// loop markdown files, create qNote for each
		this.qNotes = this.app.vault.getMarkdownFiles().map((file) => {
			return QueueNote.createFromNoteFile(file);
		});
		const lastNote = localStorage.getItem("lastOpenedNoteName") || "";
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
