export function makeWall34(): number[] {
  const wall: number[] = [];
  for (let t = 0; t < 34; t += 1) {
    for (let i = 0; i < 4; i += 1) wall.push(t);
  }
  return wall;
}

export function emptyHand(): number[] {
  return Array.from({ length: 34 }, () => 0);
}

export function addTile(hand: number[], tile34: number) {
  hand[tile34] = (hand[tile34] || 0) + 1;
}

export function removeTile(hand: number[], tile34: number) {
  if (hand[tile34] <= 0) throw new Error("tile not in hand");
  hand[tile34] -= 1;
}

export function totalTiles(hand: number[]): number {
  return hand.reduce((a, b) => a + b, 0);
}
