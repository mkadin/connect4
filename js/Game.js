/**
 * The Game class definition.
 *
 * @param numRows
 *   The number of rows on the board.
 * @param numCols
 *   The number of columns on the board.
 * @param selector
 *   A jQuery selector for the board's wrapper.
 */
var Game = function (numRows, numCols, selector) {

  // Whether or not a game is active.
  this.playing = false;

  // Whose turn it is.
  this.player = null;

  // Number of rows on the board.
  this.numRows = numRows || 6;

  // Number of columns on the board.
  this.numCols = numCols || 7;

  // The total number of checkers added.
  this.numCheckers = 0;

  // The table's wrapper.
  this.wrapper = $(selector);

  /**
   * Sets up or resets the checkers array, a 2-D array that holds checker
   * objects.
   */
  this.resetCheckers = function () {
    this.checkers = [];
    for (var i = 0; i < this.numRows; i++) {
      this.checkers.push([]);
      for (var j = 0; j < this.numCols; j++) {
        this.checkers[i].push(null);
      }
    }
  }

  // Initialize the checkers 2-D array.
  this.resetCheckers()

  /**
   * Resets the game.
   */
  this.reset = function () {
    // Clear any checkers on the board.
    this.clearBoard();

    // Begin the game.
    this.playing = true;

    // Change the player for the first turn.
    this.togglePlayer();

    // Clear out the 2-D checkers array.
    this.resetCheckers();

    // Reset the total number of checkers counter. Used for determining ties.
    this.numCheckers = 0;

    // Clear any message.
    this.message('');
  }

  /**
   * Clears all checkers from the board.
   */
  this.clearBoard = function () {
    for (var i in this.checkers) {
      for (var j in this.checkers[i]) {
        if (this.checkers[i][j] instanceof Checker) {
          this.checkers[i][j].remove();
        }
      }
    }
  }

  /**
   * Adds a checker to the board. This is a low level function.  move() should
   * be used in the context of a game.
   *
   * @param col
   *   The 1-indexed column number to place a checker in.
   */
  this.addChecker = function (col) {

    if (this.playing) {  // Only allow this if the game is active.

      // If there is no player defined, this is the intro animation, use a
      // random player.
      var player = this.player || Math.round(Math.random()) + 1;

      // Loop through the rows in the given column from bottom up, looking for
      // the first empty spot. Place a new checker there.
      for (var i in this.checkers) {
        if (this.checkers[this.numRows - i - 1][col - 1] == null) {
          this.checkers[this.numRows - i - 1][col - 1] = new Checker(player, this);
          this.checkers[this.numRows - i - 1][col - 1].place(this.numRows - i, col);
          return this.numRows - i;
        }
      }

      // If the column is full, inform the user.
      this.message('That column is full! Try a different column');
      return false;
    }
  }


  /**
   * Handles a player making a move.
   *
   * @param col
   *   The column number (1-indexed) that the player is triyng to place a
   *   checker in.
   */
  this.move = function (col) {

    // Only allow moves if the game has started, and if the column is valid.
    if (this.playing && col <= this.numCols) {

      // Add the checker
      var row = this.addChecker(col);

      // false indicates an attempt to add a checker to an already full column.
      if (row === false) {
        return;
      }

      // Check for game over.
      if (this.checkWinner(row, col)) {
        this.message('Player ' + this.player + ' Wins!');
        var oldScore = $('#player-' + this.player + '-score').text();
        $('#player-' + this.player + '-score').text(++oldScore);
        this.playing = false;
        return;
      }

      // Add one to the total number of checkers.
      this.numCheckers++;

      // If every space is filled, we have a tie.
      if (this.numCheckers == this.numRows * this.numCols) {
        this.message('Game Over!  Its a tie!');
        this.playing = false;
      }

      // If game isn't over, toggle the player for the next move.
      this.togglePlayer();
    }
  }

  /**
   * Generic message handler
   * 
   * @param text
   *   The text to be shown in the message.
   */
  this.message = function (text) {
    if (text == '') {
      $('#message').fadeOut(200);
    }
    else {
      $('#message').fadeOut(200, function () {
        $(this).text(text).fadeIn(200);
      });
    }
  }


  /**
   * Toggles the current player.
   */
  this.togglePlayer = function () {
    $('#whos-turn').removeClass('player-' + this.player);
    if (this.player == 1) {
      this.player = 2;
    }
    else {
      this.player = 1;
    }
    $('#whos-turn-content').text('Player ' + this.player);
    $('#whos-turn').addClass('player-' + this.player);
  }


  /**
   * Checks to see if there is a winner.
   * 
   * @param row
   *   The row of the last move (1-indexed).
   * @param col
   *   The column of the last move (1-indexed).
   */
  this.checkWinner = function (row, col) {
    // Call it game to deal with nested scopes.
    var game = this;
    
    /**
     * Checks if a given row / col has a checker in it.
     * 
     * @param row
     *   The row of the space to check. 1-indexed.
     * @param col
     *   The column of the space to check. 1-indexed.
     */
    function isChecker(row, col) {
      if (game.checkers[row - 1] != undefined && game.checkers[row -1][col - 1] != null) {
        return true;
      }
      return false;
    }

    /**
     * To figure out of there's a winner, we'll find out how many same-colored
     * checkers there are in a row in each direction (including diag.).
     */

    // Store the starting row and column.
    var originalRow = row;
    var originalCol = col;

    // Set up the deltas for each direction.
    var steps = {
      'down' : {row:1, col:0},
      'left' : {row:0, col:-1},
      'right' : {row:0, col:1},
      'upleft' : {row:-1, col:-1},
      'upright' : {row:-1, col:1},
      'downleft' : {row:1, col:-1},
      'downright' : {row:1, col:1}
    };

    // Loop through the directions
    for (var direction in steps) {

      // Set a counter of total checkers of the correct color found in this
      // direction.
      steps[direction].total = 0;
      
      // Get the deltas for rows and columns.
      var rowDelta = steps[direction].row;
      var colDelta = steps[direction].col;

      // Set the row and column to be at the starting point + one move in the
      // current direction.  No need to check the same middle checker each time.
      row = parseInt(originalRow)  + parseInt(rowDelta);
      col = parseInt(originalCol) + parseInt(colDelta);

      // Step the row/col center in the current direction, and determine if the
      // checker is the right color. If it is, add 1 to the total, and keep
      // going in that direction.
      while (isChecker(row, col) && game.checkers[row - 1][col - 1].player == this.player) {
        steps[direction].total++;
        row = parseInt(row) + parseInt(rowDelta);
        col = parseInt(col) +  parseInt(colDelta);
      }
      console.log(direction, steps[direction].total);
    }

    // Check each of the 4 directions (horiziontal, vertical, and the two diag.)
    // For up, there can only ever be 1 in a row.
    if (steps.down.total >= 3) {
      return true;
    }
    if (steps.left.total + steps.right.total >= 3) {
      return true;
    }
    if (steps.upleft.total + steps.downright.total >= 3) {
      return true;
    }
    if (steps.upright.total + steps.downleft.total >= 3) {
      return true;
    }

    // If there's no connect 4 at this point, then we have no winner.
    return false;
  }


  /**
   * Runs on initialization.  Build the board and run the intro animation.
   */
  var table = $('<table id="board-table"></table>');
  var row = $('<tr></tr>');
  for (var j = 0; j < this.numCols; j++) {
    row.append($('<td data-column="' + (j+1) + '"></td>'));
  }

  for (var i = 0; i < this.numRows; i++) {
    var currentRow = row.clone();
    currentRow.attr('data-row', i+1);
    table.append(currentRow);
  }
  table.appendTo(selector);
  $(selector).css('width', table.width());

  var game = this;
  // Temporarily set playing = true for intro animation.
  this.playing = true;
  
  // Set up a click event for each cell in the table.
  $('#board-table td').click(function () {
    var col = $(this).attr('data-column');
    game.move(col);
  }).each(function () { // Call that click event on each for intro animation.
    game.addChecker($(this).attr('data-column'));
  });

  // Set playing = false so that no more checkers can be added after intro.
  this.playing = false;
}