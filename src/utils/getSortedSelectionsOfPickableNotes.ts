import QueueNote from "../classes/QueueNote";

interface pickableSelections {
	[key: string]: QueueNote[];
}

/** Returns an object, where each property contains an array
 * each property has a descriptive name like "dueHabits", and its value is an array of QueueNotes that are (in this case) due now and of type habit
 */
export function getSortedSelectionsOfPickableNotes(
	qNotes: QueueNote[],
	keywordFilter: string,
	currentQueueNote: QueueNote | null,
	settings: any
): pickableSelections {
	let dueArticles: QueueNote[] = [];
	let newBooks: QueueNote[] = [];
	let dueStartedBooks: QueueNote[] = [];
	let dueChecks: QueueNote[] = [];
	let dueHabits: QueueNote[] = [];
	let dueTodos: QueueNote[] = [];
	let newLearns: QueueNote[] = [];
	let startedLearnNoteMostCloseToForgetting: QueueNote[] = [];
	let dueMisc: QueueNote[] = [];

	let orphans: QueueNote[] = [];
	let improvables: QueueNote[] = [];

	let counterStartedLearnsBelowThreshold = 0;
	let counterStartedBooksEvenIfNotDue = 0;
	let lowestPredictedRecall = 1;

	qNotes.forEach((qNote) => {
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
			dueArticles.push(qNote);
		} else if (qNote.getType() === "book-started") {
			if (qNote.getIsCurrentlyDue()) {
				dueStartedBooks.push(qNote);
			}
			counterStartedBooksEvenIfNotDue += 1;
		} else if (qNote.getType() === "book") {
			newBooks.push(qNote);
		} else if (qNote.getType() === "check" && qNote.getIsCurrentlyDue()) {
			dueChecks.push(qNote);
		} else if (qNote.getType() === "habit" && qNote.getIsCurrentlyDue()) {
			dueHabits.push(qNote);
		} else if (qNote.getType() === "todo" && qNote.getIsCurrentlyDue()) {
			dueTodos.push(qNote);
		} else if (qNote.getType() === "learn-started") {
			// this is an array of one, containing only the note with the lowest predicted recall
			// we have this as [] so it's consistent with the other selections
			// exclude notes with a recall so high that rep is useless rn
			const predictedRecall = qNote.getPredictedRecall();
			if (predictedRecall < settings.desiredRecallThreshold) {
				counterStartedLearnsBelowThreshold += 1;
				if (qNote.getPredictedRecall() < lowestPredictedRecall) {
					lowestPredictedRecall = predictedRecall;
					startedLearnNoteMostCloseToForgetting.push(qNote);
				}
			}
		} else if (qNote.getType() === "learn") {
			newLearns.push(qNote);
		} else if (qNote.getType() === "misc") {
			if (qNote.getIsCurrentlyDue()) {
				dueMisc.push(qNote);
			}
			// if no links, add to orphans
			if (qNote.getNrOfLinks() === 0) {
				orphans.push(qNote);
			}
		}
		// any due note may be considered improvable if settings.
		if (qNote.isImprovable) {
			improvables.push(qNote);
		}
	});
	// if we have more than 10 learn cards below threshold, remove new learn cards
	// if we have 5 or more started books, also remove new books
	// also, don't include selections that are empty (including key)
	let returnObj: pickableSelections = {};

	console.log(`newLearns: ${newLearns.length}`);
	if (counterStartedLearnsBelowThreshold < 10 && newLearns.length > 0) {
		returnObj.newLearns = newLearns;
	}
	if (counterStartedBooksEvenIfNotDue < 5 && newBooks.length > 0) {
		returnObj.newBooks = newBooks;
	}
	// rest of the selections are a simple 'do they contain anything' check
	if (dueArticles.length > 0) {
		returnObj.dueArticles = dueArticles;
	}
	if (dueStartedBooks.length > 0) {
		returnObj.dueStartedBooks = dueStartedBooks;
	}
	if (dueChecks.length > 0) {
		returnObj.dueChecks = dueChecks;
	}
	if (dueHabits.length > 0) {
		returnObj.dueHabits = dueHabits;
	}
	if (dueTodos.length > 0) {
		returnObj.dueTodos = dueTodos;
	}
	console.log(`startedLearnNoteMostCloseToForgetting: ${startedLearnNoteMostCloseToForgetting}`);
	if (startedLearnNoteMostCloseToForgetting.length > 0) {
		returnObj.startedLearnNoteMostCloseToForgetting =
			startedLearnNoteMostCloseToForgetting;
	}
	if (dueMisc.length > 0) {
		returnObj.dueMisc = dueMisc;
	}
	console.log(`nr of orphans: ${orphans.length}`);
	if (orphans.length > 0) {
		returnObj.orphans = orphans;
	}
	console.log(`nr of improvable notes: ${improvables.length}`);
	if (improvables.length > 0) {
		returnObj.improvables = improvables;
	}

	return returnObj;
}
