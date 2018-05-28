// Store the current level
var currentLevel = 0;
// Total levels
var totalLevels = 5;

/**
 * Game class
 */
function Game() {
	// Create the game
	this.main = function () {
		// Set terrain data
		var mapTerrains = [
				new MapTerrain("Goal", "+", "", true, false),
				new MapTerrain("Floor", ".", "", true, false),
				new MapTerrain("Player", "p", "", false, true),
				new MapTerrain("Slider", "o", "", false, true),
				new MapTerrain("Wall", "x", "", false, false),
			];

		// Create level
		var level = new Level("Level " + currentLevel, new Map(mapTerrains, getLevel(currentLevel)));
		// Initialize display and input
		Globals.Instance.initialize(new Coords(360, 360), level);
		// For current level text
		document.getElementById("levelText").innerText = "Level " + (currentLevel + 1);
	}
}

/**
 * Array Extensions
 */
function ArrayExtensions() {
}
{
	Array.prototype.addLookups = function (keyName) {
		for (var i = 0; i < this.length; i++) {
			var item = this[i];
			var key = item[keyName];
			this[key] = item;
		}
	}
}

/**
 * Class for the coordinates of the game
 */
function Coords(x, y) {
	this.x = x;
	this.y = y;
}
{
	Coords.prototype.add = function (other) {
		this.x += other.x;
		this.y += other.y;

		return this;
	}

	Coords.prototype.clone = function () {
		return new Coords(this.x, this.y);
	}

	Coords.prototype.divide = function (other) {
		this.x /= other.x;
		this.y /= other.y;

		return this;
	}

	Coords.prototype.equals = function (other) {
		var returnValue = (this.x == other.x && this.y == other.y);

		return returnValue;
	}

	Coords.prototype.multiply = function (other) {
		this.x *= other.x;
		this.y *= other.y;

		return this;
	}

	Coords.prototype.overwriteWith = function (other) {
		this.x = other.x;
		this.y = other.y;

		return this;
	}
}

/**
 * Helper for graphic functions
 */
function DisplayHelper() {
}
{
	DisplayHelper.prototype.clear = function () {
		this.graphics.fillStyle = "White";
		this.graphics.fillRect(0, 0, this.viewSizeInPixels.x, this.viewSizeInPixels.y);

		this.graphics.strokeStyle = "Gray";
		this.graphics.strokeRect(0, 0, this.viewSizeInPixels.x, this.viewSizeInPixels.y);
	}

	DisplayHelper.prototype.drawLevel = function (level) {
		this.clear();
		this.drawMap(level.map);
	}

	DisplayHelper.prototype.drawImage = function (img, drawPos, mapCellSizeInPixels) {
		if (img.naturalWidth === 0)
			return;

		var pat = this.graphics.createPattern(img, "repeat");
		this.graphics.fillStyle = pat;
		this.graphics.fillRect(drawPos.x, drawPos.y, mapCellSizeInPixels.x, mapCellSizeInPixels.y);
	}

	DisplayHelper.prototype.drawMap = function (map) {
		var mapSizeInCells = map.sizeInCells;
		var mapCellSizeInPixels = this.viewSizeInPixels.clone().divide(mapSizeInCells);

		var cellPos = new Coords(0, 0);
		var drawPos = new Coords(0, 0);

		for (var y = 0; y < mapSizeInCells.y; y++) {
			cellPos.y = y;

			for (var x = 0; x < mapSizeInCells.x; x++) {
				cellPos.x = x;

				var cellToDraw = map.cellAtPos(cellPos);

				if (cellToDraw.color != null) {
					drawPos.overwriteWith(cellPos).multiply(mapCellSizeInPixels);

					if (cellToDraw.name == "Floor") {
						var img = new Image();
						img.src = "img/floor1.jpg";
						this.drawImage(img, drawPos, mapCellSizeInPixels);
					} else if (cellToDraw.name == "Wall") {
						var img = new Image();
						img.src = "img/fance1.jpg";
						this.drawImage(img, drawPos, mapCellSizeInPixels);
					}
					else {
						var img = new Image();
						img.src = "img/hole1.png";
						this.drawImage(img, drawPos, mapCellSizeInPixels);
					}
				}
			}
		}

		var colorSlider = map.terrains["Slider"].color;

		for (var i = 0; i < map.sliders.length; i++) {
			var slider = map.sliders[i];

			drawPos.overwriteWith(slider.pos).multiply(mapCellSizeInPixels);

			var img = new Image();
			img.src = "img/box1.png";
			this.drawImage(img, drawPos, mapCellSizeInPixels);
		}

		var colorPlayer = map.terrains["Player"].color;
		drawPos.overwriteWith(map.player.pos).multiply(mapCellSizeInPixels);

		var img = new Image();
		img.src = "img/character" + document.getElementById("player").value + ".png";
		img.visible = false;
		this.drawImage(img, drawPos, mapCellSizeInPixels);
	}

	DisplayHelper.prototype.initialize = function (viewSizeInPixels) {
		this.viewSizeInPixels = viewSizeInPixels;

		var canvas = document.createElement("canvas");
		canvas.id = "canvas";
		canvas.width = viewSizeInPixels.x;
		canvas.height = viewSizeInPixels.y;

		this.graphics = canvas.getContext("2d");

		var gameDiv = document.getElementById("gameDiv");
		gameDiv.appendChild(canvas);
	}
}

