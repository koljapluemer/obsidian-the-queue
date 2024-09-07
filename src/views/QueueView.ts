import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import { QueueNote } from '../models/QueueNote';
import { QueueManager } from '../managers/QueueManager'; // Import the manager to handle file loading

import log from "../logger"; // Import loglevel logger


export class QueueView extends MarkdownView {
  note: QueueNote;
  private queueManager: QueueManager;

  constructor(leaf: WorkspaceLeaf, note: QueueNote, queueManager: QueueManager) {
    super(leaf);
    this.note = note;
    this.queueManager = queueManager;
    this.addButtonsBasedOnNoteType();
  }

  // Add buttons based on the note type and strategy
  addButtonsBasedOnNoteType() {
    log.info("Adding buttons based on note type");
    // find by class: .view-content
    // const parentEl = this.containerEl; // Use the container element for button placement
    // find by class .app-container
    const parentEl = document.querySelector('.app-container');
    if (!parentEl) {
      log.error("Parent element not found");
      return;
    }

    // Clear any existing buttons before adding new ones
    const existingButtons = parentEl.querySelectorAll('.queue-note-button');
    existingButtons.forEach(button => button.remove());

    // Get the buttons from the note's strategy
    const buttons = this.note.getButtons();
    log.info("Buttons:", buttons);

    // Add each button to the editor container
    buttons.forEach(button => {
        parentEl.createEl('button', {text: 'Click Me'});
    //   button.classList.add('queue-note-button'); // Add class for easy styling
    //   button.addEventListener('click', async () => {
    //     // When a button is clicked, load a new random file in this QueueView
    //     await this.queueManager.loadNewRandomFileInQueueView(this);
    //   });
    //   log.info("Button added to editor container:", button);
    });
  }
}
