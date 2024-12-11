/**
 * Picks a random element from an array.
 * @param array The array to pick from.
 * @returns A random element from the array, or null if the array is empty.
 */
export function pickRandom<T>(array: T[]): T | null {
    if (!array.length) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns A new array that is shuffled.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

/**
 * Filters out duplicate objects from an array based on their JSON stringified values.
 * @param array The input array of objects.
 * @returns A new array with only unique objects.
 */
export function getUniqueArray<T>(array: T[]): T[] {
    return array.filter((value, index, self) => {
        const stringifiedValue = JSON.stringify(value);
        return index === self.findIndex(obj => JSON.stringify(obj) === stringifiedValue);
    });
};


/**
* Returns a random integer between min (inclusive) and max (inclusive).
* The value is no lower than min (or the next integer greater than min
* if min isn't an integer) and no greater than max (or the next integer
* lower than max if max isn't an integer).
* Using Math.round() will give you a non-uniform distribution!
*/
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