/**
 * Helper for globals instances
 */
function Globals() {
}
{
	Globals.Instance = new Globals();

	Globals.prototype.initialize = function (viewSizeInPixels, level) {
		this.level = level;

		this.displayHelper = new DisplayHelper();
		this.displayHelper.initialize(viewSizeInPixels);

		this.timer = setInterval(this.handleEventTimerTick.bind(this), 130);
		this.inputHelper = new InputHelper();
		this.inputHelper.initialize();
	}

	Globals.prototype.stop = function () {
		Globals.Instance.displayHelper.clear();
		this.inputHelper.finalize();
		clearInterval(this.timer);
	}

	Globals.prototype.handleEventTimerTick = function () {
		this.level.updateForTimerTick();
	}
}

/**
 * Helper for keyboard events
 */
function InputHelper() {
}
{
	InputHelper.prototype.finalize = function () {
		this.keyCodePressed = null;
		document.body.onkeydown = null;
		document.body.onkeyup = null;
	}

	InputHelper.prototype.initialize = function () {
		document.body.onkeydown = this.handleEventKeyDown.bind(this);
		document.body.onkeyup = this.handleEventKeyUp.bind(this);
	}

	InputHelper.prototype.handleEventKeyDown = function (event) {
		this.keyCodePressed = event.keyCode;
	}

	InputHelper.prototype.handleEventKeyUp = function (event) {
		this.keyCodePressed = null;
	}
}

/**
 * Level class
 */
function Level(name, map) {
	this.name = name;
	this.map = map;
}
{
	Level.prototype.updateForTimerTick = function () {
		Globals.Instance.displayHelper.drawLevel(this);

		var inputHelper = Globals.Instance.inputHelper;

		if (inputHelper.keyCodePressed == 37) // Left
		{
			this.updateForTimerTick_PlayerMove(new Coords(-1, 0));
		}
		else if (inputHelper.keyCodePressed == 39) // Right
		{
			this.updateForTimerTick_PlayerMove(new Coords(1, 0));
		}
		else if (inputHelper.keyCodePressed == 40) // Down
		{
			this.updateForTimerTick_PlayerMove(new Coords(0, 1));
		}
		else if (inputHelper.keyCodePressed == 38) // Up
		{
			this.updateForTimerTick_PlayerMove(new Coords(0, -1));
		}
	}

	Level.prototype.updateForTimerTick_PlayerMove = function (directionToMove) {
		var playerToMove = this.map.player;
		var playerPosNext = playerToMove.pos.clone().add(directionToMove);

		var map = this.map;
		var cellAtPlayerPosNext = map.cellAtPos(playerPosNext);

		if (cellAtPlayerPosNext.isPassable == true) {
			var sliderAtPlayerPosNext = map.sliderAtPos(playerPosNext);

			if (sliderAtPlayerPosNext == null) {
				playerToMove.pos.add(directionToMove);
			}
			else {
				var canSliderSlide = true;

				var sliderPosNext = playerPosNext.clone().add(directionToMove);
				var cellAtSliderPosNext = map.cellAtPos(sliderPosNext);
				if (cellAtSliderPosNext.isPassable == false) {
					canSliderSlide = false;
				}
				else {
					var sliderOtherAtSliderPosNext = this.map.sliderAtPos(sliderPosNext);

					if (sliderOtherAtSliderPosNext != null) {
						canSliderSlide = false;
					}
				}

				if (canSliderSlide == true) {
					playerToMove.pos.add(directionToMove);
					sliderAtPlayerPosNext.pos.add(directionToMove);

					if (cellAtSliderPosNext.name == "Goal") {
						this.victoryCheck();
					}
				}
			}
		}
	}

	Level.prototype.victoryCheck = function () {
		var areAllGoalCellsOccupiedBySliders = true;

		var map = this.map;
		var terrainGoal = map.terrains["Goal"];
		var cellPos = new Coords(0, 0);

		for (var y = 0; y < map.sizeInCells.y; y++) {
			cellPos.y = y;

			for (var x = 0; x < map.sizeInCells.x; x++) {
				cellPos.x = x;

				var terrainAtPos = map.cellAtPos(cellPos);
				if (terrainAtPos == terrainGoal) {
					var sliderAtPos = map.sliderAtPos(cellPos);
					if (sliderAtPos == null) {
						areAllGoalCellsOccupiedBySliders = false;
						y = map.sizeInCells.y;
						break;
					}
				}
			}
		}

		if (areAllGoalCellsOccupiedBySliders == true) {
			Globals.Instance.inputHelper.finalize();
			Globals.Instance.displayHelper.drawLevel(this);
			document.getElementById("rcorners2").style.display = "block";

			if (currentLevel == totalLevels - 1)
				document.getElementById("nextButton").style.display = "none";
		}
	}
}

