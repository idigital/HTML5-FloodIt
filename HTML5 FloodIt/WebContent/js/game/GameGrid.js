var GameColors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"];

var GameNode = new Class({
	x: null,
	y: null,
	color: null,
	
	initialize: function(pX, pY, pColor) {
		this.x = pX;
		this.y = pY;
		this.color = pColor;
	},
	
	getX: function() { return this.x; },
	getY: function() { return this.y; },
	
	getColor: function() { return this.color; },
	setColor: function(pColor) { this.color = pColor; }
});

var GameGrid = new Class({
	Implements: [Events, Options],
	
	numRows: 10,
	numCols: 10,
	rowHeight: 32,
	colWidth: 32,
	gameNodes: null,
	gameSeed: 1,
	nextGameSeed: null,
	
	initialize: function(pGameSeed) {
		this.gameSeed = pGameSeed;
		Math.seedrandom(this.gameSeed);
		this.gameNodes = new Array(this.numRows);
		for (var i = 0; i < this.numRows; ++i) {
			this.gameNodes[i] = new Array(this.numCols);
			for (var j = 0; j < this.numCols; ++j) {
				var randIdx = Math.floor(Math.random() * GameColors.length);
				var randColor = GameColors[randIdx];
				var node = new GameNode(i, j, randColor);
				this.gameNodes[i][j] = node;
			}
		}
		
		this.nextGameSeed = this.gameSeed + 1;
	},
	
	getGridWidth: function() { return this.colWidth * this.numCols; },
	getGridHeight: function() { return this.rowHeight * this.numRows; },
	
	drawGrid: function(canvas) {
		
		// draw lines inside the canvas
		var ctx = canvas.getContext("2d");
		
		var fullW = this.getGridWidth();
		var fullH = this.getGridHeight();
		
		canvas.width = fullW;
		canvas.height = fullH;
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		for (var row = 0; row < this.numRows; ++row) {
			for (var col = 0; col < this.numCols; ++col) {
				var x = row * this.rowHeight;
				var y = col * this.colWidth;
				var node = this.gameNodes[row][col];
				ctx.fillStyle = node.getColor();
				ctx.fillRect(x, y, x + this.rowHeight, y + this.colWidth);
			}
		}
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(0, 0);
		
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		// draw the rows of the grid.
		for (var row = 0; row <= this.numRows; ++row) {
			var lineY = row * this.rowHeight;
			ctx.moveTo(0, lineY);
			ctx.lineTo(fullW, lineY);
		}
		
		for (var col = 0; col <= this.numCols; ++col) {
			var lineX = col * this.colWidth;
			ctx.moveTo(lineX, 0);
			ctx.lineTo(lineX, fullH);
		}
		
		ctx.closePath();
		
		ctx.stroke();
	},
	
	changeColor: function(newColor) {
		var cornerNode = this.gameNodes[0][0];
		var oldColor = cornerNode.getColor();
		
		this.recursiveFloodFill(0, 0, oldColor, newColor);
		var args = new ColorChangedEventArgs(oldColor, newColor);
		this.fireEvent("onColorChanged", args);
	},
	
	getCurrentColor: function() {
		return this.gameNodes[0][0].getColor();
	},
	
	/**
	 * Shamelessly stolen from http://en.wikipedia.org/wiki/Flood_fill
	 */
	recursiveFloodFill: function(nodeRow, nodeCol, targetColor, replacementColor) {
		/*
		 Algorithm from Wikipedia.
		 Flood-fill (node, target-color, replacement-color):
			 1. If the color of node is not equal to target-color, return.
			 2. Set the color of node to replacement-color.
			 3. Perform Flood-fill (one step to the west of node, target-color, replacement-color).
			    Perform Flood-fill (one step to the east of node, target-color, replacement-color).
			    Perform Flood-fill (one step to the north of node, target-color, replacement-color).
			    Perform Flood-fill (one step to the south of node, target-color, replacement-color).
			 4. Return.
		 */
		if ((nodeRow < 0) || (nodeCol < 0)) {
			return;
		}
		
		if ((nodeRow >= this.numRows) || (nodeCol >= this.numCols)) {
			return;
		}
		
		if (targetColor == replacementColor) {
			return;
		}
		
		var node = this.gameNodes[nodeRow][nodeCol];
		if (node.getColor() != targetColor) {
			console.log(node.getColor() + " != " + targetColor);
			return;
		}
		
		node.setColor(replacementColor);
		
		this.recursiveFloodFill(nodeRow - 1, nodeCol, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow + 1, nodeCol, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow, nodeCol - 1, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow, nodeCol + 1, targetColor, replacementColor);
		
	}
});

var ColorChangedEventArgs = new Class({
	originalColor: null,
	newColor: null,
	
	initialize: function(originalColor, newColor) {
		this.originalColor = originalColor;
		this.newColor = newColor;
	},
	
	getOriginalColor: function() { return this.originalColor; },
	getNewColor: function() { return this.newColor; }
});