import QueueNote from "../classes/QueueNote";

/** takes an array of QueueNotes and returns a single one
 * the probability of a note being selected is proportional to its priority
 * The weighting is pretty simple, we simply sort the notes by priority and then pick a random index, basically
 * (thus, the actual numeric value of the priority matters only indirectly)
 * The index picking then is weighted by a simple PDF using e, which could in the future be replaced or made configurable
 */
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

// options is an array of objects, each object has a weight and an item
export function pickObjectFromWeightedArray(options: any): {} {
    var i;

    var weights = [options[0].weight];

    for (i = 1; i < options.length; i++)
        weights[i] = options[i].weight + weights[i - 1];
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return options[i].item;
}