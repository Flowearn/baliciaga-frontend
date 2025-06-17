export const pricePerRoom = (total: number, rooms: number): number | null => {
  if (!rooms || rooms <= 0) return null;
  return Math.round(total / rooms);
}; 