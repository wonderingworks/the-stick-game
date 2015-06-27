'use strict';

// creating a global object 
var home = {};

$(document).ready(function () {
	
	// checking if device is an iOS device (true/false)	
	var isIPhone = navigator.userAgent.indexOf('iPhone') !== -1;

	// setting height to fit window for ipad and desktop and iPhone
	function setHeight() {
		var windowHgt = $(window).height();
		var windowWdt = $(window).width();
		var containerHgt;
		var topzoneHgt;
		if (!isIPhone) {
			// only enable minimizing
			if ((windowWdt >= 1024 && windowHgt < 768) || (windowWdt >= 768 && windowHgt < 1024)) {
				containerHgt = $(window).height() - 50;
				topzoneHgt = $(window).height() - 228;
				$('#main').css('height', windowHgt);
				$('#container').css('height', containerHgt);
				$('#intro').css('height', topzoneHgt);
				$('.topzone').css('height', topzoneHgt);
			}
		} 
		
		if (isIPhone) {
			containerHgt = $(window).height() - 50;
			topzoneHgt = $(window).height() - 150;
			var centerAreaWidth = $(window).width() - 200;
			$('#main').css('height', windowHgt);
			$('#main').css('width', windowWdt);
			$('#container').css('height', containerHgt);
			$('#intro').css('height', topzoneHgt);
			$('.topzone').css('height', topzoneHgt);
			$('.center-area').css('width', centerAreaWidth);
		}
	}
	
	setHeight();
	
	// INTRO
	/* ------------------------------------------------*/
	// hiding elements
	$('#story').hide();
	$('#options').hide();
	$('#images').hide();
	$('.counter').hide();
	$('.singleplayer-box').hide();
	$('.multiplayer-box').hide();
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
	var duringGame = false;
	var orientation;
	var topzoneWidth;
	var topzoneHeight;
	var altX;
	var dropLine;
	//initialize counter points
	var counter = 0;
	//initialize counter sticks
	var counterSticks = 0;
	var images;
	var singlePlayer = false;
	var multiPlayer = false;
	// initialize player names
	var player = '';
	var player1 = '';
	var player2 = '';
	var playerToDefineEvil = '';
	// round counter for multiplayer game
	var multiRoundCounter = 0;
	// roundnumber to show in multiplayer games
	var roundNumber;
	
	// initialize statistic variables 
	var uniqueNames;
	var sums;
	var highscoreToplistAll;
	var highscoreToplistPoints;
	var multiPlayerStats;
	var player1Stats;
	var player2Stats;
	var player1Total;
	var player2Total;	
	
	// SOUND
	/* ------------------------------------------------*/
	// intro sound
	var soundIntro = new Audio('media/sound_intro.mp3');
	soundIntro.loop = true;
	// volume
	soundIntro.volume = 1;
	home.soundIntro = soundIntro;
	// defining sound variable for soundtoggle of draggables elements
	// true = sound on, false = sound off
	var soundOn = true;
	var soundIntroOn = true;
	// fading Introsound to volume 0.2
	function audioFade() {
		var interval = setInterval(function () {
			if (home.soundIntro.volume > 0.3) {
				home.soundIntro.volume -= 0.1;
			} else {
				clearInterval(interval);
			}
		}, 300);
	}
	
	// IOS-INTRO (fixing iOS issue of autoplay disable)
	/* ------------------------------------------------*/
	// checking if device is an iOS device (true/false)
	function isIOS() {
		return (
			(navigator.platform.indexOf('iPad') !== -1) ||
			(navigator.platform.indexOf('iPhone') !== -1)
		);
	}
	
	var iOSDevice = isIOS();
	// checking device orientation, landscape or portrait
	orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
	
	// needed because on iOS preload and autoplay are disabled. 
	// on iOS no data is loaded until the user initiates it.
	if (iOSDevice) {
		$('#content').hide();
		$('#iOSIntro').show();
	} else {
		$('#iOSIntro').remove();
		// adding border on desktop devices
		$('#main').addClass('desktop');
		if (soundIntroOn) {
			soundIntro.play();
		}
	}
	
	// when clicking on the screen
	// going to main content and playing sound
	$('#iOSIntro').click(function () {
		$('#iOSIntro').remove();
		$('#content').show();
		if (soundIntroOn) {
			soundIntro.play();
		}
	});
	
	// if window resizes set height
	// during ongoing game also refresh game plan	
	$(window).resize(function() {
		setHeight();
		if (duringGame) {
			refresh();
		}
	});
	
	// if device orientation changes 
	$(window).on('orientationchange', function(event) {
		setHeight();
		// if ongoing game and device's orientation differs from when game plan was set
		// user can turn device or refresh game plan
		// preventing alert when turning back to original position
		if (duringGame && (orientation !== window.orientation) ) {
			swal({
				title: 'Orientation changed',
				text: 'This may cause problems during a game. Please change the orientation of your device back again or click the refresh button to start over.',
				confirmButtonColor: '#fafafa',
				confirmButtonText: 'Refresh', 
				showCancelButton: true, 
				cancelButtonColor: '#fafafa', 
				cancelButtonText: 'Ok', 
				closeOnConfirm: true,   
				closeOnCancel: true
			}, 
				function(isConfirm) {
					if (isConfirm) {
						refresh();
					} 
				}
			);
		}
	});
	
	// LOCALSTORAGE
	/* ------------------------------------------------*/
	// Retrieving object 'highscores' from local storage
	var highscores = JSON.parse(localStorage.getItem('highscores'));
	
	// checking if there is already any information saved
	// if no information existing, the object 'highscores' is created
	if (!highscores) {
		highscores = { scores: [] };
	}
	
	// GAME OPTIONS (player form)
	/* ------------------------------------------------*/
	function gameOptions() {
		$('#intro').remove();
		$('#story').remove();
		$('#btn-main').hide();
		$('.image').remove();
		$('#images').hide();
		$('.counter').hide();
		$('.singleplayer-box').hide();
		$('.multiplayer-box').hide();
		$('.btn-change-box').hide();
		$('#centertext').hide();
		$('#statistics').hide();
		$('#ic-stats').hide();
		$('#ic-change').hide();
		$('#options').fadeIn(3000);
	}
	
	// GETTING PLAYER NAMES
	/* ------------------------------------------------*/
	// SINGLE PLAYER
	// single player - getting name(value) from form
	var singlePlayerForm = document.getElementById('single-player');
	var player0Field = document.getElementById('player-0');
	
	// defining player and starting game
	// event 'submit' is happening when user is submitting the form 
	singlePlayerForm.addEventListener('submit', function (event) {
		// to prevent that the form opens a new page
		event.preventDefault();
		// getting the value from the form
		player = player0Field.value;
		// if user didn´t enter a name
		if (player === '') {
			player = 'Unknown';
		}
		singlePlayer = true;
		multiPlayer = false;
		startGame();
		$('.multiplayer-box').hide();
		$('.singleplayer-box').show();
	});
	
	// MULTIPLAYER
	// multiplayer // getting names (values) from form
	var multiPlayerForm = document.getElementById('multi-player');
	var player1Field = document.getElementById('player-1');
	var player2Field = document.getElementById('player-2');
	
	// defining players and starting game
	// event 'submit' is happening when user is submitting the form
	multiPlayerForm.addEventListener('submit', function(event) {
		// to prevent that the form opens a new page
		event.preventDefault();	
		player1 = player1Field.value;
		if (player1 === '') {
			player1 = 'Unknown 1';
		}
		player2 = player2Field.value;
		if (player2 === '') {
			player2 = 'Unknown 2';
		}
		multiPlayer = true;
		singlePlayer = false;
		// reset round counter
		multiRoundCounter = 0;
		startGame();
		$('.singleplayer-box').hide();
		$('.multiplayer-box').show();
	});

	// PREPARING FOR APPENDING OF IMAGES
	/* ------------------------------------------------*/
	// defining the node which will be used to append the images later on
	var node = $('#images');
    	// the function 'addImages' appends all images
	function addImages() {
		for (var i = 1; i <= 15; i ++) {
			if (!isIPhone) {
				node.append('<img id="img-' + i + '" class="image draggable drag-drop tap-target" src="images/stick_' + i + '.png">');
			} else {
				node.append('<img id="img-' + i + '" class="image draggable drag-drop tap-target" src="images/stick_small_' + i + '.png">');
			}
			
		}
	}
	
	// GAME PLAN FUNCTIONS
	/* ------------------------------------------------*/
	// defining random x position
	function getRandomX() {
		// Math.floor() to return the largest integer less than or equal to a given number.
		// Math.random() to return a random number between 0 (inclusive) and given number (exclusive), + 1 to include it
		return Math.floor(Math.random() * topzoneWidth) + 1;
	}
	
	// defining random y position
	function getRandomY() {
		return Math.floor(Math.random() * topzoneHeight) + 1;	
	}
	
	// helper function to get current postioon
	function dragMoveListener(event) {
		var target = event.target;
		// keep the dragged position in the data-x/data-y attributes
		var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
		var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// translate the element
		target.style.webkitTransform =
		target.style.transform =
		  'translate(' + x + 'px, ' + y + 'px)';

		// update the position attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}
	
	// defining dropzone	
	function defineDropzone() {
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
	}
	
	// TURNING ALL IMAGES INTO TAPABLE ELEMENTS
	// using js-library 'interact'
	// to define evil element
	/* ------------------------------------------------*/
	// target elements with the 'tap-target' class
	function createTapEvil() {
		duringGame = true;
		orientation = window.orientation;
		interact('.tap-target')
			.on('tap', function (event) {
				event.currentTarget.classList.toggle('tap-highlight');
    			event.preventDefault();
  			})
			.on('doubletap', function (event) {
				event.currentTarget.setAttribute('data-evil', true);
				event.preventDefault();
				$('.tap-target').removeClass('tap-target');
				$('.image').addClass('draggable');
				createDraggables();
				$('#centertext').html('<h4>' + player + '</h4>Ready to play! Start picking sticks.<br>Drag one stick at a time to the bottom area.<br> Pick the sticks thoughtfully, one is evil.');
				$('#centertext').fadeIn();
				if (multiRoundCounter % 2 === 0) {
					$('#player2-text').addClass('gray');
					$('#player1-text').removeClass('gray');
				} else {	
					$('#player1-text').addClass('gray');
					$('#player2-text').removeClass('gray');
				}
			});
	}
	
	// TURNING ALL IMAGES INTO DRAGGABLE ELEMENTS
	// using js-library 'interact'
	// alerts customized with js-library 'sweet-alert'
	/* ------------------------------------------------*/
	// target elements with the 'draggable' class
	function createDraggables() {
			duringGame = true;
			orientation = window.orientation;
			setHeight();
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
				onstart: function (event) {
					var soundDrag = new Audio('media/sound_drag.mp3');
					if (soundOn) {
						soundDrag.play(0);
					}
				},

				// call this function on every dragmove event
				onmove: dragMoveListener,

				// call this function on every dragend event
				onend: function (event) {	
					var stick = $(event.target);
					//dropzone top > 540 - 5 for tolerance
					if (stick.position().top > dropLine) {
						stick.removeClass('draggable');

						// evil stick picked
						if (stick.data('evil') && counter < 13) {
							counterSticks = counter;
							//updating round counter for next round
							multiRoundCounter += 1;
							//adding result to local storage
							highscores.scores.push({ name: player, score: counter, sticks: counterSticks });
							// transforms object (highscores) into a
							// JSON-string and saves it as 'highscores'
							localStorage.setItem('highscores', JSON.stringify(highscores));
							$('.draggable').removeClass('draggable');
							// 1 second delay to play sound and show alert
							setTimeout(function () {
								var soundEvil = new Audio('media/sound_evil.mp3');
								if (soundOn) {
									soundEvil.play();
								}
								$('#ic-change').show();
								$('#ic-stats').show();
								//alert
								//singleplayer
								if (singlePlayer) {
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
										function (isConfirm) {
											if (isConfirm) {
												refresh();
											}
										}
									);
								//multiplayer
								} else {
									swal({ 
										title: 'Nice try', 
										text: player + ', you got ' + counter + ' points.',
										confirmButtonText: 'Continue', 
										confirmButtonColor: '#fafafa', 
										showCancelButton: true, 
										cancelButtonColor: '#fafafa', 
										cancelButtonText: 'X', 
										closeOnConfirm: true,   
										closeOnCancel: true
									}, 
										function (isConfirm) {
											if (isConfirm) {
												refresh();
											}
										}
									);	
								}
							}, 1000);

						// got all right, last remaining stick is evil 
						} else if (stick.data(!'evil') && counter == 13) {
							// updating counter
							counterSticks = 15;
							counter = 20;
							//updating round counter for next round
							multiRoundCounter += 1;
							//adding result to local storage
							highscores.scores.push({ name: player, score: counter, sticks: counterSticks });
							// transforms object (highscores) into a
							// JSON-string and saves it as 'highscores'
							localStorage.setItem('highscores', JSON.stringify(highscores));
							$('.draggable').removeClass('draggable');
							// 1 second delay to play sound, show points and alert
							setTimeout(function () {
								duringGame = false;
								// changing counter text
								$('#point-counter').text(counterSticks);
								var soundGood = new Audio('media/sound_good.mp3');
								if (soundOn) {
									soundGood.play();
								}
								$('#point-counter').text(counter);
								$('#ic-change').show();
								$('#ic-stats').show();
								//alert
								//singleplayer
								if (singlePlayer) {
									swal({ 
										title: 'Congratulations',
										text: 'You seem to have supernatural skills. You got all sticks and amazing 20 points. Do you want to play again?',
										confirmButtonText: 'Retry',
										confirmButtonColor: '#fafafa', 
										showCancelButton: true, 
										cancelButtonColor: '#fafafa', 
										cancelButtonText: 'X', 
										closeOnConfirm: true,   
										closeOnCancel: true
									}, 
										function (isConfirm) {
											if (isConfirm) {
												refresh();
											}
										}
									);
								//multiplayer
								} else {
									swal({ 
										title: 'Congratulations',
										text: player + ' , you seem to have supernatural skills. You got all sticks and amazing 20 points.',
										confirmButtonText: 'Continue',
										confirmButtonColor: '#fafafa', 
										showCancelButton: true, 
										cancelButtonColor: '#fafafa', 
										cancelButtonText: 'X', 
										closeOnConfirm: true,   
										closeOnCancel: true
									}, 
										function (isConfirm) {
											if (isConfirm) {
												refresh();
											}
										}
									);
								}
							}, 1000);

						// picked nice stick
						} else {
							// 1 second delay to play sound, show text and points
							setTimeout(function () {
								var soundGood = new Audio('media/sound_good.mp3');
								if (soundOn) { 
									soundGood.play();
								}
								// updating counter
								counter += 1;
								counterSticks = counter;
								// changing counter text
								$('#point-counter').text(counter);
								// fade out element
								stick.fadeOut(10000); 
								// removing information text 
								// after first nice element has been dropped
								if (counter === 1) {
									$('#centertext').fadeOut(1000);
									$('#ic-change').hide();
									$('#ic-stats').hide();
								}
							}, 1000);
						}
					}     
				}	
			});
	}
	
	// updating global variable
	home.dragMoveListener = dragMoveListener;
									
	// SETTING UP THE GAME PLAN 
	/* ------------------------------------------------*/
	// adding images
	// calculating random position
	// defining a random evil stick
	// transforming images into draggable elements
	// defining dragstart, dragmove, dragend events		
	function setGamePlan() {
		// adding images
		
		addImages();	
		var evil;
		// getting current width and height
		topzoneWidth = $('.topzone').width();
		topzoneHeight = $('.topzone').height();
		// top borderline of dropzone, - 5 for tolerance;
		dropLine =  topzoneHeight - 5;
	
		if (topzoneWidth < 800) {
			altX = topzoneWidth / 5;
		} else {
			altX = topzoneWidth / 4;
		}
	
		home.topzoneWidth = topzoneWidth;
		home.topzoneHeight = topzoneHeight;
		
		// singleplayer
		if (singlePlayer) {
			// defining a random 'evil' element 
			evil = Math.floor(Math.random() * 15) + 1;
			// tap class not needed
			$('.image').removeClass('tap-target');
			$('#round-counter').hide();
		// multiplayer
		} else {
			$('.image').removeClass('draggable');
			$('#round-counter').show();
			// switching player for each round
			if (multiRoundCounter % 2 === 0) {
				player = player1;
				playerToDefineEvil = player2;
				$('#player1-text').addClass('gray');
				$('#player2-text').removeClass('gray');
			} else {
				player = player2;
				playerToDefineEvil = player1;
				$('#player2-text').addClass('gray');
				$('#player1-text').removeClass('gray');
			}
		}
		
		// getting all image elements
		// load function needed to check that the appended images are loaded
		// otherwise images might be possitoned outside the container
		$('.image').load(function () {
							 
			var images = $('.image');
			// looping through all elements and checking if current element is 'evil'
			// attaching attribute 'evil' (true or false) to every element
			for (var i = 0; i < images.length; i++) {
				var img = images[i];
				
				// singleplayer
				if (singlePlayer) {
					if (i == evil) {
						img.setAttribute('data-evil', true);
					} else {
						img.setAttribute('data-evil', false);
					}	
				// multiplayer	
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
				img.style.left =  ( (x >= 0) ? x : altX ) + 'px';
				img.style.top =  ( (y >= 0) ? y : 0 ) + 'px';
			}		
			// singleplayer
			if (singlePlayer) {
				// creating draggable elements
				createDraggables();
				// defining dropzone
				defineDropzone();
			// multiplayer
			} else {
				// player can define evil element 
				// when evil element defined draggables are created
				createTapEvil();
				//defining dropzone
				defineDropzone();
			}
		});
		
	}
	
	// STARTING THE GAME
	/* ------------------------------------------------*/
	// for both singleplayer and multiplayer
	function startGame() {
		$('#intro').remove();
		$('#story').remove();
		$('#options').hide();
		$('.image').remove();
		counter = 0;
		counterSticks = 0;
		$('#point-counter').text(counter);
		roundNumber = Math.round((multiRoundCounter + 1) / 2);
		$('#round-counter').text('Round ' + roundNumber);
		// setting up the game plan
		setGamePlan();
		// lowering sound volume of Introsound
		audioFade();
		$('#images').fadeIn();
		// singleplayer
		if (singlePlayer) {
			$('#centertext').html('Drag one stick at a time to the bottom area.<br> Pick the sticks thoughtfully, one is evil.');
			$('.singleplayer-box').fadeIn();
			$('#player-text').text(player);
		// multiplayer
		} else {
			$('#centertext').html('<h4>' + playerToDefineEvil + '</h4> It´s your turn to choose the evil stick.<br> Doubletap the stick that should be evil.');
			$('.multiplayer-box').fadeIn();
			$('#player1-text').text(player1);
			$('#player2-text').text(player2);		
		}
		$('#ic-refresh').show();
		$('#centertext').fadeIn();
		$('.btn-change-box').fadeIn();
		$('.counter').fadeIn();
		$('#btn-main').hide();	
		$('#ic-change').show();
		$('#ic-stats').show();
	}	
	
	// RESETTING THE GAME PLAN
	/* ------------------------------------------------*/	
	// resetting the game plan and starting the game
	function refresh() {
		$('#statistics').hide();
		$('.image').remove();
		startGame();
	}
	
	// STATISTICS
	// CALCULATING PLAYER RESULTS & HIGHSCORE TOPLISTS
	/* ------------------------------------------------*/
	// function to round a number to 2 decimals
	function twoDec(n){
		return Math.round(n*100)/100;
	}
	
	// calculating player results and highscore toplist
	function calculatePlayerStats() {
		// creates array 'uniqueNames' containing all unique names 
		uniqueNames = highscores.scores
						// using the method .map to get all players names
						// map takes a function that returns an array consisting all players names (name)
						.map(function (score) { return score.name; })
						// filtering the results in order to achieve that every name exists only once
						.filter(function (score, index, arr) { return arr.indexOf(score) === index; });

		// takes the array 'uniqueNames' and creates the array 'sums'
		// containing objects with game statistics for each unique player (name)
		sums = uniqueNames
					// for each unique name (for each element in array 'uniqueNames')
					// calculating total points, total sticks, 
					// total times user got all 15 sticks, total rounds played
					.map(function(name) {
						var totalPoints = highscores.scores
									.filter(function (player) { return player.name == name; })
									.reduce(function (acc, curr) { return acc + curr.score; }, 0);
						var totalSticks = highscores.scores
									.filter(function (player) { return player.name == name; })
									.reduce(function (acc, curr) { return acc + curr.sticks; }, 0);
						var allSticks = highscores.scores
									.filter(function (player) { return player.name == name && player.sticks == 15; }).length;
						var totalRounds = highscores.scores.filter(function(s) { return s.name == name; }).length;
						// and returns each unique player's statistics as object
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
		
		// creating the array 'highscoreToplist' that is containing objects with name, percentage, totalRounds
		// sorted (descending) by the the highest percentage of getting all 15 sticks
		// containing top 5 results
		highscoreToplistAll =  sums
							// map returns an array with objects containing 
							// name, percentage, totalRounds
							.map(function (obj) { return {name: obj.name, perc: obj.percAllSticks, totalRounds: obj.totalRounds }; })
							// sorts the array (descending) by the highest percentage of getting all 15 sticks
							.sort(function (a, b) { return b.perc - a.perc; })
							// slicing the array to get the first 5 elements
							.slice(0, 5);
		
		highscoreToplistPoints = sums
							// map returns an array with objects containing 
							// name, average points per round, totalRounds
							.map(function (obj) { return {name: obj.name, avgPoints: obj.avgPoints, totalRounds: obj.totalRounds }; })
							// sorts the array (descending) by the highest average points per round
							.sort(function (a, b) { return b.avgPoints - a.avgPoints; })
							// slicing the array to get the first 5 elements
							.slice(0, 5);
		
		// updating global variables
		home.uniqueNames = uniqueNames;
		home.sums = sums;
		home.highscoreToplistAll = highscoreToplistAll;
		home.highscoreToplistPoints = highscoreToplistPoints;
	}
	
	// updating the global variable
	home.calculatePlayerStats = calculatePlayerStats;	
	
	
	function calculateMultiplayerStats() {
		// creates array 'multiPlayerStats' containing 
		// results for the number of rounds recently played by the two multiplayers
		multiPlayerStats = highscores.scores					
						.slice(-multiRoundCounter);

		// creates array with scores of player 1 
		player1Stats = multiPlayerStats
						.filter(function (obj) { return obj.name == player1; })
						.map(function (obj) { return obj.score; });

		// calculating total sum for player 1
		player1Total = player1Stats.reduce(function (acc, curr) { return acc + curr; }, 0);

		// creates array with scores of player 2 
		player2Stats = multiPlayerStats
						.filter(function (obj) { return obj.name == player2; })
						.map(function (obj) { return obj.score; });

		// calculating total sum for player 2
		player2Total = player2Stats.reduce(function (acc, curr) { return acc + curr; }, 0);		

		// updating global variables
		home.multiPlayerStats = multiPlayerStats;
		home.player1Stats = player1Stats;
		home.player2Stats = player2Stats;
		home.player1Total = player1Total;
		home.player2Total = player2Total;
	}
	
	home.calculateMultiplayerStats = calculateMultiplayerStats;
	
	// PUBLISHING HIGHSCORE TOPLIST & SPECIFIC PLAYER RESULT 
	/* ------------------------------------------------*/
	// publishing the first 5 highscores for percentage	
	function toplistAll() {
		$('#toplist-perc').empty();
		calculatePlayerStats();
		var rank = 0;
		highscoreToplistAll.forEach(function (obj) {
			rank += 1;
			var perc = twoDec(obj.perc) + ' %';
			var rounds = (obj.totalRounds == 1) ? (obj.totalRounds + ' round') : (obj.totalRounds + ' rounds');
			$('#toplist-perc').append('<tr><td>' + rank + '</td><td>' + obj.name  + '</td><td>' + perc + '</td><td>' + rounds + '</td></tr>');
		});
	}
	
	// publishing the first 5 highscores for average points
	function toplistPoints() {
		$('#toplist-points').empty();
		calculatePlayerStats();
		var rank = 0;
		highscoreToplistPoints.forEach(function (obj) {
			rank += 1;
			var avgPoints = twoDec(obj.avgPoints);
			var rounds = (obj.totalRounds == 1) ? (obj.totalRounds + ' round') : (obj.totalRounds + ' rounds');
			$('#toplist-points').append('<tr><td>' + rank + '</td><td>' + obj.name  + '</td><td>' + avgPoints + '</td><td>' + rounds + '</td></tr>');
		});
	}
	
	// publishing the current player´s result/statistics 
	function playerResult(name) {
		var node = $('#player-stats');
		$('#player-stats').empty();	
		calculatePlayerStats();
		// creating array 'result' by filtering 'sums' by one player´s name (player)
		// 'result' contains one specific player's statistics, 
		//  the array contains only one object
		var result = sums.filter(function (n) { return n.name == name; });
		result = result[0];
		// if player hasn´t played yet no results
		if (result === undefined) {
			node.append('<li> Name: ' + player + '</li>');
			node.append('<li> No results to show yet.</li>');
		// player has played and has results
		} else {	
			// function TwoDec is used to minimize to 2 decimals 
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
	
	// publishing multiplayer scores for the recent rounds played
	function multiplayerResult() { 
		if (multiRoundCounter === 0) {
			$('#multi-info').text('No results to show yet.');
			$('#multiplayer-stats').hide();
		} else {
			$('#multi-info').hide();
			$('#multiplayer-stats').show();
			$('#versus').empty();
			$('#player1-stats').find('td:gt(0)').remove();
			$('#player2-stats').find('td:gt(0)').remove();
			calculatePlayerStats();
			calculateMultiplayerStats();
			$('#versus').append('<thead><tr><th>' + player1 + '</th><th> vs. </th><th>' + player2 + '</th></tr></thead>');
			$('#versus').append('<tbody><tr><td>' + player1Total + '</td><td></td><td>' + player2Total + '</td></tr></tbody>');
			// appending player1 results
			$('#name1').text(player1);
			for (var i = 0; i < player1Stats.length; i++) {
				$('#player1-stats').append('<td>' + player1Stats[i] + '</td>');
			}
			// appending player1 results
			$('#name2').text(player2);
			for (var i = 0; i < player2Stats.length; i++) {
				$('#player2-stats').append('<td>' + player2Stats[i] + '</td>');
			}
		}
	}
	
	// BUTTONS / DROPZONE 
	/* ------------------------------------------------*/
	// must be placed after setGamePlan() that is defining image positions
	// otherwise some elements could be positionend outside the container
	
	// 'main' button -> leads to 1. story -> 2. options)
	$('#btn-main').click(function () { 
		// go to story
		var button = $(this);
        	$('#intro').remove();
		$('.storytext').append('<h1>wooden treasures. </h1><p>they have a past, they have been living in magic forests, have been breathing, have been watching silently.<br>they remained forgotten on the ground. <br>they got collected and received a new life.</p><h1>The sticks are what you see in them.</h1>');
        	$('#story').fadeIn(3000);
		button.removeClass('btn-0').addClass('btn-1');
		button.click(function () {
			var button = $(this);
			$('#story').remove();
			button.hide();
			$('#btn-skip').hide();
			gameOptions();
		});
    	});
	
	// 'skip intro' button -> leads to #options (defining players)
	$('#btn-skip').click(function () {
		var button = $(this);
		button.hide();
		gameOptions();		
	});
	
	// 'change player' button -> leads to #options (defining players)
	$('.btn-change').click(function () {
		$('.btn-change-box').hide();
		gameOptions();		
	});
	
	// ICON BUTTONS / MENU
	/* ------------------------------------------------*/
	//sound icon (on-off toggle)
	$('#ic-sound').click(function () {
		// toggle (true/false) for soundOn of draggable elements and soundIntro
		soundOn = !soundOn;	
		soundIntroOn = !soundIntroOn;
		var button = $(this);
		//toggle for introSound
		if (button.hasClass('sound-on')) {
			button.removeClass('sound-on').addClass('sound-off');
			$('#sound-img').attr('src', 'images/icon_mute_on.png');
			soundIntro.pause();
		} else {
			button.removeClass('sound-off').addClass('sound-on');
			$('#sound-img').attr('src', 'images/icon_mute_off.png');
			soundIntro.play();
		}		
	});
	
	// refresh icon -> resetting the game plan
	$('#ic-refresh').click(function () {
		refresh();
	});
	
	// change icon -> change of player
	$('#ic-change').click(function() {
		gameOptions();
	});
	
	// stats icon -> showing player statistics and highscore toplists
	$('#ic-stats').click(function () { 
		duringGame = false;
		$('#statistics').hide();
		$('.image').remove();
		$('#images').hide();
		$('.counter').hide();
		$('#centertext').hide();
		$('.singleplayer-box').hide();
		$('.multiplayer-box').hide();
		$('.btn-change-box').hide();
		// appending toplist percentage all
		toplistAll();
		// appending toplist points
		toplistPoints();
		if (singlePlayer){
			// appending current player's result 
			playerResult(player);
			$('#player-result').show();
			$('#multiplayer-result').hide();
		} else {
			// appending mutiplayer result 
			multiplayerResult();
			$('#multiplayer-result').show();
			$('#player-result').hide();
		}
		$('#statistics').fadeIn(3000);
		$('#ic-refresh').show();
	});
	
	// help icon -> alert showing guide
	$('#ic-help').click(function () { 
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
	 
});
