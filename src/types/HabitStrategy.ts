import { NoteTypeStrategy } from './NoteTypeStrategy';
import { QueueNote } from '../models/QueueNote';

export class HabitStrategy implements NoteTypeStrategy {
  // Return the buttons for a "habit" type note
  getButtons(note: QueueNote): HTMLElement[] {
    const notTodayButton = document.createElement('button');
    notTodayButton.textContent = 'Not Today';
    notTodayButton.addEventListener('click', () => {
      this.handleButtonClick('not-today', note);
    });

    const laterButton = document.createElement('button');
    laterButton.textContent = 'Later';
    laterButton.addEventListener('click', () => {
      this.handleButtonClick('later', note);
    });

    const doneButton = document.createElement('button');
    doneButton.textContent = 'Done';
    doneButton.addEventListener('click', () => {
      this.handleButtonClick('done', note);
    });

    return [notTodayButton, laterButton, doneButton];
  }

  // Handle button clicks for "habit" type notes
  handleButtonClick(action: string, note: QueueNote): void {
    switch (action) {
      case 'not-today':
        console.log('Habit postponed');
        note.postpone(); // Delay the due date by the interval
        note.saveUpdates();
        break;

      case 'later':
        console.log('Habit deferred');
        note.postpone(); // Same behavior here, but you can customize it
        note.saveUpdates();
        break;

      case 'done':
        console.log('Habit completed');
        note.dueAt = new Date(); // Reset or handle completed habit logic
        note.saveUpdates();
        break;
    }
  }
}
