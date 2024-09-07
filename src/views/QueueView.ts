import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import { QueueNote } from '../models/QueueNote';
import { QueueManager } from '../managers/QueueManager'; // Import the manager to handle file loading

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
    const editorContainer = this.containerEl; // Use the container element for button placement

    // Clear any existing buttons before adding new ones
    const existingButtons = editorContainer.querySelectorAll('.queue-note-button');
    existingButtons.forEach(button => button.remove());

    // Get the buttons from the note's strategy
    const buttons = this.note.getButtons();

    // Add each button to the editor container
    buttons.forEach(button => {
      button.classList.add('queue-note-button'); // Add class for easy styling
      button.addEventListener('click', async () => {
        // When a button is clicked, load a new random file in this QueueView
        await this.queueManager.loadNewRandomFileInQueueView(this);
      });
      editorContainer.appendChild(button);
    });
  }
}
