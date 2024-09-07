import { QueueNote } from '../models/QueueNote';

export interface NoteTypeStrategy {
  // Define the interface for different note type strategies
  getButtons(note: QueueNote): HTMLElement[]; // Get the appropriate buttons for the q-type
  handleButtonClick(action: string, note: QueueNote): void; // Handle button click actions based on q-type
}
