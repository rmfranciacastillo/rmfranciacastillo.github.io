
//AJAX Call
function getTemplate(path,loc, callback){

	var xhr = new XMLHttpRequest(); 
	var status = 0; 

	//calling the template
	xhr.open('GET', path, false);

	status = xhr.status; 

	//load template
	xhr.onload = function(){
		/*
		*	Callback 
		*		if status == 200
		*			print into loc
		*		else 
		*			prints status with error mssg
		*/

		if(xhr.status == 200){
			callback(xhr.status, loc, xhr.response);
		}
		else{
			callback(xhr.status);
		}
	};

	//Package sent
	xhr.send(null);
};//end of getTemplate


/** DISPLAY OBJECT **/
var Display = function(){
	
	// PRIVATE
	// *********
	var panel; 

	var templates = {
		player_selection: 'views/player_num_selection.html',
		side_selection: 'views/side.html',
		game_grid: 'views/game.html'	
	};

	// PUBLIC 
	// *********
	this.setPanel = function(panel){
		this.panel = panel; 
	}// end of setPanel	

	this.getPanel = function(){
		return this.panel; 	
	}// end of getPanel

	this.getTemplates = function(){
		return templates; 
	}// end of getTemplates

	// AJAX request handler
	this.getTemplate = function(template){

		var xhr = new XMLHttpRequest();
		var status = 0;

		//Select template path
		var path =  (this.getTemplates())[template];

		//calling the template
		xhr.open('GET', path, false);

		// Set the GET request status
		status = xhr.status;

		//load template
		xhr.onload = function(){
			/*
			*	Callback 
			*		if status == 200
			*			print into panel 
			*		else 
			*			prints status with error mssg
			*/	
			var panel = document.getElementById('panel');

			if(xhr.status == 200){
				panel.innerHTML = xhr.response;
			}
			else{
				console.log("Error: " + xhr.status );
			}
		};
		
		//Package sent
		xhr.send(null);

	}//end of getTemplate		

	// Display Grid Player Options
	this.setPlayerOptions = function(){
		// only to setup player vs COM(if Available)
		var player  = document.getElementsByClassName('player-turn'); 
		var pscore  = document.getElementsByClassName('player-score');
		
		// Setup scores
		var p1 = document.getElementById('pscore0'); 
		var p2 = document.getElementById('pscore1'); 
		
		//update scores
		p1.id = mygame.getSideTurn() + '-score';
	    p2.id = mygame.inverseSide();	

		// Home button setup 
		// Setup options for computer
		if( mygame.getNumberOfPlayers() == 1){
			player[1].innerHTML = 'COM';	
			pscore[1].innerHTML = 'COM: <span id="'+ mygame.inverseSide()+'-score">0</span>';	
		}

	}; // end of setPlayerOptions

	this.resetGameGrid = function(){
		
		let cell = grid.getCell(); 

		// Setup grid to default value 	
		for(var i=0; i<cell.length; i++){
			cell[i].innerHTML = 'x';
		}
	}// end of resetGameGrid

	this.printSymbol = function(cell){
		cell.innerHTML = "<span class='selected' id='" 
						+ grid.getCC() 
						+"'> "
						+ grid.getSymbol() 
						+ "</span>";
	}// end of printSymbol

	this.updatePlayerScore = function(){
		
		let score = document.getElementById(mygame.getSideTurn()+'-score'); 	
		
		score.innerHTML = mygame.getCurrentPlayerScore(); 

	}// end of updatePlayerScores

}//end of Display declaration

var display = new Display();

/*** GAME FLOW ***/

// GLOBALS
// - mygame : Game Object that handles all the game settings
// - grid   : Grid Object that handles the game Grid 
// - display: Display handler for the appropiate templates  


// Load the game
window.addEventListener('load',function(e){
	game_setup();
});

function game_setup(){

	var panel = document.getElementById('panel');

	// Set the panel 
	display.setPanel(panel);

	// Request new player template
	display.getTemplate('player_selection');

	player_selection();
}// end of game_setup

function player_selection(){

	// Player selection Buttons
	var players = document.getElementsByClassName('player');  

	// Player Button selection 
	for(let i=0; i<players.length; i++){
		players[i].addEventListener('click', function(e){
			e.preventDefault();
			
			//Set number of players
			if(this.id == 'player1'){
				mygame.setNPlayers(1);
			}else{
				mygame.setNPlayers(2);
			}
			
			//Load Side Selection
			display.getTemplate('side_selection');

			// Load Side Selector Controller
			side_selection_flow(); 
		});
	}
}//end of player_selection

//Side selection controller
function side_selection_flow(){
	
	// Side Template Selection Buttons
	var back = document.getElementById('back'); 
	var side = document.getElementsByClassName('side');	
			
	// Back Button
	back.addEventListener('click', function(e){
		game_setup();
	}); 

	// Adding Listener Options 	
	for(let i=0; i<side.length; i++){
		side[i].addEventListener('click', function(e){
			// Prevent a default link
			e.preventDefault();
	
			// Load the game 	
			display.getTemplate('game_grid');

			// Game settings
			mygame.setSelectedSide(this.id);

			// Set the controls of the game
			game_grid_controller(); 
		});		
	}
}//end of side_selection_flow

