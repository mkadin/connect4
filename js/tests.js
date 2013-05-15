test("Checker", function () {
  
  // Instantiate a game and a checker.
  var game = new Game(6,7,'#board-table-wrapper');
  var checker = new Checker(2, game, 100, 125);
  
  // Check that passed in height and width paramters work.
  ok(checker.width == 100, "Checker width stores value passed to constructor");
  ok(checker.height == 125, "Checker height stores value passed to constructor");

  // Now intantiate a checker without height and width, check defaults.
  checker = new Checker(2, game);
  ok(checker.width == 50, "Checker width 50 pixels by default");
  ok(checker.height == 50, "Checker height 50 pixels by default");
  
  // Check player info being passed in is working.
  ok(checker.player === 2, "Checker player is value passed to constructor");
  
  // Check placement.
  checker.place(4,3);
  ok($(checker.element).position().left == 101, "Checker's left position is correct for column assignment and width after placement");

  // Top placement must be done asynchronously as this is animated.
  stop();
  setTimeout(function () {
    ok($(checker.element).position().top == 151, "Checker's top position is correct or row assignment and height after placement");
    start();
    $(checker.element).addClass('boogieman');
    stop();
    
    // Check remove functionality asynchronously as well.
    checker.remove();
    setTimeout(function () {
      ok($('.boogieman').length == 0, 'Checker was removed from the DOM on .remove()');
      start();
    }, 2000);
  }, 2000);
});


test("Game" , function () {
  // Reset the board and create a new game.
  $('#board-table-wrapper').remove();
  $('body').append('<div id="board-table-wrapper"></div>');
  var game = new Game(5,8, '#board-table-wrapper');
    
  // Confirm that the num rows and num columns parameters are working properly.
  ok(game.numRows == 5, "Rows parameter is stored in numRows");
  ok(game.numCols == 8, "Cols parameter is stored in numCols");
  
  game.reset();
  ok(game.playing == true, "After resetting the game, playing is now true.");
  ok(game.numCheckers == 0, "After resteting the game, the counter of checkers placed is 0");
  
  var player = game.player;
  game.move(1);
  ok(game.player != player, "Player toggles after first move");
  game.move(2);
  game.move(1);
  game.move(2);
  game.move(1);
  game.move(2);
  game.move(1);
  ok(game.playing == false, "Game is over after 4 vertical checkers");
  game.reset();
  
  game.resetCheckers();
  stop();
  setTimeout(function () {
    // Confirm that resetting the checkers clears the 2-D array;
    var counter = 0;
    for (var i in game.checkers) {
      for (var j in game.checkers[i]) {
        if (game.checkers[i][j] != null) {
          counter++;
        }
      }
    }
    ok(counter == 0, "resetCheckers() resets each element in the 2-D array to be null");
    
    // Confirm that all checkers have been removed from the dom.
    ok($('.checker').length == 0, "All checkers have been removed from the DOM on reset");
    start();
    
    // Check for horizontal win detection.
    game.move(1);
    game.move(5);
    game.move(2);
    game.move(5);
    game.move(3);
    game.move(5);
    game.move(4);
    ok(game.playing == false, "Game over after horizontal win");
    
    // Check for diag win detection (both ways).
    game.reset();
    game.move(1); 
    game.move(2); 
    game.move(2); 
    game.move(3); 
    game.move(3); 
    game.move(5); 
    game.move(3); 
    game.move(4); 
    game.move(4); 
    game.move(4);
    game.move(4);
    ok(game.playing == false, "Game over after diag (up-right) win");
    game.reset();
    game.move(4); 
    game.move(3); 
    game.move(3); 
    game.move(2); 
    game.move(2); 
    game.move(5); 
    game.move(2); 
    game.move(1); 
    game.move(1); 
    game.move(1);
    game.move(1);
    ok(game.playing == false, "Game over after diag (down-right) win");
  }, 3000);  
});  
