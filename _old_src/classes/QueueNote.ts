import { TFile, App } from 'obsidian';

export type QType = 'habit' | 'misc' | 'article'; // Example types

export interface QueueNoteOptions {
  dueAt?: Date;
  interval?: number;
  priority?: number;
  type?: QType;
  keywords?: Array<string>;
  data?: {
    lastSeen?: Date;
    dueAt?: Date;
    leechCount?: number;
    fsrsData?: object;
  };
}

export class QueueNote {
  // No need to explicitly define properties, let the constructor handle it
  constructor(
    public file: TFile,
    public app: App,
    public qType?: QType,
    public qKeywords?: Array<string>,
    public qPriority?: number,
    public qInterval?: number,
    public qData?: {
      lastSeen?: Date;
      dueAt?: Date;
      leechCount?: number;
      fsrsData?: object;
    }
  ) {}

  // Static method to create a QueueNote from frontmatter
  static fromFrontmatter(file: TFile, app: App): QueueNote | null {
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) {
      return null;
    }

    const qType: QType = frontmatter['q-type'] || undefined;
    const qKeywords: Array<string> = frontmatter['q-keywords'] || undefined;
    const qPriority: number = frontmatter['q-priority'] || undefined;
    const qInterval: number = frontmatter['q-interval'] || undefined;

    const qData = {
      lastSeen: frontmatter['q-data']?.['last-seen'] ? new Date(frontmatter['q-data']['last-seen']) : undefined,
      dueAt: frontmatter['q-data']?.['due-at'] ? new Date(frontmatter['q-data']['due-at']) : undefined,
      leechCount: frontmatter['q-data']?.['leech-count'] || undefined,
      fsrsData: frontmatter['q-data']?.['fsrs-data'] || undefined,
    };

    return new QueueNote(file, app, qType, qKeywords, qPriority, qInterval, qData);
  }

  // Example method for saving updates
  async saveUpdates() {
    const frontmatter = this.getFrontmatter();
    if (frontmatter) {
      frontmatter['q-type'] = this.qType;
      frontmatter['q-keywords'] = this.qKeywords;
      frontmatter['q-priority'] = this.qPriority;
      frontmatter['q-interval'] = this.qInterval;

      frontmatter['q-data'] = {
        'last-seen': this.qData?.lastSeen?.toISOString() || undefined,
        'due-at': this.qData?.dueAt?.toISOString() || undefined,
        'leech-count': this.qData?.leechCount || undefined,
        'fsrs-data': this.qData?.fsrsData || undefined,
      };

      await this.saveFrontmatter(frontmatter);
    }
  }

  // Fetch frontmatter from the note
  getFrontmatter() {
    return this.app.metadataCache.getFileCache(this.file)?.frontmatter || null;
  }

  // Save the updated frontmatter to the file
  async saveFrontmatter(frontmatter: any) {
    const content = await this.file.vault.read(this.file);
    const updatedContent = this.updateFrontmatter(content, frontmatter);
    await this.file.vault.modify(this.file, updatedContent);
  }

  // Helper method to update frontmatter in the content
  private updateFrontmatter(content: string, frontmatter: any): string {
    return content; // Placeholder logic for updating frontmatter
  }
}
