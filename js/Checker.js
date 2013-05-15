/**
 *The Checker class definition
 */
var Checker = function (player, game, width, height) {

  // The game object that this checker is a part of.
  this.game = game;

  // Which player placed the checker.
  this.player = player;

  // The width of the checker.
  this.width = width || 50;

  // The height of the checker.
  this.height = height || 50;
  
  // The final 'top' CSS property once placed.
  this.top = 0;
  
  // The final 'left' CSS property once placed.
  this.left = 0;

  // The row that this checker has been placed in.
  this.row = null;

  // The column that this checker has been placed in.
  this.col = null;

  // The jQuery object that IS the checker.
  this.element = $('<div class="checker player-' + this.player + '"></div>')

}

/**
 * Prototype methods for the Checker class.
 */

/**
 * Places the checker in a given row or column.
 *
 * @param row
 *   A 1-indexed row number.
 * @param col
 *   A 1-indexed column number.
 */
Checker.prototype.place = function(row, col) {
  // Store the row and col that this checker has been placed in for later.
  this.row = row;
  this.col = col;

  

  this.top  = ((row - 1) * this.height) + 1;
  this.left = ((col - 1) * this.width + 1);

  var checker = this;

  // Hide the checker, fade it in at the top, and then animate it into place.
  this.element.hide()
  .appendTo(this.game.wrapper)
  .css({
    'top': checker.height * -1,
    'left': checker.left
  })
  .fadeIn(400, function () {
    $(this).animate({
      'top': checker.top
      }, row * 200);  // Animation should take longer for longer drops.
  });
}

/**
 * Animates the checker off the board to make it dissaper.
 */
Checker.prototype.remove = function () {

  var newTop = {
    'top' : (this.game.numRows) * this.height
  };

  this.element.animate(newTop, (this.game.numRows - this.row) * 200, function () {
    $(this).fadeOut(400, function () {
      $(this).remove();
    });
  });
}