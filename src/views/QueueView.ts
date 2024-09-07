import { MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';
import { QueueNote } from '../models/QueueNote';

export class QueueView extends MarkdownView {
  note: QueueNote;

  constructor(leaf: WorkspaceLeaf, note: QueueNote) {
    super(leaf);
    this.note = note;
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
      editorContainer.appendChild(button);
    });
  }
}
