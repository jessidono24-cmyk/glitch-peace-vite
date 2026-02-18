// Undo system: revert to previous game state
export function undoGameMove(game) {
  if (game.history && game.history.length > 0) {
    const prev = game.history.pop();
    if (prev) {
      // Only restore mutable properties
      Object.assign(game, prev);
    }
  }
}
