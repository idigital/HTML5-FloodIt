var ControlPanel = new Class({
	Implements: [Events],
	
	parent: null,
	buttons: null,
	
	buttonHeight: "32px",
	buttonWidth: "32px",
	
	initialize: function(parent, colorArray) {
		this.parent = parent;
		
		var numColors = colorArray.length;
		this.buttons = new Array(numColors);
		
		for (var i = 0; i < numColors; ++i) {
			var btn = new Element('span');
			
			btn.setStyles({
				height: this.buttonHeight,
				width: this.buttonWidth,
				backgroundColor: colorArray[i],
				border: '1px solid #000'
			});
			
			btn.addEvent('click', this.buttonClicked.bind(this));
			
			this.buttons[i] = btn;
			
			btn.inject(this.parent);
		}
	},
	
	buttonClicked: function(event, force) {
		event.preventDefault();
		var args = {
			color: event.target.getStyle('background-color'),
			index: this.buttons.indexOf(event.target)
		};
		this.fireEvent("onTrigger", args);
	}
});