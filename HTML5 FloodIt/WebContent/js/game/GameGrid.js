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
		for (var i = 0; i < this.numCols; ++i) {
			this.gameNodes[i] = new Array(this.numCols);
			for (var j = 0; j < this.numRows; ++j) {			
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
		for (var col = 0; col < this.numCols; ++col) {
			for (var row = 0; row < this.numRows; ++row) {
				var x = col * this.colWidth;
				var y = row * this.rowHeight;
				var node = this.gameNodes[col][row];
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
		
		//this.recursiveFloodFill(0, 0, oldColor, newColor);
		this.queueBasedFloodFill(0, 0, oldColor, newColor);
		var args = new ColorChangedEventArgs(oldColor, newColor);
		this.fireEvent("onColorChanged", args);
		if (this.isBoardInWinState()) {
			this.fireEvent("onGameWin");
		}
	},
	
	getCurrentColor: function() {
		return this.gameNodes[0][0].getColor();
	},
	
	getNode: function(col, row) {
		if ((col < 0) || (row < 0)) {
			return null;
		}
		
		if ((col > (this.numCols - 1)) || (row > (this.numRows - 1))) {
			return null;
		}
		
		return this.gameNodes[col][row];
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
		
		var node = this.gameNodes[nodeCol][nodeRow];
		if (node.getColor() != targetColor) {
			return;
		}
		
		node.setColor(replacementColor);
		
		this.recursiveFloodFill(nodeRow - 1, nodeCol, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow + 1, nodeCol, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow, nodeCol - 1, targetColor, replacementColor);
		this.recursiveFloodFill(nodeRow, nodeCol + 1, targetColor, replacementColor);
		
	},
	
	queueBasedFloodFill: function(startRow, startCol, targetColor, replacementColor) {
		/*
		    Algorithm from same wikipedia article:
		  	Flood-fill (node, target-colour, replacement-colour):
			 1. Set Q to the empty queue.
			 2. If the colour of node is not equal to target-colour, return.
			 3. Add node to the end of Q.
			 4. While Q is not empty: 
			 5.     Set n equal to the first element of Q
			 6.     If the colour of n is equal to target-colour:
			 7.         Set the colour of n to replacement-colour.
			 8.         If the colour of the node to the west of n is target-colour:
			 9.             Add that node to the end of Q
			10.         If the colour of the node to the east of n is target-colour: 
			11.             Add that node to the end of Q
			12.         If the colour of the node to the north of n is target-colour:
			13.             Add that node to the end of Q
			14.         If the colour of the node to the south of n is target-colour:
			15.             Add that node to the end of Q
			16.     Remove first element from Q
			17. Return.
		 */
		if (targetColor == replacementColor) {
			return;
		}
		
		var queue = [];
		
		var node = this.getNode(startCol, startRow);
		if (node == null) {
			console.warn("No node found at " + startCol + ", " + startRow);
			return;
		}
		
		if (node.getColor() != targetColor) {
			return;
		}
		
		queue.unshift(node);
		while (queue.length > 0) {
			var curNode = queue.pop();
			if (curNode.getColor() == targetColor) {
				curNode.setColor(replacementColor);
				
				var nodeCol = curNode.getX();
				var nodeRow = curNode.getY();
				
				var westNode = this.getNode(nodeCol - 1, nodeRow);
				if (westNode != null) {
					if (westNode.getColor() == targetColor) {
						queue.unshift(westNode);
					}
				} 
				
				var eastNode = this.getNode(nodeCol + 1, nodeRow);
				if (eastNode != null) {
					if (eastNode.getColor() == targetColor) {
						queue.unshift(eastNode);
					}
				}
				
				var northNode = this.getNode(nodeCol, nodeRow - 1);
				if (northNode != null) {
					if (northNode.getColor() == targetColor) {
						queue.unshift(northNode);
					}
				} 
				
				var southNode = this.getNode(nodeCol, nodeRow + 1);
				if (southNode != null) {
					if (southNode.getColor() == targetColor) {
						queue.unshift(southNode);
					}
				} 
			}
		}
	},
    
    isBoardInWinState: function() {
        var allNodes = this.gameNodes;
        var curColor = this.getCurrentColor();
        for (var row = 0; row < this.numRows; ++row) {
            for (var col = 0; col < this.numCols; ++col) {
                var node = allNodes[row][col];
                if (node.getColor() != curColor) {
                    return false;
                }
            }
        }
        
        return true;
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