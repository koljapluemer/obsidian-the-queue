import { NoteTypeStrategy } from './NoteTypeStrategy';
import { QueueNote } from '../models/QueueNote';

export class MiscStrategy implements NoteTypeStrategy {
  // Return the button for a "misc" type note
  getButtons(note: QueueNote): HTMLElement[] {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Cool, Next';
    nextButton.addEventListener('click', () => {
      this.handleButtonClick('next', note);
    });

    return [nextButton];
  }

  // Handle the "next" action for misc notes
  handleButtonClick(action: string, note: QueueNote): void {
    if (action === 'next') {
      console.log('Moving to the next misc note');
      // Custom behavior for misc notes (e.g., loading another random note)
    }
  }
}