function game_grid_controller(){

	//reset button
	var home  = document.getElementById('btn-home');
	var reset = document.getElementById('btn-reset');

	//grid spaces options
	var cell   = document.getElementsByClassName('cell');

	home.addEventListener('click', function(e){
		e.preventDefault();
		game_setup();	
	});

	reset.addEventListener('click',function(e){
		e.preventDefault();
		grid.resetGame();
		display.resetGameGrid(); 
	});

	// Display if vs COM 	
	display.setPlayerOptions();

	// set Cell options
	grid.setCellOption(cell);
	grid.setCurrentSide(mygame.getSideTurn());

	// Adding click listeners to cells
	for(var cnum=0;  cnum<cell.length; cnum++){
		cell[cnum].addEventListener('click', function(){
		
			// Check if cell is Null
			if(grid.cell_is_null(this.id)){
				
				// Print Symbol in the grid
				display.printSymbol(this);
				// Update game
				grid.updateGameGrid(this); 
				// Check Game rules
				if(grid.hasWon()){
					// update scores
					mygame.updateScores(grid.getCC());
					display.updatePlayerScore(grid.getCC()); 	

					// reset the grid
					grid.resetGame();
					display.resetGameGrid(); 
				}	

				// Set items for next Turn
				mygame.switchTurn(); 
				grid.switchSymbol();

			}
		}); 	
	}

}// end of game_grid_controller



/** GRID OBJECT **/
var Grid = function(){

	// PRIVATE
	// *********
	// Cells in the Grid
	var cell;
	// Current game status
	var game   = [null, null, null,
				  null, null, null, 
				  null, null, null ];

	// Set current side 
	// symbol - Sets the symbol of the side
	// cc     - Sets the side of the cell class 
	var current_side = {
		symbol: '',
		cc: ''
	}; 

	// PUBLIC 
	// *********
	this.getGameStatus = function(){
		return game;	
	}// end of getGame

	this.setCellOption = function(cell){	
		this.cell = cell;
	}// end of setCellOption

	this.getCell = function(){
		return this.cell; 
	}// end of getCell

	this.resetGame = function(){
		game = [null, null, null, null, null, null, null, null, null];
	}// end of resetGame

	this.setCurrentSide = function(side){
		// side selection settings 
		if(side == 'rebels'){
			current_side['symbol'] = '&#64;';
			current_side['cc'] = 'rebels';	
		}	
		else {
			current_side['symbol'] = '&#42;';
			current_side['cc'] = 'empire';
		}
	}// end of setCurrentSide 

	this.switchSymbol = function(){
		if(current_side['cc'] == 'rebels'){
			current_side['cc'] = 'empire';
			current_side['symbol'] = '&#42;';
		}else{
			current_side['cc'] = 'rebels';	
			current_side['symbol'] = '&#64;';
		
		}		
	}// end of switchTurn

	this.getCurrentSide = function(){
		return current_side;
	}// end of getCurrentSide

	this.game_grid_location = function(id){
		switch(id){
			case 'top-left': 
				return 0;
			case 'top':
				return 1;
			case 'top-right': 
				return 2;
			case 'middle-left': 
				return 3;
			case 'middle': 
				return 4;
			case 'middle-right': 
				return 5;
			case 'bottom-left': 
				return 6;
			case 'bottom': 
				return 7;
			case 'bottom-right': 
				return 8;
			default: 
				console.log('Something was wrong');
		}
	}// end of game_grid_location

	this.cell_is_null = function(id){
		let cnum = this.game_grid_location(id);
		return game[cnum] === null; 
	}// end of cell_is_null

	this.getCC = function(){
		return current_side['cc']; 	
	}// end of getCC 

	this.getSymbol = function(){
		return current_side['symbol'];	
	}// end of getSymbol

	this.updateGameGrid = function(cell){
		let cnum = this.game_grid_location(cell.id);
		game[cnum] = current_side['cc'];
	}// end of updateGameGrid

	// Check if the player with the current turns wins 
	// input: Array of inputs from grid
	// output: Boolean win or lose 
	this.hasWon = function(){
	
		//setup current game array
		var cgame   = [];
	
		// winning patterns
		var winning = [
					[1,1,1,0,0,0,0,0,0],
					[0,0,0,1,1,1,0,0,0],		
					[0,0,0,0,0,0,1,1,1],
					[1,0,0,1,0,0,1,0,0],
					[0,1,0,0,1,0,0,1,0],		
					[0,0,1,0,0,1,0,0,1],
					[1,0,0,0,1,0,0,0,1],
					[0,0,1,0,1,0,1,0,0]
					]; 
	
		// Set the current project into an array of 0's and 1's	
		// 1 for player
		// 0 for everything else 
		for(let i=0; i<=8; i++){
			if(game[i]== current_side['cc']){
				cgame.push(1);	
			}
			else{
				cgame.push(0);
			}
		}

		// Check game array to winning conditions
		for( var i=0; i<winning.length; i++){
			// 3: winning conditions have been matched 
			if( cgame.intersection(winning[i]).length == 3 ){
				return true;	
			}
		}// end of for 

		return false;
	
	}// end of hasWon	

}// end of Grid declaration

