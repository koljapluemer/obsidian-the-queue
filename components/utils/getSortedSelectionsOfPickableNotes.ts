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
	currentQueueNote: TFile | null,
	desiredRecallThreshold: number
): any {
	interface Selections {
		dueArticles: QueueNote[];
		newBooks: QueueNote[];
		dueStartedBooks: QueueNote[];
		dueChecks: QueueNote[];
		dueHabits: QueueNote[];
		dueTodos: QueueNote[];
		newLearns: QueueNote[];
		startedLearnNoteMostCloseToForgetting: QueueNote[];
		dueMisc: QueueNote[];
	}
	const selections: Selections = {
		dueArticles: [],
		newBooks: [],
		dueStartedBooks: [],
		dueChecks: [],
		dueHabits: [],
		dueTodos: [],
		newLearns: [],
		startedLearnNoteMostCloseToForgetting: [],
		dueMisc: [],
	};

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
		if (note === currentQueueNote) {
			return;
		}
		// if keywordFilter is not "All Notes", check if note has that keyword
		if (keywordFilter !== "All Notes") {
			if (!qNote.getKeywords().includes(keywordFilter)) {
				return;
			}
		}

		if (qNote.getType() === "article" && qNote.getIsCurrentlyDue()) {
			selections.dueArticles = slipNoteIntoPrioritySortedArray(
				selections.dueArticles,
				qNote
			);
		} else if (qNote.getType() === "book-started") {
			if (qNote.getIsCurrentlyDue()) {
				selections.dueStartedBooks = slipNoteIntoPrioritySortedArray(
					selections.dueStartedBooks,
					qNote
				);
			}
			counterStartedBooksEvenIfNotDue += 1;
		} else if (qNote.getType() === "book") {
			selections.newBooks = slipNoteIntoPrioritySortedArray(
				selections.newBooks,
				qNote
			);
		} else if (qNote.getType() === "check" && qNote.getIsCurrentlyDue()) {
			selections.dueChecks = slipNoteIntoPrioritySortedArray(
				selections.dueChecks,
				qNote
			);
		} else if (qNote.getType() === "habit" && qNote.getIsCurrentlyDue()) {
			selections.dueHabits = slipNoteIntoPrioritySortedArray(
				selections.dueHabits,
				qNote
			);
		} else if (qNote.getType() === "todo" && qNote.getIsCurrentlyDue()) {
			selections.dueTodos = slipNoteIntoPrioritySortedArray(
				selections.dueTodos,
				qNote
			);
		} else if (qNote.getType() === "learn-started") {
			// this is an array of one, containing only the note with the lowest predicted recall
			// we have this as [] so it's consistent with the other selections
			// exclude notes with a recall so high that rep is useless rn
			const predictedRecall = qNote.getPredictedRecall();
			console.info(
				`Predicted recall of ${note.name}: ${predictedRecall}`
			);
			if (predictedRecall < desiredRecallThreshold) {
				counterStartedLearnsBelowThreshold += 1;
				if (qNote.getPredictedRecall() < lowestPredictedRecall) {
					lowestPredictedRecall = predictedRecall;
					selections.startedLearnNoteMostCloseToForgetting =
						slipNoteIntoPrioritySortedArray(
							selections.startedLearnNoteMostCloseToForgetting,
							qNote
						);
				}
			}
		} else if (qNote.getType() === "learn") {
			selections.newLearns = slipNoteIntoPrioritySortedArray(
				selections.newLearns,
				qNote
			);
		} else if (qNote.getIsCurrentlyDue()) {
			selections.dueMisc = slipNoteIntoPrioritySortedArray(
				selections.dueMisc,
				qNote
			);
		}
	});
	console.info(
		`Nr. of learn cards with predicted recall < ${desiredRecallThreshold}: ${counterStartedLearnsBelowThreshold}`
	);
	// if we have more than 10 learn cards below threshold, remove new learn cards
    // if we have 5 or more started books, also remove new books
	// also, don't include selections that are empty (including key)
    const returnObj = {};

	for (const key in selections) {
		if (key === "newBooks" && counterStartedBooksEvenIfNotDue > 4) {
            continue;
        }
        if (key === "newLearns" && counterStartedLearnsBelowThreshold > 9) {
            continue;
        }
        if (selections[key].length > 0) {
            returnObj[key] = selections[key];
        }
	}

    return returnObj;
}
