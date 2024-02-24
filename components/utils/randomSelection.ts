import { TFile } from "obsidian";


export function pickRandomNote(
	notes: Array<TFile>
): TFile | null {
	if (notes.length === 0) {
		return null;
	}
	// for now just return random note
	const note = notes[Math.floor(Math.random() * notes.length)];
	return note;
}

export function pickRandomNoteWithPriorityWeighting(
	notes: Array<TFile>
): TFile | null {
	if (notes.length === 0) {
		return null;
	}
	// for now just return random note
	const note = notes[Math.floor(Math.random() * notes.length)];
	return note;
}



