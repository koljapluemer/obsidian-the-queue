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
	desiredRecallThreshold: number,
	saveStatistics = false
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
	let learnLeeches: QueueNote[] = [];
	let checkLeeches: QueueNote[] = [];
	let otherLeeches: QueueNote[] = [];
	let readingLeeches: QueueNote[] = [];

	let counterStartedLearnsBelowThreshold = 0;
	let counterStartedBooksEvenIfNotDue = 0;
	let lowestPredictedRecall = 1;

	let pluginSettings;
	const settingsCookie = sessionStorage.getItem("the-queue-settings");
	if (settingsCookie != null) {
		pluginSettings = JSON.parse(settingsCookie);
	}

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
			// check if should be treated as leech
			// TODO: add a kind of actual due check here (but currently dueAt for learn notes is related to recall threshold...)
			// or rather: prevent that we have to add more and more anti-leech stuff to a given note
			if (qNote.getShouldReceiveLeechTreatment()) {
				learnLeeches.push(qNote);
			}
			// this is an array of one, containing only the note with the lowest predicted recall
			// we have this as [] so it's consistent with the other selections
			// exclude notes with a recall so high that rep is useless rn
			const predictedRecall = qNote.getPredictedRecall();
			if (predictedRecall < desiredRecallThreshold) {
				counterStartedLearnsBelowThreshold += 1;
				if (qNote.getPredictedRecall() < lowestPredictedRecall) {
					lowestPredictedRecall = predictedRecall;
					startedLearnNoteMostCloseToForgetting = [qNote];
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
		// any due note may be considered improvable if string exists.
		if (qNote.isImprovable) {
			improvables.push(qNote);
		}
	});
	// if we have more than 10 learn notes below threshold, remove new learn notes array
	// if we have 5 or more started books, also remove new books
	// also, don't include selections that are empty (including key)
	let returnObj: pickableSelections = {};

	if (counterStartedLearnsBelowThreshold < 10 && newLearns.length > 0) {
		returnObj.newLearns = newLearns;
	}
	if (counterStartedBooksEvenIfNotDue <= pluginSettings.booksActiveMax && newBooks.length > 0) {
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
	if (startedLearnNoteMostCloseToForgetting.length > 0) {
		returnObj.startedLearnNoteMostCloseToForgetting =
			startedLearnNoteMostCloseToForgetting;
	}
	if (dueMisc.length > 0) {
		returnObj.dueMisc = dueMisc;
	}
	if (orphans.length > 0) {
		returnObj.orphans = orphans;
	}
	if (improvables.length > 0) {
		returnObj.improvables = improvables;
	}
	if (learnLeeches.length > 0) {
		returnObj.learnLeeches = learnLeeches;
	}
	if (checkLeeches.length > 0) {
		returnObj.checkLeeches = checkLeeches;
	}
	if (otherLeeches.length > 0) {
		returnObj.otherLeeches = otherLeeches;
	}
	if (readingLeeches.length > 0) {
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
			"Nr. of due misc": dueMisc.length,
			"Nr. of orphans": orphans.length,
			"Nr. of improvables": improvables.length,
			"Nr. of due learn leeches": learnLeeches.length,
			"Nr. of due check leeches": checkLeeches.length,
			"Nr. of due other leeches": otherLeeches.length,
			"Nr. of due reading leeches": readingLeeches.length,
			"Nr. of started learns below threshold":
				counterStartedLearnsBelowThreshold,
			"Nr. of started books even if not due":
				counterStartedBooksEvenIfNotDue,
		};
		QueueLog.addLog("due-statistics", loggingData);
	}

	return returnObj;
}
