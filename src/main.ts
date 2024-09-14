import { Notice, Plugin } from 'obsidian';

export default class FloatingButtonBarPlugin extends Plugin {
  private buttonBar: HTMLDivElement | null = null;

  onload() {
    console.log('Loading Floating Button Bar Plugin...');
    this.createFloatingButtonBar();
  }

  onunload() {
    console.log('Unloading Floating Button Bar Plugin...');
    this.removeFloatingButtonBar();
  }

  // Create the floating button bar and attach it to the .app-container
  createFloatingButtonBar() {
    // Ensure there's only one instance of the button bar
    if (this.buttonBar) return;

    // Create the button bar container
    this.buttonBar = document.createElement('div');
    this.buttonBar.classList.add('floating-button-bar');
    this.buttonBar.style.position = 'fixed';
    this.buttonBar.style.bottom = '20px';
    this.buttonBar.style.right = '20px';
    this.buttonBar.style.zIndex = '1000'; // Ensure it's on top
    this.buttonBar.style.backgroundColor = '#333';
    this.buttonBar.style.padding = '10px';
    this.buttonBar.style.borderRadius = '8px';
    this.buttonBar.style.display = 'flex';
    this.buttonBar.style.gap = '10px';

    // Create "Show Next" button
    const showNextButton = document.createElement('button');
    showNextButton.textContent = 'Show Next';
    showNextButton.addEventListener('click', () => {
      console.log('Show Next button clicked');
      new Notice('Show Next action triggered.');
    });

    // Create "Delete" button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      console.log('Delete button clicked');
      new Notice('Delete action triggered.');
    });

    // Add buttons to the bar
    this.buttonBar.appendChild(showNextButton);
    this.buttonBar.appendChild(deleteButton);

    // Attach the button bar to the .app-container
    document.querySelector('.app-container')?.appendChild(this.buttonBar);
  }

  // Remove the button bar when the plugin is unloaded
  removeFloatingButtonBar() {
    if (this.buttonBar) {
      this.buttonBar.remove();
      this.buttonBar = null;
    }
  }
}
