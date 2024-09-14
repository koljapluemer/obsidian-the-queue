import { Component, MarkdownView, WorkspaceLeaf } from "obsidian";
import { QueueNote } from "../models/QueueNote";
import { QueueManager } from "../managers/QueueManager"; // Import the manager to handle file loading

import log from "../logger"; // Import loglevel logger

export class QueueView extends MarkdownView {
	note: QueueNote;
	private queueManager: QueueManager;

	constructor(
		leaf: WorkspaceLeaf,
		note: QueueNote,
		queueManager: QueueManager
	) {
		super(leaf);
		this.note = note;
		this.queueManager = queueManager;
		// this.addButtonsBasedOnNoteType();
		this.injectButtons();
	}

	injectButtons() {
		const currentView =
			this.app.workspace.getActiveViewOfType(MarkdownView);

		if (currentView) {
			// Locate the properties container (where frontmatter or metadata is displayed)
			const propertiesContainer = currentView.containerEl.querySelector(
				".metadata-container"
			);

			// Ensure the properties container exists
			if (propertiesContainer) {
				// Create a div to hold the buttons
				const buttonContainer = document.createElement("div");
				buttonContainer.addClass("my-button-container");

				// Create "Show Next" button
				const showNextButton = document.createElement("button");
				showNextButton.textContent = "Show Next";
				showNextButton.addEventListener("click", () => {
					// Add your logic for the "Show Next" button here
					console.log("Show Next button clicked");
				});

				// Create "Delete" button
				const deleteButton = document.createElement("button");
				deleteButton.textContent = "Delete";
				deleteButton.addEventListener("click", () => {
					// Add your logic for the "Delete" button here
					console.log("Delete button clicked");
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
		}
	}

	// Add buttons based on the note type and strategy
	addButtonsBasedOnNoteType() {
		log.info("Adding buttons based on note type");
		// find by class: .view-content
		// const parentEl = this.containerEl; // Use the container element for button placement
		// find by class .app-container
		// const parentEl = document.querySelector(".mod-active");
		// if (!parentEl) {
		// 	log.error("Parent element not found");
		// 	return;
		// }

		// add buttonwrapper if not exist
		// let buttonWrapper = document.querySelector(".queue-note-buttons");
		// if (!buttonWrapper) {
		// 	buttonWrapper = document.createElement("div");
		// 	buttonWrapper.className = "queue-note-buttons";
		// 	parentEl.appendChild(buttonWrapper);
		// }

		const leaf = this.leaf;
		const parentEl = leaf.view.containerEl;
		const buttonWrapper = document.createElement("div");
		buttonWrapper.className = "queue-note-buttons";
		parentEl.appendChild(buttonWrapper);

		// Clear any existing buttons before adding new ones
		const existingButtons = parentEl.querySelectorAll(".queue-note-button");
		existingButtons.forEach((button) => button.remove());

		// Get the buttons from the note's strategy
		const buttons = this.note.getButtons();
		log.info("Buttons:", buttons);

		// Add each button to the editor container
		buttons.forEach((button) => {
			buttonWrapper.appendChild(button);
		});
	}
}
