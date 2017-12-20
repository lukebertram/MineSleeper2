//logic maths & computational nitty gritty


// Game object constructor
var Game = function(root, size){
  this.size = size;
  this.root = root;
  this.board = new Gameboard(root.find('.gameboard'), size, 5); //hardcoded for testing - creates a 3x3 board with 1 mine
};

// Gameboard Tile object constructor
var Tile = function(element, x, y){
  this.element = element;
  this.x = x;
  this.y = y;
  this.isRevealed = false;
  this.isMine = false;
  this.flagged = false;
  this.tileValue = 0;
  this.isEmpty = !this.tileValue;
};

// set the Tile's 'isMine' property to either true or false
Tile.prototype.setMine = function(boolean){
  this.isMine = boolean;
}

Tile.prototype.setTileValue = function(num){
  var tileValue = num;
  this.isEmpty = !tileValue;
  this.tileValue = tileValue;
}
// Gameboard object constructor
var Gameboard = function(boardElement, boardSize, numMines){
  this.boardElement = boardElement;
  this.boardSize = boardSize;
  this.numMines = numMines;
  this.boardData = new Array(this.boardSize);
  //initialize 2d board data array based on boardSize
  for (var i = 0; i < this.boardSize; i++) {
    this.boardData[i] = new Array(this.boardSize);
  }
  this.drawBoard();
};

Gameboard.prototype.drawBoard = function(){
  var ctx = this;
  ctx.boardElement.empty();
  //set the board dimension in css grid
  var boardWidthPx = ctx.boardSize * TILE_WIDTH_PX + 2;
  ctx.boardElement.css({
    'grid-template': 'repeat('+ ctx.boardSize +', 1fr) / repeat ('+ ctx.boardSize +', 1fr)',
    'width': boardWidthPx
  });
  var i, j, tileElement;
  for (i = 0; i < ctx.boardSize; i++) {
    // ctx.boardData[i] = new Array(ctx.boardSize);
    for (j = 0; j < ctx.boardSize; j++) {
      //add a visual representation of the tile to the DOM
      tileElement = $('<div class="tile" style="width: '+ TILE_WIDTH_PX +'px; height: '+ TILE_WIDTH_PX +'px;"></div>').appendTo(ctx.boardElement);
      //add a tile object to the boardData matrix
      ctx.boardData[i][j]= new Tile(tileElement, i, j);
      //add a location data to the tile's DOM element (for when it's clicked)
      tileElement.data('location', {x: i, y: j});
      //add a click listener to the tile element (THIS DOES NOT WORK)
      setClickListener(tileElement, ctx.boardData);
    }
  }//end of outer for loop (i)
  ctx.setMines();
  ctx.calcTileValues();
}

Gameboard.prototype.setMines = function(){
  var i, minesPlanted = 0, x, y;

  //randomly place amount of mines equal to 'numMines'
  while (minesPlanted < this.numMines) {
    x = getRandomInt(this.boardSize);
    y = getRandomInt(this.boardSize);

    if (!this.boardData[x][y].isMine){
      this.boardData[x][y].setMine(true);
      minesPlanted++;
    }
  }
}

Gameboard.prototype.calcTileValues = function(){
  //for every tile in the boardData matrix
  for (var i = 0; i < this.boardSize; i++) {
    for (var j = 0; j < this.boardSize; j++) {
      var tile = this.boardData[i][j];
      //if the tile doesn't contain a mine
      if(!tile.isMine){
        //calculate the number of adjacent tiles containing mines

        var mines = this.checkNeighborTiles(tile);

        //if the number of adjacent tiles containing mines is > 0
        if (mines > 0){
          //set the tile's tileValue attribute to the number of adjacent mines
          tile.setTileValue(mines);

        }
        //otherwise, set the tile's isEmpty attribute to 'true'
        else{
          tile.isEmpty = true;
        }
      }
    }
  }
}

