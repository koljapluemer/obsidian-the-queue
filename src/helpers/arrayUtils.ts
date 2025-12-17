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
