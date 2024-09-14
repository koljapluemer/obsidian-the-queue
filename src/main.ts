import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { QueueView } from './views/QueueView';
import { getRandomFileFromVault } from './utils/helpers';

export default class QueuePlugin extends Plugin {
  async onload() {
    // Register the new view type for QueueView
    this.registerView('queue-view', (leaf: WorkspaceLeaf) => new QueueView(leaf));

    // Add a ribbon button to open a random file in the QueueView
    this.addRibbonIcon('dice', 'Open Random in Queue', async () => {
      const randomFile = await getRandomFileFromVault(this.app.vault);
      if (randomFile) {
        await this.openInQueueView(randomFile);
      }
    });
  }

  // Method to open a file in QueueView
  async openInQueueView(file: TFile) {
    const leaf = this.app.workspace.getLeaf(false); // Open on the right side
    await leaf.openFile(file, { active: true });

    // Ensure we are using the custom QueueView
    if (!(leaf.view instanceof QueueView)) {
      leaf.setViewState({ type: 'queue-view' }); // Switch to QueueView explicitly
    }

    this.app.workspace.setActiveLeaf(leaf, { focus: true });
  }
}
