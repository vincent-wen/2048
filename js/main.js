window.onload = function() {
	new Controller().start();
}

function Grid(i) {
	this.i = i;
	this.value = 0;
	this.dom = document.getElementById('grid-'+i);
}
Grid.prototype.setValue = function(num) {
	this.value = num;
	switch (num) {
		case 0:
			this.dom.innerHTML = '';
			this.dom.style.backgroundColor= '#34495E';
			return;
		case 1: this.dom.style.backgroundColor = "#558b2f"; break;
		case 2: this.dom.style.backgroundColor = "#4caf50"; break;
		case 4: this.dom.style.backgroundColor = '#009688'; break;
		case 8: this.dom.style.backgroundColor = '#0097a7'; break;
		case 16: this.dom.style.backgroundColor = '#1e88e5'; break;
		case 32: this.dom.style.backgroundColor = '#3f51b5'; break;
		case 64: this.dom.style.backgroundColor = '#673ab7'; break;
		case 128: this.dom.style.backgroundColor = '#827717'; break;
		case 256: this.dom.style.backgroundColor = '#ef6c00'; break;
		case 512: this.dom.style.backgroundColor = '#a1887f'; break;
		case 1024: this.dom.style.backgroundColor = '#e91e63'; break;
		case 2048: this.dom.style.backgroundColor = '#e53935'; break;
		case 4096: this.dom.style.backgroundColor = '#263238'; break;
		case 8192: this.dom.style.backgroundColor = '#424242'; break;
		case 16386: this.dom.style.backgroundColor = '#000000'; break;
	}
	this.dom.innerHTML = num;
}

function Container(recorder) {
	this.grids = [];
	this.recorder = recorder;
}
Container.prototype.init = function() {
	for(var i=1; i<17; i++) {
		this.grids.push(new Grid(i));
	}
	if (!this.loadGame()) {
		this.displayTwoRandomNums();
	}
}
Container.prototype.displayTwoRandomNums = function() {
	this.displayRandomNum();
	this.displayRandomNum();
}
Container.prototype.displayRandomNum = function() {
	var index = Math.floor(Math.random()*16);
	var num = Math.floor(Math.random()*2) + 1;
	if (this.grids[index].value === 0) {
		this.grids[index].setValue(num);
	} else {
		this.displayRandomNum();
	}
}
Container.prototype.removeBlankGrids = function(row) {
	var stack = [];
	for(var i=0; i<row.length; i++) {
		if (row[i] !== 0) {
			stack.push(row[i]);
		}
	}
	return stack;
}
Container.prototype.move = function(row) {
	row = this.removeBlankGrids(row);
	
	// merge same grids
	for(var j=0; j<=2; j++) {
		if (row[j+1] === undefined) {
			break;
		}
		if (row[j] === row[j+1]) {
				row[j] *= 2;
				row[j+1] = 0;
				row = this.removeBlankGrids(row);
				this.recorder.addScore(row[j]);
		}
	}
	return row;
}
Container.prototype.isFull = function() {
	for(var i=0; i<this.grids.length; i++) {
		if (this.grids[i].value === 0) {
			return false;
		}
	}
	return true;
}
Container.prototype.reset = function() {
	for(var i=0; i<this.grids.length; i++) {
		this.grids[i].setValue(0);
	}
	this.displayTwoRandomNums();
	this.saveGame();
	this.recorder.resetScores();
}
Container.prototype.saveGame = function() {
	var grids = [];
	for(var i=0; i<this.grids.length; i++) {
		grids.push(this.grids[i].value);
	}
	localStorage['2048_status'] = btoa(JSON.stringify(grids));
}
Container.prototype.loadGame = function() {
	if (localStorage['2048_status'] !== undefined) {
		var grids = JSON.parse(atob(localStorage['2048_status']));
		for(var i=0; i<this.grids.length; i++) {
			this.grids[i].setValue(grids[i]);
		}
		return true;
	}
	return false;
}

