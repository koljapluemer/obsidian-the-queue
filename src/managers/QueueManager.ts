import { App, Notice, TFile } from 'obsidian';
import { QueueNoteFactory } from '../models/QueueNoteFactory';
import { QueueView } from '../views/QueueView';

export class QueueManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  // Function to open a random note
  async openRandomNote() {
    const files = this.app.vault.getMarkdownFiles();
    if (files.length === 0) {
      new Notice('No markdown files found!');
      return;
    }

    const randomFile = this.getRandomFile(files);
    // deprecation!! use getLeaf instead
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      new Notice('No leaf found');
      return;
    }

    // Open the random file and apply the custom view
    await leaf.openFile(randomFile);
    
    // Create the QueueNote instance based on frontmatter (q-type)
    const queueNote = QueueNoteFactory.create(randomFile, this.app);

    // Apply the correct view with buttons for this q-type
    const queueView = new QueueView(leaf, queueNote);
    queueView.addButtonsBasedOnNoteType();
  }

  // Helper function to get a random file
  private getRandomFile(files: TFile[]): TFile {
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
  }
}
