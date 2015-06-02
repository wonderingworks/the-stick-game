//v-0.1
'use strict';

// creating a global object 
// (to make sure that all objects can be logged in the console)
var home = {};

$(document).ready(function () {
		
	// INTRO
	/* ------------------------------------------------*/
	// hiding elemnts
	$('#story').hide();
	$('#options').hide();
	$('#images').hide();
	$('.counter').hide();
	$('.singleplayer-box').hide();
	$('.btn-change-box').hide();
	$('#statistics').hide();
	$('#ic-refresh').hide();
	$('#ic-stats').hide();
	$('#ic-change').hide();
	$('#centertext').hide();

    // INITIALIZE GLOBAL VARIABLES
	/* ------------------------------------------------*/
	// defining container / don´t use jquery for defining container as interact doesn´t support it
	var container = document.getElementById('container');
	//initialize counter points
    var counter = 0;
	//initialize counter sticks
    var counterSticks = 0;
	var images;
			
	var player = '';
	
	// initialize statistic variables 
	var uniqueNames;
	var sums;
	var highscoreToplistAll;
	var highscoreToplistPoints;
	

	// intro sound
	var soundIntro = new Audio('media/sound_intro.mp3');
	soundIntro.loop = true;
	soundIntro.muted = false;
	soundIntro.play();
	// volume
	soundIntro.volume = 1;
	home.soundIntro = soundIntro;
	// for sound toggle of draggables elements
	// true = sound on, false = sound off
	var soundOn = true;
	
	//soundIntro.volume = soundIntroVol;
	// fading out sound to volume 0.2 not working as sound.volume returns undefined.
//	function audioFade(sound){
//		while (sound.volume > 0.2) {
//			setTimeout(function() { sound.volume -= 0.1; }, 10);
//		}
//	}
	
	function audioFade(){
		while ( home.soundIntro.volume > 0.2 ) {
			setTimeout( home.soundIntro.volume -= 0.05 , 3000);
			console.log(home.soundIntro.volume);
		}
	}
	
	// LOCALSTORAGE
	/* ------------------------------------------------*/
	// Retrieving object 'highscores' from local storage
    var highscores = JSON.parse(localStorage.getItem('highscores'));
	
	// checking if there is already any information saved
	// if there is not any information existing the object 'highscores' is created
    if ( !highscores ) {
    	highscores = { scores: [] };
    }
	
	// PREPARING FOR APPENDING IMAGES
	/* ------------------------------------------------*/
	// defining the node which will be used to append the images later on
	var node = $('#images');
    // the function 'addImages' appends all images
	function addImages(){	
		for ( var i = 1; i <= 15; i ++ ) {
			node.append('<img id="img-' + i + '" class="image draggable drag-drop" src="images/stick_' + i + '.png">');
		}
	}

	
	// SETTING UP THE GAME PLAN
	/* ------------------------------------------------*/
	// 1. adding images
	// 2. calculating random position
	// 3. defining a random evil stick
	// 4. transforming images into draggable elements
	// 5. defining dragstart, dragmove, dragend events	
	
	function setGamePlan(){
		//lower sound volume of introsound
		//soundIntro.volume = 0.2;
		
		
		// adding images
		addImages();
		// defining a random 'evil' element 
		var evil = Math.floor(Math.random() * 15) + 1;

		// defining random x position
		function getRandomX() {
			// Math.floor() to return the largest integer less than or equal to a given number.
			// Math.random() to return a random number between 0 (inclusive) and given number (exclusive), + 1 to include it
			return Math.floor(Math.random() * 1024) + 1;
		}
		// defining random y position
		function getRandomY() {
			return Math.floor(Math.random() * 540) + 1;
		}
		
		// getting all draggable elements
		// load function needed to check i appended images is loaded
		// otherwise images might be possitoned outside the container
		$('.draggable').load(function() {
							 
			var images = $('.draggable');

			// looping through all elemnts and checking if current element is 'evil'
			// if evil attaching class 'evil')
			for ( var i = 0; i < images.length; i++ ) {
				var img = images[i];

				if ( i == evil ) {
					img.setAttribute('data-evil', true);
				} else {
					img.setAttribute('data-evil', false);
				}

				// defining a random position for every image
				// substract img width and height to assure 
				// that img is positioned within 'topzone's right and bottom edge
				var x = getRandomX() - parseFloat(img.width);
				var y = getRandomY() - parseFloat(img.height);

				// assures that elements are positioned 
				// within 'topzone's left and top edge 
				// 300 is used to prevent that several elements are placed along the left edge
				img.style.left =  ( ( x >= 0 ) ? x : 300 ) + 'px';
				img.style.top =  ( (y >= 0) ? y : 0 ) + 'px';
				//console.log(img.style.left);
				//console.log(img.style.top);
			}

			// TURNING ALL IMAGES INTO DRAGGABLE ELEMENTS
			// with library interact.js
			/* ------------------------------------------------*/
			// target elements with the 'draggable' class
			interact('.draggable')
				.draggable({
				// enable inertial throwing
				inertia: true,
				// keep the element within the area of 
				restrict: {
					restriction: container,
					endOnly: true,
					// important 0 0 1 1 (otherwise not restricting to container borders) 
					elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
				},

				//play sound
				onstart: function(event) {
					var soundDrag = new Audio('media/sound_drag.mp3');
					if (soundOn) {
						soundDrag.play(0);
					}
				},

				// call this function on every dragmove event
				onmove: dragMoveListener,

				// call this function on every dragend event
				onend: function (event) {	
					console.log(event, this);
					var stick = $(event.target);
					//dropzone top > 540 - 5 for tolerance
					if ( stick.position().top > 535 ) {
						stick.removeClass('draggable');

						// evil stick picked
						if ( stick.data('evil') && counter < 13 ) {
							console.log('dropped evil stick');
							counterSticks = counter;
							//adding result to local storage
							highscores.scores.push({ name: player, score: counter, sticks: counterSticks });
							// transforms object (highscores) into a
							// JSON-string and saves it as 'highscores'
							localStorage.setItem('highscores', JSON.stringify(highscores));
							console.log(highscores);
							$('.draggable').removeClass('draggable');
							//1 second delay to show text and alert
							setTimeout(function() {
								var soundEvil = new Audio('media/sound_evil.mp3');
								if ( soundOn ) {
									soundEvil.play();
								}
								$('#ic-change').show();
								$('#ic-stats').show();
								//alert 
								swal({ 
									title: 'Nice try',   
									text: 'You got ' + counter + ' points. Do you want to play again?', 
									confirmButtonText: 'Retry', 
									confirmButtonColor: '#fafafa', 
									showCancelButton: true, 
									cancelButtonColor: '#fafafa', 
									cancelButtonText: 'X', 
									closeOnConfirm: true,   
									closeOnCancel: true
								}, 
									function(isConfirm){
										console.log(isConfirm);
										if (isConfirm) {
											refresh();
										}
									}
								);	
							}, 1000);

						// got all right, last stick is evil 
						} else if ( stick.data(!'evil') && counter == 13 ) {
							// updating counter
							counterSticks = 15;
							counter = 20;
							//adding result to local storage
							highscores.scores.push({ name: player, score: counter, sticks: counterSticks });
							// transforms object (highscores) into a
							// JSON-string and saves it as 'highscores'
							localStorage.setItem('highscores', JSON.stringify(highscores));
							console.log(highscores);
							$('.draggable').removeClass('draggable');
							// 1 second delay to show text and points
							setTimeout(function() {
								// changing counter text
								$('.counter p').text(counterSticks);
								var soundGood = new Audio('media/sound_good.mp3');
								if ( soundOn ) {
									soundGood.play();
								}
								$('.counter p').text(counter);
								$('#ic-change').show();
								$('#ic-stats').show();
								//alert
								swal({ 
									title: 'Congratulations',   
									text: 'You seems to have supernatural skills. You got all sticks and got 20 points. Do you want to play again?', 
									confirmButtonText: 'Retry', 
									confirmButtonColor: '#fafafa', 
									showCancelButton: true, 
									cancelButtonColor: '#fafafa', 
									cancelButtonText: 'X', 
									closeOnConfirm: true,   
									closeOnCancel: true
								}, 
									function(isConfirm){
										console.log(isConfirm);
										if (isConfirm) {
											refresh();
										}
									}
								);	
							}, 1000);

						// picked good stick
						} else {
							console.log('dropped nice stick');
							setTimeout(function() {
								var soundGood = new Audio('media/sound_good.mp3');
								if ( soundOn ) { 
									soundGood.play();
								}
								// updating counter
								counter += 1;
								counterSticks = counter;
								// changing counter text
								$('.counter p').text(counter);
								// fade out elementet
								stick.fadeOut(10000); 
								if (counter == 1){
									$('#centertext').fadeOut(1000);
									$('#ic-change').hide();
									$('#ic-stats').hide();
								}
							}, 1000);
						}
					}     
				}	
			});

			function dragMoveListener (event) {
				var target = event.target,
					// keep the dragged position in the data-x/data-y attributes
					x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
					y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

				// translate the element
				target.style.webkitTransform =
				target.style.transform =
				  'translate(' + x + 'px, ' + y + 'px)';

				// update the position attributes
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
		 	}
			
			home.dragMoveListener = dragMoveListener;
			
			// listen for drop related events:
			// enable draggables to be dropped into this
			interact('.dropzone').dropzone({
				accept: '.draggable',  
				ondragenter: function (event) {
					 var dropzoneElement = event.target;
					dropzoneElement.classList.add('drop-target');
				},
				ondragleave: function (event) {
					// remove the drop feedback style
					event.target.classList.remove('drop-target');
				},

				ondropdeactivate: function (event) {
					event.target.classList.remove('drop-target');
				}
    		});		
		});	
	}

	
	// BUTTONS
	/* ------------------------------------------------*/
	// must be placed after setGamePlan() that is defining image positions
	// otherwise some elements could be positionend outside the container
	
	// main button
	$('#btn-main').click(function() { 
		// go to story
		var button = $(this);
        $('#intro').remove();
		$('.storytext').append('<h1>wooden treasures. </h1><p>they have a past, they have been living in in magic forests, have been breathing, have been watching silently.<br>they remained forgotten on the ground. <br>they got collected and received a new life.</p><h1>The sticks are what you see in them.</h1>');
        $('#story').fadeIn(3000);
		button.removeClass('btn-0').addClass('btn-1');
		// go to options
		button.click(function() {
			var button = $(this);
			$('#story').remove();
			button.hide();
			$('#btn-skip').hide();
			gameOptions();
		});
    });
	
	// skip intro button -> goes to #options(defining players)
	$('#btn-skip').click(function() {
		var button = $(this);
		button.hide();
		gameOptions();		
	});
	
	$('#btn-change').click(function() {
		$('.btn-change-box').hide();
		gameOptions();		
	});
	
	// ICON BUTTONS
	/* ------------------------------------------------*/
	
	//sound icon (on-off toggle)
	$('#ic-sound').click(function() {
		//true == false = false
		//false == false = true
		// toggle (true/false) for soundOn of draggable elements
		soundOn = !soundOn;		
		var button = $(this);
		//toggle for introSound
		if ( button.hasClass('sound-on') ){
			soundIntro.muted = true;
			button.removeClass('sound-on').addClass('sound-off');
			$('#sound-img').attr('src', 'images/icon_mute_on.png');
		} else {
			soundIntro.muted = false;
			button.removeClass('sound-off').addClass('sound-on');
			$('#sound-img').attr('src', 'images/icon_mute_off.png');
		}		
	}); 
	
	// resetting the game plan and starting the game
	function refresh(){
		counter = 0;
		counterSticks = 0;
		$('.counter p').text(counter);
		$('#statistics').hide();
		$('.image').remove();
		$('#centertext').show();
		startGame();
	}
	
	// refresh icon (-> resetting the game plan)
	$('#ic-refresh').click(function() {
		$('.highscore').remove();
		$('.player-result').remove();
		refresh();
	});
	
	// change icon (-> change of player)
	$('#ic-change').click(function() {
		gameOptions();
	});
	
	// stats icon (-> showing player statistics and highscore toplists)
	$('#ic-stats').click(function() { 		
		$('#statistics').hide();
		$('.image').remove();
		$('#images').hide();
		$('.counter').hide();
		$('#centertext').hide();
		$('.singleplayer-box').hide();
		$('.btn-change-box').hide();
		//appending toplist percentage all
		toplistAll();
		//appending toplist points
		toplistPoints();
		//appending player result 
		playerResult(player);
		$('#statistics').fadeIn(3000);
	});
	
	// help icon (alert showing guide)
	$('#ic-help').click(function() { 
		swal({   
			title: 'The Stick Game',   
			text: 'The stick game consists of fifteen sticks. One of them is evil. Try to get as many sticks as possible without picking the evil one. Drag one stick at a time from the game plan to the bottom area. Pick the sticks thoughtfully. Getting all the sticks shows that you are having supernatural skills.', 
			cancelButtonText: 'X',
			cancelButtonColor: '#fafafa',
			showCancelButton: true,
			confirmButtonText: 'Read more',
			confirmButtonColor: '#fafafa',      
			closeOnConfirm: false
			}, function(isConfirm) { 
					if (isConfirm) {     
						swal({
							title: '',   
							text: '<h3> Scores</h3>You get 1 point for each stick. If you get all the 15 sticks you get extra points which results in a score of 20 points. You can keep track of your scores by entering your name in the beginning of the game and visiting the statistics page. <h3> Credits</h3> The Stick Game is made by Wondering. The game is originally a physical game consisting of hand-painted sticks. For more information visit <a href="http://wondering.se" target ="_blank"> Wondering.se</a>.',   
							html: true,
							confirmButtonText: 'X',
							confirmButtonColor: '#fafafa',
						});   
					} 
				}
			);
	});
	
	
	// GAME OPTIONS (player form)
	/* ------------------------------------------------*/
	function gameOptions(){
		$('#intro').remove();
		$('#story').remove();	
		$('#btn-main').hide();
		$('.image').remove();
		$('#images').hide();
		$('.counter').hide();
		$('.singleplayer-box').hide();
		$('.btn-change-box').hide();
		$('#centertext').hide();
		$('#statistics').hide();
		$('#ic-stats').hide();
		$('#ic-change').hide();
		$('#options').fadeIn(3000);
	}

	
	// GETTING PLAYER NAMES
	/* ------------------------------------------------*/
	// single player - getting name(value) from form
	var singlePlayerForm = document.getElementById('single-player');
	var player0Field = document.getElementById('player-0');
	
	//multiplayer // getting names (values) from form
	/*
	var multiPlayerForm = document.getElementById('multi-player');
	var player1Field = document.getElementById('player-1');
	var player2Field = document.getElementById('player-2');
	*/
	
	// defining player(s) and starting game
	// event 'submit' is happening when user is submitting the form 
	singlePlayerForm.addEventListener('submit', function(event) {
		// to prevent that the form opens a new page
		event.preventDefault();
		// getting the value from the form
		player = player0Field.value;
		// if user didn´t enter a name
		if (player == '' ){
			player = 'Unknown';
		}
		startGame();
	});
	
	/*
	multiPlayerForm.addEventListener('submit', function(event) {
		// För att avbryta att vårt formulär skickar oss till en ny sida
		event.preventDefault();	
		player1 = player1Field.value;
		if (player1 == '' ){
			player1 = 'Unknown';
		}
		player2 = player2Field.value;
		if (player2 == '' ){
			player2 = 'Unknown';
		}
		startGame();
		
	});
	*/
	
	// STARTING THE GAME
	/* ------------------------------------------------*/
	function startGame(){
		//var button = $(this);
		$('#intro').remove();
		$('#story').remove();
		$('#options').hide();
		setGamePlan();
		audioFade();
		$('#images').fadeIn();
		$('#centertext').fadeIn();
		$('#player-text').text(player);
		$('.singleplayer-box').fadeIn();
		$('.btn-change-box').fadeIn();
		//$('#multiplayer-box').fadeIn();
		$('.counter').fadeIn();
		$('#btn-main').hide();
		$('#ic-refresh').show();
		$('#ic-change').show();
		$('#ic-stats').show();
	}
	
	
	// STATISTICS
	// CALCULATING PLAYER RESULTS & HIGHSCORE TOPLIST
	/* ------------------------------------------------*/
	//function to round a number to 2 decimals
	function twoDec(n){
		return Math.round(n*100)/100;
	}
	
	//calculating player results and highscore toplist
	function calculatePlayerStats(){
		// creates array 'uniqueNames' conatining all unique names 
		uniqueNames = highscores.scores
							// using the method .map to get all players names
							// map takes a function that returns an array contsining all players names (name)
							.map(function(score) { return score.name; })
							// filtering the results in order to achieve that every name exists only once
							.filter(function(score, index, arr) { return arr.indexOf(score) === index; });

		console.log('unique');
		console.log(uniqueNames);

		// takes the array 'uniqueNames' and creates the array 'sums'
		// containing objects with game statistics for each unique player (name)
		sums = uniqueNames
					// for each unique name (for each element in array 'uniqueNames')
					// calculating total points, total sticks, 
					// total times user got all 15 sticks, total rounds played
					.map(function(name) {
						var totalPoints = highscores.scores
									.filter(function(player) { return player.name == name; })
									.reduce(function(acc, curr) { return acc + curr.score; }, 0);
						var totalSticks = highscores.scores
									.filter(function(player) { return player.name == name; })
									.reduce(function(acc, curr) { return acc + curr.sticks; }, 0);
						var allSticks = highscores.scores
									.filter(function(player) { return player.name == name && player.sticks == 15; }).length;
						var totalRounds = highscores.scores.filter(function(s) { return s.name == name; }).length;
						// och returneras objekt med varje unika spelarens spelstatistik
						return {
							name: name,
							totalPoints: totalPoints,
							totalSticks: totalSticks,
							allSticks: allSticks,
							totalRounds: totalRounds,
							avgPoints: totalPoints / totalRounds,
							avgSticks: totalSticks / totalRounds,
							percAllSticks: allSticks / totalRounds * 100	 
						};
					});
		
		console.log('sums'); 
		console.log(sums);
		
		// creating the array 'highscoreToplist' that is containing objects with name, percentage, totalRounds
		// sorted (descending) by the the highest percentage of getting all 15 sticks
		// containing top 5 results
		highscoreToplistAll =  sums
								// map returns an array with objects containing 
								// name, percentage, totalRounds
								.map(function(obj) { return {name: obj.name, perc: obj.percAllSticks, totalRounds: obj.totalRounds }; })
								// sorts the array (descending) by the highest percentage of getting all 15 sticks
								.sort(function(a, b) { return b.perc - a.perc; })
								// slicing the array to get the first 5 elements
								.slice(0, 5);
		
		highscoreToplistPoints = sums
								// map returns an array with objects containing 
								// name, average points per round, totalRounds
								.map(function(obj) { return {name: obj.name, avgPoints: obj.avgPoints, totalRounds: obj.totalRounds }; })
								// sorts the array (descending) by the highest average points per round
								.sort(function(a, b) { return b.avgPoints - a.avgPoints; })
								// slicing the array to get the first 5 elements
								.slice(0, 5);
		
		console.log('highscoreToplist');
		console.log(highscoreToplistAll);
		console.log(highscoreToplistPoints);
		// updatating global variables
		home.uniqueNames = uniqueNames;
		home.sums = sums;
		home.highscoreToplistAll = highscoreToplistAll;
		home.highscoreToplistPoints = highscoreToplistPoints;
	}
	
	// updating the global variable
	home.calculatePlayerStats = calculatePlayerStats;
	
	
	// PUBLISHING HIGHSCORE TOPLIST & SPECIFIC PLAYER RESULT 
	/* ------------------------------------------------*/
	// publishing the first 5 highscores for percentage	
	function toplistAll(){
		$('#toplist-perc').empty();
		calculatePlayerStats();
		var rank = 0;
		highscoreToplistAll.forEach(function(obj) {
			rank += 1;
			var perc = twoDec(obj.perc) + ' %';
			var rounds = (obj.totalRounds == 1) ? ( obj.totalRounds + ' round' ) : ( obj.totalRounds + ' rounds' );
			$('#toplist-perc').append('<tr><td>' + rank + '</td><td>' + obj.name  + '</td><td>' + perc + '</td><td>' +rounds + '</td></tr>');
		});
	}
	
	// publishing the first 5 highscores for average points
	function toplistPoints(){
		$('#toplist-points').empty();
		calculatePlayerStats();
		var rank = 0;
		highscoreToplistPoints.forEach(function(obj) {
			rank += 1;
			var avgPoints = twoDec(obj.avgPoints);
			var rounds = (obj.totalRounds == 1) ? ( obj.totalRounds + ' round' ) : ( obj.totalRounds + ' rounds' );
			$('#toplist-points').append('<tr><td>' + rank + '</td><td>' + obj.name  + '</td><td>' + avgPoints + '</td><td>' +rounds + '</td></tr>');
		});
	}
	
	// publishing the current player´s result/statistics 
	function playerResult(name){
		var node = $('#player-stats');
		$('#player-stats').empty();	
		calculatePlayerStats();
		// creating array 'result' by filtering 'sums' by one player´s name (player)
		// 'result' contains one specific player's statistics, 
		//  the array contains only one object
		var result = sums.filter(function(n) { return n.name == name; });
		result = result[0];
		console.log('result');
		console.log(result);
		// if player hasn´t played yet
		if ( result == undefined ){
			node.append('<li> Name: ' + player + '</li>');
			node.append('<li> No results to show yet.</li>');
		} else {	
			// TwoDec used to minimize to 2 decimals 
			var avgPoints = twoDec(result.avgPoints);
			var avgSticks = twoDec(result.avgSticks);
			var avgPerc = twoDec(result.percAllSticks);
			var totalRounds = result.totalRounds;
			node.append('<li> Name: ' + result.name + '</li>');
			node.append('<li> Average points per round: ' + avgPoints + '</li>');
			node.append('<li> Average sticks per round: ' + avgSticks + '</li>');
			node.append('<li> Percentage of times player got all sticks: ' + avgPerc + ' %</li>');
			node.append('<li> Total rounds played: ' + totalRounds +'</li>');
		}
	}	 
});
	