Gameboard.prototype.checkNeighborTiles = function(tile){

  var mineCount = 0;
  var adjTiles = [];

  //check north tile
  if (tile.y > 0) {
    adjTiles.push(this.boardData[tile.x][tile.y-1]);
  }
  //check northeast tile
  if (tile.x < this.boardSize -1 && tile.y > 0){
    adjTiles.push(this.boardData[tile.x + 1][tile.y - 1]);
  }
  //check east tile
  if (tile.x < this.boardSize -1) {
    adjTiles.push(this.boardData[tile.x + 1][tile.y]);
  }
  //check southeast tile
  if (tile.x < this.boardSize -1 && tile.y < this.boardSize -1) {
    adjTiles.push(this.boardData[tile.x + 1][tile.y + 1]);
  }
  //check south tile
  if (tile.y < this.boardSize -1) {
    adjTiles.push(this.boardData[tile.x][tile.y + 1]);
  }
  //check southwest tile
  if (tile.x > 0 && tile.y < this.boardSize -1) {
    adjTiles.push(this.boardData[tile.x - 1][tile.y + 1]);
  }
  //check west tile
  if (tile.x > 0) {
    adjTiles.push(this.boardData[tile.x - 1][tile.y]);
  }
  //check northwest tile
  if (tile.x > 0 && tile.y > 0) {
    adjTiles.push(this.boardData[tile.x - 1][tile.y - 1]);
  }
  console.log(adjTiles);
  for (var i = 0; i < adjTiles.length; i++) {
    if (adjTiles[i].isMine) {
      mineCount++;
    }
  }
  console.log('minecount: '+ mineCount);
  return mineCount;
}

//helper function to generate random integers between 0 (inclusive) and provided maximum (exclusive)
var getRandomInt = function(max){
  return Math.floor((Math.random() * max));
};

//helper funciton to set click listeners on tiles
var setClickListener = function(_tileElement, boardData){
  _tileElement.mouseup(function(click){
    switch (click.which) {
      //ON LEFT CLICK:
      case 1:
        //if clicked tile is flagged, do nothing and break
        if (_tileElement.hasClass('flagged')) {
          break;
        }
        var x, y;
        //get coordinates
        x = _tileElement.data('location').x;
        y = _tileElement.data('location').y;
        //check boardData for mine, flag
        if (boardData[x][y].isMine)
        {
          _tileElement.addClass('clicked show-mine');
          alert('you clicked on a mine');

        //toggle clicked and add tileValue to tile div in the DOM
        } else if (!_tileElement.hasClass('clicked')){
          if (!boardData[x][y].isEmpty){
            _tileElement.append('<span class="tile-value">'+ boardData[x][y].tileValue +'</span>');
          }
          _tileElement.addClass('clicked');
        }
        console.log(_tileElement.attr('class'));
        console.log('left click on tile at '+ _tileElement.data('location').x +
              ', ' + _tileElement.data('location').y );
        break;

      //ON MIDDLE CLICK:
      case 2:
        //do nothing on middle mouse click
        break;

      //ON RIGHT CLICK:
      case 3:

        //toggle flagged class on tile element
        _tileElement.toggleClass('flagged');
        console.log(_tileElement.attr('class'));
        console.log('right click on tile at '+ _tileElement.data('location').x +
              ', ' + _tileElement.data('location').y );
        break;

      default:
        console.log('weird mouse alert!');
    }
  });
}

//GLOBAL VARIABLES
var DEFAULT_BOARD_SIZE = 5;
var TILE_WIDTH_PX = 50;
var myGame;
//jquerey
$(function(){
  myGame = new Game($('#minesweeper1'), DEFAULT_BOARD_SIZE);
  // myGame.drawBoard();

  $('#game-settings').submit(function(event){
    event.preventDefault();
    var size = $('#board-size').val();
    myGame = new Game($('#minesweeper1'), size);
  })
});
