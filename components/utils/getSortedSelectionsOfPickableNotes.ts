import QueueNote from "components/classes/QueueNote";
import { TFile } from "obsidian";

function slipNoteIntoPrioritySortedArray(notes: QueueNote[], note: QueueNote) {
	// assume that notes are sorted by priority
	// alter the array such that the note is in the right place:
	// highest priority last
	if (notes.length === 0) {
		return [note];
	}
	let i = 0;
	while (i < notes.length && notes[i].getPriority() >= note.getPriority()) {
		i += 1;
	}
	notes.splice(i, 0, note);
	return notes;
}

// return array of string TFile arrays
export function getSortedSelectionsOfPickableNotes(
	markdownFiles: TFile[],
	keywordFilter: string,
	currentQueueNote: QueueNote | null,
	desiredRecallThreshold: number
): QueueNote[][] {
	let dueArticles: QueueNote[] = [];
	let newBooks: QueueNote[] = [];
	let dueStartedBooks: QueueNote[] = [];
	let dueChecks: QueueNote[] = [];
	let dueHabits: QueueNote[] = [];
	let dueTodos: QueueNote[] = [];
	let newLearns: QueueNote[] = [];
	let startedLearnNoteMostCloseToForgetting: QueueNote[] = [];
	let dueMisc: QueueNote[] = [];

	let counterStartedLearnsBelowThreshold = 0;
	let counterStartedBooksEvenIfNotDue = 0;
	let lowestPredictedRecall = 1;

	markdownFiles.forEach((note) => {
		// check if markdown file, otherwise skip:
		if (note.extension !== "md") {
			return;
		}

		const qNote = QueueNote.createFromNoteFile(note);

		// exclude q-type: exclude
		if (qNote.getShouldBeExcluded()) {
			return;
		}
		// if equal to current one, also skip
		if (qNote === currentQueueNote) {
			return;
		}
		// if keywordFilter is not "All Notes", check if note has that keyword
		if (keywordFilter !== "All Notes") {
			if (!qNote.getKeywords().includes(keywordFilter)) {
				return;
			}
		}

		if (qNote.getType() === "article" && qNote.getIsCurrentlyDue()) {
			dueArticles = slipNoteIntoPrioritySortedArray(dueArticles, qNote);
		} else if (qNote.getType() === "book-started") {
			if (qNote.getIsCurrentlyDue()) {
				dueStartedBooks = slipNoteIntoPrioritySortedArray(
					dueStartedBooks,
					qNote
				);
			}
			counterStartedBooksEvenIfNotDue += 1;
		} else if (qNote.getType() === "book") {
			newBooks = slipNoteIntoPrioritySortedArray(newBooks, qNote);
		} else if (qNote.getType() === "check" && qNote.getIsCurrentlyDue()) {
			dueChecks = slipNoteIntoPrioritySortedArray(dueChecks, qNote);
		} else if (qNote.getType() === "habit" && qNote.getIsCurrentlyDue()) {
			dueHabits = slipNoteIntoPrioritySortedArray(dueHabits, qNote);
		} else if (qNote.getType() === "todo" && qNote.getIsCurrentlyDue()) {
			dueTodos = slipNoteIntoPrioritySortedArray(dueTodos, qNote);
		} else if (qNote.getType() === "learn-started") {
			// this is an array of one, containing only the note with the lowest predicted recall
			// we have this as [] so it's consistent with the other selections
			// exclude notes with a recall so high that rep is useless rn
			const predictedRecall = qNote.getPredictedRecall();
			if (predictedRecall < desiredRecallThreshold) {
				counterStartedLearnsBelowThreshold += 1;
				if (qNote.getPredictedRecall() < lowestPredictedRecall) {
					lowestPredictedRecall = predictedRecall;
					startedLearnNoteMostCloseToForgetting =
						slipNoteIntoPrioritySortedArray(
							startedLearnNoteMostCloseToForgetting,
							qNote
						);
				}
			}
		} else if (qNote.getType() === "learn") {
			newLearns = slipNoteIntoPrioritySortedArray(newLearns, qNote);
		} else if (qNote.getIsCurrentlyDue()) {
			dueMisc = slipNoteIntoPrioritySortedArray(dueMisc, qNote);
		}
	});
	// if we have more than 10 learn cards below threshold, remove new learn cards
	// if we have 5 or more started books, also remove new books
	// also, don't include selections that are empty (including key)
	let returnObj: QueueNote[][] = [];
    if (counterStartedLearnsBelowThreshold < 10 && newLearns.length > 0) {
        returnObj.push(newLearns);
    }
    if (counterStartedBooksEvenIfNotDue < 5 && newBooks.length > 0) {
        returnObj.push(newBooks);
    }
    // rest of the selections are a simple 'do they contain anything' check
    if (dueArticles.length > 0) {
        returnObj.push(dueArticles);
    }
    if (dueStartedBooks.length > 0) {
        returnObj.push(dueStartedBooks);
    }
    if (dueChecks.length > 0) {
        returnObj.push(dueChecks);
    }
    if (dueHabits.length > 0) {
        returnObj.push(dueHabits);
    }
    if (dueTodos.length > 0) {
        returnObj.push(dueTodos);
    }
    if (startedLearnNoteMostCloseToForgetting.length > 0) {
        returnObj.push(startedLearnNoteMostCloseToForgetting);
    }
    if (dueMisc.length > 0) {
        returnObj.push(dueMisc);
    }

	return returnObj;
}