/**
 * Map class
 */
function Map(terrains, cellsAsStrings) {
	this.terrains = terrains;
	this.terrains.addLookups("name");
	this.terrains.addLookups("symbol");
	this.cellsAsStrings = cellsAsStrings;

	this.sizeInCells = new Coords(this.cellsAsStrings[0].length,
		this.cellsAsStrings.length);

	this.movablesInitialize();
}
{
	Map.prototype.cellAtPos = function (cellPos) {
		var terrainSymbol = this.cellsAsStrings[cellPos.y].charAt(cellPos.x);
		var terrain = this.terrains[terrainSymbol];

		return terrain;
	}

	Map.prototype.movablesInitialize = function () {
		this.sliders = [];

		var terrainSymbolForFloor = this.terrains["Floor"].symbol;
		var cellPos = new Coords(0, 0);

		for (var y = 0; y < this.sizeInCells.y; y++) {
			cellPos.y = y;
			var cellRowAsString = this.cellsAsStrings[y];

			for (var x = 0; x < this.sizeInCells.x; x++) {
				cellPos.x = x;
				var terrainSymbol = cellRowAsString.charAt(x);
				var terrain = this.terrains[terrainSymbol];
				if (terrain.isMovable == true) {
					cellRowAsString =
						cellRowAsString.substr(0, x)
						+ terrainSymbolForFloor
						+ cellRowAsString.substr(x + 1)
				}

				if (terrain.name == "Player") {
					this.player = new Player(cellPos.clone());
				}
				else if (terrain.name == "Slider") {
					var slider = new Slider(cellPos.clone());
					this.sliders.push(slider);
				}
			}

			this.cellsAsStrings[y] = cellRowAsString;
		}
	}

	Map.prototype.sliderAtPos = function (cellPos) {
		var returnValue = null;

		for (var i = 0; i < this.sliders.length; i++) {
			var slider = this.sliders[i];
			if (slider.pos.equals(cellPos) == true) {
				returnValue = slider;
				break;
			}
		}

		return returnValue;
	}
}

/**
 * MapTerrain class
 */
function MapTerrain(name, symbol, color, isPassable, isMovable) {
	this.name = name;
	this.symbol = symbol;
	this.color = color;
	this.isPassable = isPassable;
	this.isMovable = isMovable;
}

/**
 * Player class
 */
function Player(pos) {
	this.pos = pos;
}

/**
 * Slider class
 */
function Slider(pos) {
	this.pos = pos;
}

/**
 * Load the next level 
 */
function nextLevel() {
	Globals.Instance.stop();
	currentLevel++;
	var gameDiv = document.getElementById("gameDiv");
	gameDiv.removeChild(document.getElementById("canvas"));
	document.getElementById("rcorners2").style.display = "none";
	new Game().main();
}

/**
 * Restart level 
 */
function restartLevel() {
	Globals.Instance.stop();
	var gameDiv = document.getElementById("gameDiv");
	gameDiv.removeChild(document.getElementById("canvas"));
	new Game().main();
}

/**
 * Create the game.
 */
new Game().main();




