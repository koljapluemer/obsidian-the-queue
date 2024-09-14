import { MarkdownView, Notice, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_QUEUE = "queue-view";

export class QueueView extends MarkdownView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	// Define the view type for QueueView
	getViewType() {
		return VIEW_TYPE_QUEUE;
	}

	// Define a display name for the view
	getDisplayText() {
		return "Queue View";
	}

	// Use Obsidian's lifecycle method to handle when the view is opened
	async onOpen() {
    super.onOpen();
		const propertiesContainer = this.containerEl.querySelector(
			".metadata-container"
		);
		const customHeading = document.createElement("h2");
		customHeading.textContent = "Queue View";
		if (propertiesContainer) {
			propertiesContainer.insertAdjacentElement(
				"beforebegin",
				customHeading
			);
		} else {
			console.warn("Properties container not found!");
		}
	}

	// Method to inject buttons after the frontmatter (properties section)
	injectButtons() {
		const propertiesContainer = this.containerEl.querySelector(
			".metadata-container"
		);

		if (propertiesContainer) {
			if (!this.containerEl.querySelector(".queue-button-container")) {
				const buttonContainer = document.createElement("div");
				buttonContainer.addClass("queue-button-container");

				// Create "Show Next" button
				const showNextButton = document.createElement("button");
				showNextButton.textContent = "Show Next";
				showNextButton.addEventListener("click", () => {
					console.log("Show Next button clicked");
					new Notice("Loading next file...");
				});

				// Create "Delete" button
				const deleteButton = document.createElement("button");
				deleteButton.textContent = "Delete";
				deleteButton.addEventListener("click", () => {
					console.log("Delete button clicked");
					new Notice("Note deleted");
				});

				// Add buttons to the container
				buttonContainer.appendChild(showNextButton);
				buttonContainer.appendChild(deleteButton);

				// Inject the button container after the properties section
				propertiesContainer.insertAdjacentElement(
					"afterend",
					buttonContainer
				);
			}
		} else {
			console.warn("Properties container not found!");
		}
	}
}
