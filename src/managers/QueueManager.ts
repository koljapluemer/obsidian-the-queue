import { App, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { QueueNoteFactory } from "../models/QueueNoteFactory";
import { QueueView } from "../views/QueueView";
import log from "../logger"; // Import loglevel logger

export class QueueManager {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async openNextQueueNote() {
		const leaf = this.app.workspace.getLeaf() // Open in the right pane

		// Load a random file

		const files = this.app.vault.getMarkdownFiles();
		if (files.length === 0) {
			return null;
		}

		const randomIndex = Math.floor(Math.random() * files.length);
		const randomFile = files[randomIndex];
		if (!randomFile) {
			new Notice("No markdown files found!");
			return;
		}

		// Create a QueueNote for the random file
		const queueNote = QueueNoteFactory.create(randomFile, this.app, this);

		// Create and set up the QueueView with the random file
		const queueView = new QueueView(leaf, queueNote, this);
		leaf.openFile(randomFile); // Ensure the file is opened in the leaf
	}
}
