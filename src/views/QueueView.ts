import { MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';

export class QueueView extends MarkdownView {

    constructor(leaf: WorkspaceLeaf, file: TFile) {
        super(leaf);
        this.addButtonsAfterProperties();
    }

    // Injects the "Show Next" button after the properties
    addButtonsAfterProperties() {
        const propsContainer = this.containerEl.querySelector('.metadata-container');
        if (propsContainer && !this.containerEl.querySelector('.queue-button-container')) {
            const buttonContainer = document.createElement('div');
            buttonContainer.addClass('queue-button-container');

            // Create "Show Next" button
            const showNextButton = document.createElement('button');
            showNextButton.textContent = 'Show Next';
            showNextButton.addEventListener('click', () => {
                console.log('Show Next button clicked');
                // Logic to load the next random note could be added here
            });

            // Add the button to the container
            buttonContainer.appendChild(showNextButton);
            propsContainer.insertAdjacentElement('afterend', buttonContainer);
        }
    }

    // Optional: Override the onOpen method if needed
    async onOpen(): Promise<void> {
        await super.onOpen();
        this.addButtonsAfterProperties();
    }
}
