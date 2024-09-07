import { Plugin, MarkdownView, TFile, Notice, WorkspaceLeaf } from 'obsidian';

// Custom view extending MarkdownView
class QueueView extends MarkdownView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.addButtonToEditor();
  }

  addButtonToEditor() {
    const editorContainer = this.containerEl; // Stick with editorContainer

    // Check if the button already exists
    if (editorContainer.querySelector('.random-note-button')) return;

    // Create the button element
    const button = document.createElement('button');
    button.textContent = 'Load Another Random Note';
    button.style.marginTop = '10px';
    button.style.position = 'absolute';
    button.style.bottom = '10px';
    button.classList.add('random-note-button');

    // Append the button to the editor container
    editorContainer.appendChild(button);

    // Add event listener to the button
    button.addEventListener('click', () => {
      this.loadRandomNoteInSameView();
    });
  }

  // Function to load a random file into the same view
  async loadRandomNoteInSameView() {
    const files = this.app.vault.getMarkdownFiles();
    if (files.length === 0) {
      new Notice('No markdown files found!');
      return;
    }

    const randomFile = this.getRandomFile(files);
    await this.leaf.openFile(randomFile); // Reuse the current leaf
  }

  // Function to get a random file
  getRandomFile(files: TFile[]): TFile {
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
  }
}

export default class TheQueue extends Plugin {
  onload() {
    console.log('TheQueue plugin loaded');

    // Add ribbon button to the sidebar
    const ribbonIconEl = this.addRibbonIcon('dice', 'Open Random Note', () => {
      this.openRandomNote();
    });

    ribbonIconEl.addClass('my-plugin-ribbon');
  }

  onunload() {
    console.log('TheQueue plugin unloaded');
  }

  // Function to open a random note with the custom view
  async openRandomNote() {
    const files = this.app.vault.getMarkdownFiles();
    
    if (files.length === 0) {
      new Notice('No markdown files found!');
      return;
    }

    const randomFile = this.getRandomFile(files);

    // Open the random note and replace the view with QueueView
	const leaf = this.app.workspace.getLeaf(false);
	await leaf.openFile(randomFile);

    // Use the custom view
    const customView = new QueueView(leaf);
    customView.addButtonToEditor();
  }

  // Helper function to get a random file from an array
  getRandomFile(files: TFile[]): TFile {
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
  }
}