var grid = new Grid();
console.log('Grid Created');

// Finds the common items of two arrays of the same size
// and filters out the 0's 
Array.prototype.intersection = function(a){
	
	var temp = [];

	// check the items for each array
	this.forEach(function(item, pos){ 
		
		if(item === a[pos]){
			temp.push(item);
		}
			
	});

	//filter the 0's and see the # of 1's for each case. 
	return temp.filter(function(a){ return a !== 0;});

};

// Testing implementation of prototype
//var arr1 = [0,1,0];
//var arr2 = [1,1,1];
//var arr3 = [1,2,3];

//console.log(arr1.intersection(arr2)); // output: [1,0]

// real test forms
//var t1 = [1,1,1,0,0,0,0,0,0];
//var game = [1,1,0,0,1,0,0,1,0];

//console.log(game.intersection(t1)); //output: [1,1]


/** GAME OBJECT **/

// declaring game object
var Game = function(){
	
	// PRIVATE
	// ************ 
	// Game Settings
	// 0: Number of players
	// 1: Side selection
	// 2: Players turn 
	// 3: Players score
	var _game_settings = {
		nplayers: 0,
		side: null,
		score: {
			rebels: 0,
			empire: 0
		}
	};

	var _setGameSettings = function(nplayers, side, pturn, score){
		console.log(game_settings);	
	};	

	// PUBLIC 
	// **********
	this.showSettings = function(){
		console.log(_game_settings); 	
	}// end of showSettings

	// Set number of players
	this.setNumberOfPlayers = function(number){

		try{
			if(typeof number != 'number'){
				throw "input is not a number";
			}
			else{
				_game_settings['nplayers'] = number; 
			}
		}catch(e){
			console.log("Error in number input");
		}
	}// end of setNumberOfPlayers

	this.getNumberOfPlayers = function(){
		return _game_settings['nplayers'];	
	}// end of getNumberOfPlayes

	// Set selected side that is going to start	
	this.setSelectedSide = function(selected){
		try{
			_game_settings['side'] = selected; 
		}catch(e){
			console.log("Error:" + e);
		}
	}//end of setSelectedSide
	
	// Get player's turn
	this.getSideTurn = function(){
		return _game_settings['side'];
	}// end of getSideTurn
	
	this.inverseSide = function(){
		return _game_settings['side'] == 'empire'? 'rebels' : 'empire';  
	}// end of inverseSide

	// Get current player score 
	this.getCurrentPlayerScore = function(){
		var side = _game_settings['side'];
		return _game_settings['score'][side];	
	}// end of getCurrentPlayerScore

	// Set number of Players
	this.setNPlayers = function(nplayers){
		try{
			_game_settings['nplayers'] = nplayers; 
		}catch(e){
			console.log("Error: "+e);
		}	
	}// end of setNPlayers

	this.switchTurn = function(){
		if(_game_settings['side'] == 'rebels'){
			_game_settings['side'] = 'empire'; 
		}else{
			_game_settings['side'] = 'rebels'; 
		}	

	}// end of switchTurn

	this.updateScores = function(side){
		_game_settings['score'][side] += 1; 	
	}// end updateScores
	
	console.log('Game created');	
}; 

var mygame = new Game(); 

/***************************
 *     GAME RULES          *
 **************************/


/*

// Check if the player with the current turns wins 
// input: Array of inputs from grid
// output: Boolean win or lose 
function rules(game, turn){
	
	//setup current game array
	var cgame   = [];
	
	// winning patterns
	var winning = [
				[1,1,1,0,0,0,0,0,0],
				[0,0,0,1,1,1,0,0,0],		
				[0,0,0,0,0,0,1,1,1],
				[1,0,0,1,0,0,1,0,0],
				[0,1,0,0,1,0,0,1,0],		
				[0,0,1,0,0,1,0,0,1],
				[1,0,0,0,1,0,0,0,1],
				[0,0,1,0,1,0,1,0,0]
				]; 
	
	cgame = array_converter(cgame, game, turn);

	// Check game array to winning conditions
	for( var i=0; i<winning.length; i++){
		// 3: winning conditions have been matched 
		if( cgame.intersection(winning[i]).length == 3 ){
			console.log('Winner');
			return true;	
		}
	}// end of for 
		
	return false; 

}// end of rules

function array_converter(cgame, game , turn){

	// convert the current game to 
	// 1 for player
	// 0 for everything else 
	for (var i = 0; i<= 8; i++){
		if(game[i] == turn) {
			cgame.push(1);
		}
		else{
			cgame.push(0);	
		}
	} 	

	return cgame;

}// end of win_conditions 
  */
