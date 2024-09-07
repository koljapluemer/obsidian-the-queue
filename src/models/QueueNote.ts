import { TFile } from 'obsidian';
import { NoteTypeStrategy } from '../types/NoteTypeStrategy';

// QueueNoteOptions interface to define the structure for note options
export interface QueueNoteOptions {
  dueAt: Date;
  interval: number;
  priority: number;
  type: string;
}

export class QueueNote {
  file: TFile;
  dueAt: Date;
  interval: number;
  priority: number;
  type: string;
  private strategy: NoteTypeStrategy; // The strategy to handle specific behavior

  constructor(file: TFile, options: QueueNoteOptions) {
    this.file = file;
    this.dueAt = options.dueAt;
    this.interval = options.interval;
    this.priority = options.priority;
    this.type = options.type;
  }

  // Set the strategy for this note (Habit, Misc, etc.)
  setStrategy(strategy: NoteTypeStrategy) {
    this.strategy = strategy;
  }

  // Check if the note is due based on the dueAt field
  isDue(): boolean {
    const now = new Date();
    return now >= this.dueAt;
  }

  // Postpone the due date by the interval
  postpone() {
    this.dueAt.setDate(this.dueAt.getDate() + this.interval);
  }

  // Get buttons based on the strategy for this note
  getButtons(): HTMLElement[] {
    return this.strategy.getButtons(this);
  }

  // Save the updates to the note's frontmatter
  async saveUpdates() {
    const frontmatter = this.getFrontmatter();
    if (frontmatter) {
      frontmatter['q-data']['due-at'] = this.dueAt.toISOString();
      frontmatter['q-interval'] = this.interval;
      frontmatter['q-priority'] = this.priority;
      await this.saveFrontmatter(frontmatter);
    }
  }

  // Get the frontmatter of the note
  private getFrontmatter() {
    return this.file.app.metadataCache.getFileCache(this.file)?.frontmatter || null;
  }

  // Save the updated frontmatter back to the file (can be implemented in utils.ts)
  private async saveFrontmatter(frontmatter: any) {
    const content = await this.file.vault.read(this.file);
    const updatedContent = this.updateFrontmatter(content, frontmatter);
    await this.file.vault.modify(this.file, updatedContent);
  }

  // Update the frontmatter section in the note content
  private updateFrontmatter(content: string, frontmatter: any): string {
    // Logic to replace the frontmatter section of the content
    // Can use frontmatter serialization logic from utils.ts
    return content; // Placeholder for actual implementation
  }
}
