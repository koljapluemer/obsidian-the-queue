import { App, TFile } from "obsidian";
import { QueueNoteFactory } from "../models/QueueNoteFactory";
import { QueueView } from "../views/QueueView";
import log from '../logger'; // Import loglevel logger

export class QueueManager {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async openRandomNote() {
		try {
			log.debug("Attempting to open a random note...");
			const files = this.app.vault.getMarkdownFiles();
			if (files.length === 0) {
				log.warn("No markdown files found!");
				return;
			}

			const randomFile = this.getRandomFile(files);
			const leaf = this.app.workspace.getRightLeaf(false);
			if (!leaf) {
				log.warn("No leaf found in the right sidebar.");
				return;
			}
			await leaf.openFile(randomFile);

			log.info(`Opened random file: ${randomFile.path}`);
			const queueNote = QueueNoteFactory.create(randomFile, this.app);
			const queueView = new QueueView(leaf, queueNote);
			queueView.addButtonsBasedOnNoteType();

			log.debug("QueueView rendered successfully.");
		} catch (error) {
			log.error(`Failed to open a random note: ${error.message}`);
		}
	}

	private getRandomFile(files: TFile[]): TFile {
		const randomIndex = Math.floor(Math.random() * files.length);
		log.debug(`Random index selected: ${randomIndex}`);
		return files[randomIndex];
	}
}
