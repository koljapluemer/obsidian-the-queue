import { TFile, App } from 'obsidian';
import { QueueNote } from './QueueNote';
import { MiscStrategy } from '../types/MiscStrategy';  // Example strategies
import { QueueManager } from '../managers/QueueManager';  // QueueManager
import { NoteTypeStrategy } from '../types/NoteTypeStrategy';
import { QType } from './QueueNote';

export class QueueNoteFactory {
  static create(file: TFile, app: App, queueManager: QueueManager): QueueNote {
    // Extract frontmatter from the file
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

    // Determine the note properties from frontmatter
    const qType = frontmatter?.['q-type'] || 'misc';
    const keywords = frontmatter?.['q-keywords'] || [];
    const priority = frontmatter?.['q-priority'] || 0;
    const interval = frontmatter?.['q-interval'] || 1;

    const data = {
      lastSeen: frontmatter?.['q-data']?.['last-seen'] ? new Date(frontmatter['q-data']['last-seen']) : undefined,
      dueAt: frontmatter?.['q-data']?.['due-at'] ? new Date(frontmatter['q-data']['due-at']) : undefined,
      leechCount: frontmatter?.['q-data']?.['leech-count'] || 0,
      fsrsData: frontmatter?.['q-data']?.['fsrs-data'] || undefined,
    };

    // Create the QueueNote instance
    const queueNote = new QueueNote(file, app, qType, keywords, priority, interval, data);

    // Set the appropriate strategy based on the note qType and pass the queueManager
    const strategy = this.getStrategyForType(qType, queueNote, queueManager);
    queueNote.setStrategy(strategy);

    return queueNote;
  }

  // Determine and return the strategy based on the q-qType
  static getStrategyForType(qType: string, note: QueueNote, queueManager: QueueManager): NoteTypeStrategy {
    switch (qType) {
      case 'misc':
      default:
        return new MiscStrategy(queueManager);  // MiscStrategy needs QueueManager
    }
  }
}
