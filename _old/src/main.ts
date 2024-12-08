import { Notice, Plugin, TFile } from "obsidian";
import { QueueNote } from "./classes/QueueNote";
import NoteTypeHabit from "./classes/NoteTypeHabit";

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
			console.log("Button bar already exists, removing it...");
			// Remove the existing button bar
			this.removeFloatingButtonBar();
		}

		// Create the button bar container
		this.buttonBar = document.createElement("div");
		//  set css class:
		this.buttonBar.classList.add("floating-button-bar");
		console.log("current note's qType", this.currentQueueNote?.qType);
		switch (this.currentQueueNote?.qType) {
			// learn-started: wrong, hard, correct, easy (set due in 1 day)
			case "learn-started":
				this.addButton("Wrong", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Hard", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Correct", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Easy", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// learn: seems hard, I'll try to remember, easy, got it (set due in 1 day)
			case "learn":
				this.addButton("Seems Hard", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("I'll Try to Remember", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Easy, Got It", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// todo: not today, do later, made progress, finished
			case "todo":
				this.addButton("Not Today", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Do Later", () => {
					this.currentQueueNote?.setDueInNMinutes(10);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Made Progress", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Finished", () => {
					this.currentQueueNote?.updateFrontmatter(
						"q-type",
						"todo-finished"
					);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// habit: not today, do later, done
			case "habit":
				this.addButton("Not Today", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Do Later", () => {
					this.currentQueueNote?.setDueInNMinutes(10);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Done", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// check: yes, no, kind of
			case "check":
				this.addButton("Yes", () => {
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("No", () => {
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Kind of", () => {
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// article: same as habit, but with "read a bit" prompt
			case "article":
				this.showPrompt("Read a bit");
				this.addButton("Not Today", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Do Later", () => {
					this.currentQueueNote?.setDueInNMinutes(10);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Done", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// book: same as article, but with a "finished" button to change q-type to "book-finished"
			case "book":
				this.showPrompt("Read a bit");
				this.addButton("Not Today", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Do Later", () => {
					this.currentQueueNote?.setDueInNMinutes(10);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Done", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Finished", () => {
					this.currentQueueNote?.updateFrontmatter(
						"q-type",
						"book-finished"
					);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			// misc: show less, ok cool, show more often (set due in 1 day)
			case "misc":
				this.addButton("Show Less", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Ok, Cool", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				this.addButton("Show More Often", () => {
					this.currentQueueNote?.setDueInNDays(1);
					this.currentQueueNote?.saveUpdates();
					this.loadRandomFile();
				});
				break;

			default:
				// Default action if no qType matches
				this.addButton("Show Next", () => {
					this.loadRandomFile();
				});
				break;
		}

		// Attach the button bar to the .app-container
		document.querySelector(".app-container")?.appendChild(this.buttonBar);
	}

	// Helper to add a button to the button bar
	addButton(text: string, onClick: () => void) {
		const button = document.createElement("button");
		button.textContent = text;
		button.addEventListener("click", onClick);
		if (this.buttonBar) {
			this.buttonBar.appendChild(button);
		}
	}

	// Helper to show a prompt above the buttons
	showPrompt(text: string) {
		const prompt = document.createElement("div");
		prompt.textContent = text;
		prompt.style.marginBottom = "10px"; // Style the prompt
		if (this.buttonBar) {
			this.buttonBar.appendChild(prompt);
		}
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
