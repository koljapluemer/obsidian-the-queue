import { MarkdownView, Notice, WorkspaceLeaf } from 'obsidian';

export class QueueView extends MarkdownView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  // We use onload or similar lifecycle hooks to inject the buttons after the view is rendered
  onload() {
    this.injectButtons(); // Call the button injection method after the view loads
  }

  // Method to inject buttons after the properties (frontmatter)
  injectButtons() {
    const propertiesContainer = this.containerEl.querySelector(".metadata-container");

    // Ensure the properties container exists
    if (propertiesContainer) {
      // Check if the button container already exists
      if (!this.containerEl.querySelector(".my-button-container")) {
        // Create a div to hold the buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.addClass("my-button-container"); // Custom class for easy identification

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
        propertiesContainer.insertAdjacentElement("afterend", buttonContainer);
      }
    }
  }

  // Ensure this view is registered as the correct type
  getViewType() {
    return 'queue-view';
  }

  // Override the default display text
  getDisplayText() {
    return 'Queue View';
  }
}
