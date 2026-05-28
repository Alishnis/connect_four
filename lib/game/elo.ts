const K = 32;

export function calculateElo(
  ratingA: number,
  ratingB: number,
  resultA: 0 | 0.5 | 1
): { newA: number; newB: number; changeA: number; changeB: number } {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;
  const resultB = (1 - resultA) as 0 | 0.5 | 1;

  const changeA = Math.round(K * (resultA - expectedA));
  const changeB = Math.round(K * (resultB - expectedB));

  return {
    newA: Math.max(100, ratingA + changeA),
    newB: Math.max(100, ratingB + changeB),
    changeA,
    changeB,
  };
}
