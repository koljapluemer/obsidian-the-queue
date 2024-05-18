import QueueLog from "../classes/QueueLog";
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
	saveStatistics = false,
	settings: any
): pickableSelections {
	let dueArticles: QueueNote[] = [];
	let newBooks: QueueNote[] = [];
	let dueStartedBooks: QueueNote[] = [];
	let dueChecks: QueueNote[] = [];
	let dueHabits: QueueNote[] = [];
	let dueTodos: QueueNote[] = [];
	let newLearns: QueueNote[] = [];
	let dueFRSRNotes: QueueNote[] = [];
	let dueMisc: QueueNote[] = [];

	let orphans: QueueNote[] = [];
	let improvables: QueueNote[] = [];
	let learnLeeches: QueueNote[] = [];
	let checkLeeches: QueueNote[] = [];
	let otherLeeches: QueueNote[] = [];
	let readingLeeches: QueueNote[] = [];

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
		// if keywordFilter is not "All notes", check if note has that keyword
		if (keywordFilter !== "All notes") {
			if (!qNote.getKeywords().includes(keywordFilter)) {
				return;
			}
		}

		if (qNote.getType() === "article" && qNote.getIsCurrentlyDue()) {
			dueArticles.push(qNote);
			if (qNote.getShouldReceiveLeechTreatment()) {
				readingLeeches.push(qNote);
			}
		} else if (qNote.getType() === "book-started") {
			if (qNote.getIsCurrentlyDue()) {
				dueStartedBooks.push(qNote);
			}
			counterStartedBooksEvenIfNotDue += 1;
			if (qNote.getShouldReceiveLeechTreatment()) {
				readingLeeches.push(qNote);
			}
		} else if (qNote.getType() === "book") {
			newBooks.push(qNote);
		} else if (qNote.getType() === "check" && qNote.getIsCurrentlyDue()) {
			dueChecks.push(qNote);
			if (qNote.getShouldReceiveLeechTreatment()) {
				checkLeeches.push(qNote);
			}
		} else if (qNote.getType() === "habit" && qNote.getIsCurrentlyDue()) {
			dueHabits.push(qNote);
			if (qNote.getShouldReceiveLeechTreatment()) {
				otherLeeches.push(qNote);
			}
		} else if (qNote.getType() === "todo" && qNote.getIsCurrentlyDue()) {
			dueTodos.push(qNote);
			if (qNote.getShouldReceiveLeechTreatment()) {
				otherLeeches.push(qNote);
			}
		} else if (qNote.getType() === "learn-started") {
			if (qNote.getShouldReceiveLeechTreatment()) {
				learnLeeches.push(qNote);
			}
			// check fsrs opinion as well
			if (qNote.getIsCurrentlyDue(undefined, true)) {
				dueFRSRNotes.push(qNote);
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
		// any due note may be considered improvable if string exists.
		if (qNote.isImprovable) {
			improvables.push(qNote);
		}
	});
	// if we have 5 or more started books, also remove new books
	// also, don't include selections that are empty (including key)
	let returnObj: pickableSelections = {};

	if (dueFRSRNotes.length < 10 && newLearns.length > 0) {
		returnObj.newLearns = newLearns;
	}
	if (
		counterStartedBooksEvenIfNotDue <= settings.booksActiveMax &&
		newBooks.length > 0
	) {
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
	if (dueFRSRNotes.length > 0) {
		returnObj.dueFRSRNotes = dueFRSRNotes;
	}
	if (dueMisc.length > 0) {
		returnObj.dueMisc = dueMisc;
	}
	if (orphans.length > 0) {
		returnObj.orphans = orphans;
	}
	if (improvables.length > 0 && !settings.disableImprovablesPrompts) {
		returnObj.improvables = improvables;
	}
	if (learnLeeches.length > 0 && !settings.disableLeechPrompts) {
		returnObj.learnLeeches = learnLeeches;
	}
	if (checkLeeches.length > 0 && !settings.disableLeechPrompts) {
		returnObj.checkLeeches = checkLeeches;
	}
	if (otherLeeches.length > 0 && !settings.disableLeechPrompts) {
		returnObj.otherLeeches = otherLeeches;
	}
	if (readingLeeches.length > 0 && !settings.disableLeechPrompts) {
		returnObj.readingLeeches = readingLeeches;
	}

	if (saveStatistics) {
		const loggingData = {
			"Nr. of due articles": dueArticles.length,
			"Nr. of due started books": dueStartedBooks.length,
			"Nr. of due checks": dueChecks.length,
			"Nr. of due habits": dueHabits.length,
			"Nr. of due todos": dueTodos.length,
			"Nr. of new learns": newLearns.length,
			"Nr. of FSRS due notes": dueFRSRNotes.length,
			"Nr. of due misc": dueMisc.length,
			"Nr. of orphans": orphans.length,
			"Nr. of improvables": improvables.length,
			"Nr. of due learn leeches": learnLeeches.length,
			"Nr. of due check leeches": checkLeeches.length,
			"Nr. of due other leeches": otherLeeches.length,
			"Nr. of due reading leeches": readingLeeches.length,
			"Nr. of started books even if not due":
				counterStartedBooksEvenIfNotDue,
		};
		QueueLog.addLog("due-statistics", loggingData);
	}

	return returnObj;
}
