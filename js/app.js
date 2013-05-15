// When the document is ready...
$(function () {

  // Initialize the game.
  var game = new Game(6,7, '#board-table-wrapper');
  
  // Set up the click handler for the new game button.
  $('#new-game').click(function () {
    game.reset();
  });
});