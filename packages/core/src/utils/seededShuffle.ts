import seedrandom from "seedrandom";

export function seededShuffle<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed);

  // Creating a new array to avoid modifying the original
  const newArray = array.slice();

  // Implementing the Fisher-Yates shuffle algorithm
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(rng() * (i + 1));
    // Swapping elements
    [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
  }

  return newArray;
}

/**
 * Removes duplicate items from an array based on a key extractor function.
 * Keeps the first occurrence of each unique key.
 * Items with null/undefined keys or keys in skipValues are always kept.
 */
export function deduplicateByKey<T>(
  array: T[],
  getKey: (item: T) => string | number | null | undefined,
  skipValues: (string | number | null | undefined)[] = [null, undefined, -1]
): T[] {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = getKey(item);
    if (key === null || key === undefined || skipValues.includes(key)) {
      return true;
    }
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
