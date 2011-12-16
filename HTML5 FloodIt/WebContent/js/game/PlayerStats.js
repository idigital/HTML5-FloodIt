var PlayerStats = new Class({
	Implements: Events,
	gameSeed: null,
	stepCount: 0,
	
	initialize: function(pGameSeed, pInitialStepCount) {
		this.gameSeed = pGameSeed || null;
		this.stepCount = pInitialStepCount || 0;
	},
	
	getGameSeed: function() { return this.gameSeed; },
	setGameSeed: function(pGameSeed) { this.gameSeed = pGameSeed; },
	
	getStepCount: function() { return this.stepCount; },
	setStepCount: function(pStepCount) {
		if (this.stepCount == pStepCount) {
			return;
		}
		
		var oldSteps = this.stepCount;
		
		this.stepCount = pStepCount;

		var newSteps = this.stepCount;
		
		var evtArgs = new StepCountChangedEventArgs(oldSteps, newSteps);
		this.fireEvent("onStepCountChanged", evtArgs);
	},
	
	incrementStepCount: function() { 
		var oldSteps = this.stepCount;
		
		this.stepCount += 1;

		var newSteps = this.stepCount;
		
		var evtArgs = new StepCountChangedEventArgs(oldSteps, newSteps);
		this.fireEvent("onStepCountChanged", evtArgs);
	}
});

var StepCountChangedEventArgs = Class({
	oldStepCount: null,
	newStepCount: null,
	
	initialize: function(pOldStepCount, pNewStepCount) {
		this.oldStepCount = pOldStepCount;
		this.newStepCount = pNewStepCount;
	},
	
	getOldStepCount: function() { return this.oldStepCount; },
	getNewStepCount: function() { return this.newStepCount; }
});