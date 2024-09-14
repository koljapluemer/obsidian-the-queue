import { QueueNote } from '../models/QueueNote';
import { QueueManager } from '../managers/QueueManager';

// Function to set the note due in 1 day and load the next note
function setNoteDueInOneDay(note: QueueNote) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  note.dueAt = tomorrow;
  note.saveUpdates();
}


// Show Less button action (reduces priority by 1)
export function showLessAction(note: QueueNote, queueManager: QueueManager): () => void {
  return () => {
    note.decreasePriority(); // Decrease priority by 1
    setNoteDueInOneDay(note);
    queueManager.openNextQueueNote(); // Load next note
  };
}

// Ok, Cool button action (sets due in 1 day)
export function okCoolAction(note: QueueNote, queueManager: QueueManager): () => void {
  console.log('Ok, Cool button clicked');
  return () => {
    setNoteDueInOneDay(note);
    queueManager.openNextQueueNote(); // Load next note
  };
}

// Show More Often button action (increases priority by 1)
export function showMoreOftenAction(note: QueueNote, queueManager: QueueManager): () => void {
  return () => {
    note.increasePriority(); // Increase priority by 1
    setNoteDueInOneDay(note);
    queueManager.openNextQueueNote(); // Load next note
  };
}
