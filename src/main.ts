import { Notice, Plugin, TFile } from "obsidian";
import { QueueNote } from "./classes/QueueNote";

export default class QueuePlugin extends Plugin {
	private buttonBar: HTMLDivElement | null = null;
	private currentQueueNote: QueueNote | null = null;

	onload() {
		console.log("Loading Floating Button Bar Plugin...");
		this.createFloatingButtonBar();
	}

	onunload() {
		console.log("Unloading Floating Button Bar Plugin...");
		this.removeFloatingButtonBar();
	}

	// Create the floating button bar and attach it to the .app-container
	createFloatingButtonBar() {
		// Ensure there's only one instance of the button bar
		if (this.buttonBar) return;

		// Create the button bar container
		this.buttonBar = document.createElement("div");
		//  set css class:
		this.buttonBar.classList.add("floating-button-bar");

		// Create "Show Next" button
		const showNextButton = document.createElement("button");
		showNextButton.textContent = "Show Next";
		showNextButton.addEventListener("click", () => {
			this.currentQueueNote?.setDueInNDays(1);
			this.currentQueueNote?.saveUpdates();
			this.loadRandomFile();
		});

		// Add buttons to the bar
		this.buttonBar.appendChild(showNextButton);

		// Attach the button bar to the .app-container
		document.querySelector(".app-container")?.appendChild(this.buttonBar);
	}

	// Remove the button bar when the plugin is unloaded
	removeFloatingButtonBar() {
		if (this.buttonBar) {
			this.buttonBar.remove();
			this.buttonBar = null;
		}
	}

	// Load a random TFile in the current view
	async loadRandomFile() {
		const randomFile = await this.getRandomFileFromVault();
		if (randomFile) {
			const leaf = this.app.workspace.getLeaf(false);
			if (leaf) {
				await leaf.openFile(randomFile);
			}

			// Create a QueueNote instance for the random file
			this.currentQueueNote = QueueNote.fromFile(randomFile, this.app);
			console.log("current note", this.currentQueueNote);
		}
	}

	// Helper to get a random file from the vault
	async getRandomFileFromVault(): Promise<TFile | null> {
		const allFiles = this.app.vault.getFiles();
		if (allFiles.length === 0) {
			new Notice("No files in the vault!");
			return null;
		}

		const randomIndex = Math.floor(Math.random() * allFiles.length);
		return allFiles[randomIndex];
	}
}
