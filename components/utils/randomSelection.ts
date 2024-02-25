import QueueNote from "components/classes/QueueNote";

export function pickRandomNoteWithPriorityWeighting(
	notes: QueueNote[]
): QueueNote {
	const sortedNotes = notes.sort((a, b) => b.getPriority() - a.getPriority());
	const randomValue = Math.random();
	const pdfValueNormalized =
		(Math.exp(randomValue) - Math.exp(0)) / (Math.exp(1) - Math.exp(0));
	const amountOfNotes = sortedNotes.length;
	const indexToSelect = Math.floor(pdfValueNormalized * amountOfNotes);
	return sortedNotes[indexToSelect];
}

