export default function toRGBA(color: string, alpha: number): string {
  const match = color.match(/[\d.]+/g);
  if (!match || match.length < 3) return color;
  return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
}
