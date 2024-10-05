import seedrandom from "seedrandom";

export function seededShuffle<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed);

  console.log({seed})

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
