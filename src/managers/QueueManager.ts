import { App, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { QueueNoteFactory } from "../models/QueueNoteFactory";
import { QueueView } from "../views/QueueView";
import log from "../logger"; // Import loglevel logger

export class QueueManager {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	// Triggered when the sidebar icon is clicked
	async handleQueueView() {
		// 1. Check if there is an existing QueueView open
		const existingQueueView = this.getExistingQueueView();

		if (existingQueueView) {
			// Focus on the existing QueueView
			log.info("QueueView already open");
			this.app.workspace.setActiveLeaf(existingQueueView.leaf, true);
		} else {
			log.info("No QueueView open, opening a new one");
			// 2. Open a new QueueView and load a random file
			await this.openNewQueueView();
		}
	}

	// Check for existing QueueView open in any leaf
	getExistingQueueView(): QueueView | null {
		const leaves = this.app.workspace.getLeavesOfType("markdown"); // Get all markdown leaves

		for (const leaf of leaves) {
            log.info("Checking leaf for QueueView");
			const view = leaf.view;
			// Check if the view is specifically an instance of QueueView
			if (view instanceof QueueView) {
				console.log("Found an existing QueueView");
				return view as QueueView;
			}
		}

		return null; // No QueueView found
	}

	// Open a new QueueView and load a random file
	async openNewQueueView() {
		const leaf = this.app.workspace.getLeaf(true); // Open in the right pane

		// Load a random file
		const randomFile = await this.loadRandomFile();
		if (!randomFile) {
			new Notice("No markdown files found!");
			return;
		}

		// Create a QueueNote for the random file
		const queueNote = QueueNoteFactory.create(randomFile, this.app);

		// Create and set up the QueueView with the random file
		const queueView = new QueueView(leaf, queueNote);
		leaf.openFile(randomFile); // Ensure the file is opened in the leaf
	}

	// Load a random file from the vault
	async loadRandomFile(): Promise<TFile | null> {
		const files = this.app.vault.getMarkdownFiles();
		if (files.length === 0) {
			return null;
		}

		const randomIndex = Math.floor(Math.random() * files.length);
		return files[randomIndex];
	}

	// Load a new random file in the same existing QueueView
	async loadNewRandomFileInQueueView(queueView: QueueView) {
		const randomFile = await this.loadRandomFile();
		if (!randomFile) {
			new Notice("No markdown files found!");
			return;
		}

		const queueNote = QueueNoteFactory.create(randomFile, this.app);

		// Update the QueueView with the new QueueNote
		queueView.note = queueNote;
		queueView.addButtonsBasedOnNoteType(); // Re-render buttons
		queueView.leaf.openFile(randomFile); // Load the new file in the same leaf
	}
}
