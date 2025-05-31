export const boundNumber = (lower: number, upper: number) => (n: number) => {
  if (n < lower) return lower
  if (n > upper) return upper
  return n
}