function EventHandler(container) {
	this.container = container;
}
EventHandler.prototype.registerEvents = function() {
	var self = this;
	window.onkeydown = function(event) {
		switch (event.keyCode) {
			case 38: event.preventDefault(); 	self.upEvent(); break;
			case 39: event.preventDefault(); 	self.rightEvent(); break;
			case 40: event.preventDefault(); 	self.downEvent(); break;
			case 37: event.preventDefault(); 	self.leftEvent(); break;
			default: return;
		}
		if (self.container.isFull()) {
			alert("Game failed!");
			self.container.reset();
			return;
		}
		self.container.displayRandomNum();
		self.container.saveGame();
	};
	var resetBtn = document.getElementById("resetBtn");
	resetBtn.onclick = function(event) {
		self.container.reset();
	}
}
EventHandler.prototype.downEvent = function() {
	for(var i=0; i<=3; i++) {
		var row = [];
		row[3] = this.container.grids[i].value;
		row[2] = this.container.grids[i+4].value;
		row[1] = this.container.grids[i+8].value;
		row[0] = this.container.grids[i+12].value;
		
		row = this.container.move(row);
		
		this.container.grids[i].setValue(row[3] ? row[3] : 0);
		this.container.grids[i+4].setValue(row[2] ? row[2] : 0);
		this.container.grids[i+8].setValue(row[1] ? row[1] : 0);
		this.container.grids[i+12].setValue(row[0] ? row[0] : 0);
	}
}
EventHandler.prototype.upEvent = function() {
	for(var i=0; i<=3; i++) {
		var row = [];
		row[0] = this.container.grids[i].value;
		row[1] = this.container.grids[i+4].value;
		row[2] = this.container.grids[i+8].value;
		row[3] = this.container.grids[i+12].value;
		
		row = this.container.move(row);
		
		this.container.grids[i].setValue(row[0] ? row[0] : 0);
		this.container.grids[i+4].setValue(row[1] ? row[1] : 0);
		this.container.grids[i+8].setValue(row[2] ? row[2] : 0);
		this.container.grids[i+12].setValue(row[3] ? row[3] : 0);
	}
}
EventHandler.prototype.rightEvent = function() {
	for(var i=0; i<=12; i+=4) {
		var row = [];
		row[3] = this.container.grids[i].value;
		row[2] = this.container.grids[i+1].value;
		row[1] = this.container.grids[i+2].value;
		row[0] = this.container.grids[i+3].value;
		
		row = this.container.move(row);
		
		this.container.grids[i].setValue(row[3] ? row[3] : 0);
		this.container.grids[i+1].setValue(row[2] ? row[2] : 0);
		this.container.grids[i+2].setValue(row[1] ? row[1] : 0);
		this.container.grids[i+3].setValue(row[0] ? row[0] : 0);
	}
}
EventHandler.prototype.leftEvent = function() {
	for(var i=0; i<=12; i+=4) {
		var row = [];
		row[0] = this.container.grids[i].value;
		row[1] = this.container.grids[i+1].value;
		row[2] = this.container.grids[i+2].value;
		row[3] = this.container.grids[i+3].value;
		
		row = this.container.move(row);
		
		this.container.grids[i].setValue(row[0] ? row[0] : 0);
		this.container.grids[i+1].setValue(row[1] ? row[1] : 0);
		this.container.grids[i+2].setValue(row[2] ? row[2] : 0);
		this.container.grids[i+3].setValue(row[3] ? row[3] : 0);
	}
}

function Recorder() {
	this.scores = 0;
	this.highest = 0;
	this.scoresDom = document.getElementById('scores');
	this.highestDom = document.getElementById('highest');
	this.initScores();
}
Recorder.prototype.initScores = function() {
	this.scores = parseInt(localStorage['2048_scores']) || 0;
	this.highest = parseInt(localStorage['2048_highest']) || 0;
	this.scoresDom.innerHTML = this.scores;
	this.highestDom.innerHTML = this.highest;
}
Recorder.prototype.resetScores = function() {
	this.scores = 0;
	this.updateRecords();
}
Recorder.prototype.addScore = function(score) {
	this.scores += score;
	this.updateRecords();
}
Recorder.prototype.updateRecords = function() {
	this.scoresDom.innerHTML = this.scores;
	if (this.highest < this.scores) {
		this.highest = this.scores;
		this.highestDom.innerHTML = this.highest;
	}
	localStorage['2048_scores'] = this.scores;
	localStorage['2048_highest'] = this.highest;
}

function Controller() {
	this.recorder = new Recorder();
	this.container = new Container(this.recorder);
	this.eventHandler = new EventHandler(this.container);
}
Controller.prototype.start = function() {
	this.container.init();
	this.eventHandler.registerEvents();
}