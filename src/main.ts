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
		if (this.buttonBar) {
			// Remove the existing button bar
			this.removeFloatingButtonBar();
		}

		// Create the button bar container
		this.buttonBar = document.createElement("div");
		//  set css class:
		this.buttonBar.classList.add("floating-button-bar");
		console.log("current note's qType", this.currentQueueNote?.qType);
		switch (this.currentQueueNote?.qType) {
			// habit:
			// not today, do later, done:
			case "habit":
				// Create "Not Today" button
				const notTodayButton = document.createElement("button");
				notTodayButton.textContent = "Not Today";
				notTodayButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(notTodayButton);

				// Create "Do Later" button
				const doLaterButton = document.createElement("button");
				doLaterButton.textContent = "Do Later";
				doLaterButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(3);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(doLaterButton);

				// Create "Done" button
				const doneButton = document.createElement("button");
				doneButton.textContent = "Done";
				doneButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(7);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(doneButton);
				break;
			// check: yes, no, kind of
			case "article":
				// Create "Yes" button
				const yesButton = document.createElement("button");
				yesButton.textContent = "Yes";
				yesButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(yesButton);

				// Create "No" button
				const noButton = document.createElement("button");
				noButton.textContent = "No";
				noButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(7);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(noButton);

				// Create "Kind of" button
				const kindOfButton = document.createElement("button");
				kindOfButton.textContent = "Kind of";
				kindOfButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(3);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(kindOfButton);
				break;
			default:
				// Create "Show Next" button
				const showNextButton = document.createElement("button");
				showNextButton.textContent = "Show Next";
				showNextButton.addEventListener("click", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.buttonBar.appendChild(showNextButton);
				break;
		}

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
			console.log("current note:", this.currentQueueNote);
			this.createFloatingButtonBar();
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
