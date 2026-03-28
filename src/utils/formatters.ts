export function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function cad(n: number): string {
  return `CA${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)}`;
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
