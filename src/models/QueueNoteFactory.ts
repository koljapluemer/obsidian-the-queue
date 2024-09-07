import { TFile, App } from 'obsidian';
import { QueueNote, QueueNoteOptions } from './QueueNote';
import { HabitStrategy } from '../types/HabitStrategy';
import { MiscStrategy } from '../types/MiscStrategy';
import { NoteTypeStrategy } from '../types/NoteTypeStrategy';

export class QueueNoteFactory {
  // Factory method to create a QueueNote based on the frontmatter of the file
  static create(file: TFile, app: App): QueueNote {
    // Extract frontmatter from the file using Obsidian's metadataCache
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

    // If there's no frontmatter, use default values
    if (!frontmatter || !frontmatter['q-data']) {
      return this.createMiscNote(file);
    }

    // Parse frontmatter to extract q-type and other relevant data
    const options: QueueNoteOptions = {
      dueAt: new Date(frontmatter['q-data']['due-at']),
      interval: frontmatter['q-interval'] || 1,
      priority: frontmatter['q-priority'] || 0,
      type: frontmatter['q-type'] || 'misc',
    };

    // Return a specific note type based on q-type
    return this.createNoteByType(file, options);
  }

  // Create a QueueNote with a specific strategy based on the q-type
  private static createNoteByType(file: TFile, options: QueueNoteOptions): QueueNote {
    let strategy: NoteTypeStrategy;

    // for now, everything is a misc note
    switch (options.type) {
    //   case 'habit':
    //     strategy = new HabitStrategy();
    //     break;
      case 'misc':
      default:
        strategy = new MiscStrategy();
        break;
    }

    // Instantiate the QueueNote and assign the correct strategy
    const note = new QueueNote(file, options);
    note.setStrategy(strategy); // Assign the strategy to the note
    return note;
  }

  // Default creation for misc-type notes
  private static createMiscNote(file: TFile): QueueNote {
    const options: QueueNoteOptions = {
      dueAt: new Date(),
      interval: 1,
      priority: 0,
      type: 'misc',
    };

    const strategy = new MiscStrategy();
    const note = new QueueNote(file, options);
    note.setStrategy(strategy); // Assign the misc strategy
    return note;
  }
}
