/** 
 * (1, 'wyświetle', 'ni', 'ń') -> '1 wyświetlenie'
 * 
 * (21, 'wyświetle', 'ni', 'ń') -> '21 wyświetleń'
 */
export function conjugatePolish(value, base, suffix1, suffix2) {
  if (value == 1) {
    return `1 ${base}${suffix1}e`;
  }
  const lastLetter = value.toString()[value.toString().length - 1];
  const lastDigit = parseInt(lastLetter);
  if (lastDigit in [2, 3, 4] && !(Math.abs(value) in [12, 13, 14])) {
    return `${value} ${base}${suffix1}a`;
  }
  return `${value} ${base}${suffix2}`;
}
