// Undo system: revert to previous game state
export function undoGameMove(game) {
  if (!game.history || game.history.length === 0) return false;
  const prev = game.history.pop();
  if (!prev) return false;

  // Restore player position and stats
  if (prev.player) Object.assign(game.player, prev.player);

  // Restore grid (deep copy already done at snapshot time)
  if (prev.grid) game.grid = prev.grid.map(row => [...row]);

  // Restore counters
  if (prev.peaceCollected !== undefined) game.peaceCollected = prev.peaceCollected;
  if (prev.peaceTotal !== undefined) game.peaceTotal = prev.peaceTotal;
  if (prev.score !== undefined) game.score = prev.score;
  if (prev.movesRemaining !== undefined) game.movesRemaining = prev.movesRemaining;

  return true;
}
