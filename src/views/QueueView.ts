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
		this.addButtonsBasedOnNoteType();

        // get html parent of parentcontainer
        const parentContainer = this.containerEl.parentElement;

        // add an HTML element h1 "welcome to your view" on top
        const container = this.containerEl.children[1];
        const h1 = document.createElement("h1");
        h1.innerText = "Welcome to your view";
        parentContainer!.createEl("h1", { text: "Welcome to your view!" });
        console.log("parentContainer", parentContainer);

        console.log("container", container);
	}

	// Add buttons based on the note type and strategy
	addButtonsBasedOnNoteType() {


		log.info("Adding buttons based on note type");
		// find by class: .view-content
		// const parentEl = this.containerEl; // Use the container element for button placement
		// find by class .app-container
		const parentEl = document.querySelector(".mod-active");
		if (!parentEl) {
			log.error("Parent element not found");
			return;
		}


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
