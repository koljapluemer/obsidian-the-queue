import { Plugin } from 'obsidian';
import { QueueManager } from './managers/QueueManager';

export default class TheQueue extends Plugin {
  private queueManager: QueueManager;

  async onload() {
    console.log('TheQueue plugin loaded');

    // Initialize the QueueManager
    this.queueManager = new QueueManager(this.app);

    // Add a ribbon button to open a random note
    const ribbonIconEl = this.addRibbonIcon('dice', 'Open Random Note', () => {
      this.queueManager.openRandomNote(); // QueueManager handles the logic
    });

    ribbonIconEl.addClass('my-plugin-ribbon');
  }

  onunload() {
    console.log('TheQueue plugin unloaded');
    // Perform any cleanup if necessary
  }
}
