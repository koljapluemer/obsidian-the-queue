import { NoteTypeStrategy } from './NoteTypeStrategy';
import { QueueNote } from '../models/QueueNote';
import { ButtonFactory } from '../factories/ButtonFactory';
import { showLessAction, okCoolAction, showMoreOftenAction } from '../actions/actions';
import { QueueManager } from '../managers/QueueManager';

export class MiscStrategy implements NoteTypeStrategy {
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
  }

  // Get buttons for the "misc" type
  getButtons(note: QueueNote): HTMLElement[] {
    const buttons: HTMLElement[] = [];

    // Create "Show Less" button
    const showLessButton = ButtonFactory.createButton('Show Less', showLessAction(note, this.queueManager));

    // Create "Ok, Cool" button
    const okCoolButton = ButtonFactory.createButton('Ok, Cool', okCoolAction(note, this.queueManager));

    // Create "Show More Often" button
    const showMoreOftenButton = ButtonFactory.createButton('Show More Often', showMoreOftenAction(note, this.queueManager));

    buttons.push(showLessButton, okCoolButton, showMoreOftenButton);
    return buttons;
  }
}
