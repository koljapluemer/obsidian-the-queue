import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { QueueView, VIEW_TYPE_QUEUE } from './views/QueueView';
import { getRandomFileFromVault } from './utils/helpers';

export default class QueuePlugin extends Plugin {
  async onload() {
    // Register the new view type for QueueView
    this.registerView(VIEW_TYPE_QUEUE, (leaf: WorkspaceLeaf) => new QueueView(leaf));

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
    const { workspace } = this.app;
    console.log(`Opening file in QueueView: ${file.name}`);

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_QUEUE);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_QUEUE, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    workspace.revealLeaf(leaf);
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_QUEUE);
  }
}
