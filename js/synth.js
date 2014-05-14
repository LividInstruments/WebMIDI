var voices = new Array();
var synthContext = null;
var isMobile = false;	// we have to disable the convolver on mobile for performance reasons.

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function noteOn( note, velocity ) {
    //clog(' note on '+note+' '+velocity);
    $('notenum').value = note;
    $('noteval').value = velocity;
		//light a controller LED:
		light(note,'red');
}

function noteOff( note ) {
    //clog('note off '+note);
    $('notenum').value = note;
    $('noteval').value = 0;
    //light a controller LED:
    light(note,'off');
}

function $(id) {
	return document.getElementById(id);
}

// 'value' is normalized to 0..1.
function controller( number, value ) {
    //clog('cc '+number+' '+value);
    $('ccnum').value = number;
    $('ccval').value = value;
	  //send back to controller to update LEDs
	  ring(number,value);
}

var currentPitchWheel = 0.0;
// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
	var i;
	currentPitchWheel = value;
	clog('pitchwheel '+value);
}

//highest note in default settings for each controller:
var maxnote = {'Base':67,'Alias8':15,'CNTRLR':59,'OhmRGB':87,'Ohm64':64};
function lights_rnd(){
  var colors = ['r','g','b','c','m','y','k']; //translation is in var color in midi.js
  var max = maxnote[product]; //'product' is determined in midi.js when port is selected
  for(var i=0;i<=max;i++){
    var randi = Math.floor(Math.random()*7);
    var choice = colors[randi];
    light(i,choice);
  }
}
function lights_off(){
  var max = maxnote[product]; //'product' is determined in midi.js when port is selected
  for(var i=0;i<=max;i++){
    light(i,'off');
  }
}

//This is merely a placeholder, since this 'synth' doesn't actually produce sound. But it's good groundwork!
function initAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	try {
    	synthContext = new AudioContext();
  	}
  	catch(e) {
    	alert('The Web Audio API is apparently not supported in this browser.');
  	}

	//window.addEventListener('keydown', keyDown, false);
	//window.addEventListener('keyup', keyUp, false);
	//setupSynthUI();

	isMobile = (navigator.userAgent.indexOf('Android')!=-1)||(navigator.userAgent.indexOf('iPad')!=-1)||(navigator.userAgent.indexOf('iPhone')!=-1);

}

window.onload=initAudio;
