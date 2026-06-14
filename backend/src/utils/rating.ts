export function calculateOverallRating(
  photography: number,
  soundtrack: number,
  screenplay: number,
  cast: number
): number {
  const avg = (photography + soundtrack + screenplay + cast) / 4;
  return Math.round(avg * 100) / 100;
}

export function validateRatings(ratings: number[]): boolean {
  return ratings.every((r) => Number.isInteger(r) && r >= 0 && r <= 5);
}
