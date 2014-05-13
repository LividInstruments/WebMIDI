var voices = new Array();
var audioContext = null;
var isMobile = false;	// we have to disable the convolver on mobile for performance reasons.

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function noteOn( note, velocity ) {
    clog(' note on '+note+' '+velocity);
		// color a DOM element
		var e = document.getElementById( "k" + note );
		if (e){
			e.classList.add("pressed");
		}
		//light a controller LED:
		light(note,'red');
}

function noteOff( note ) {
    clog('note off '+note);
		var e = document.getElementById( "k" + note );
		if (e){
			e.classList.remove("pressed");
		}
    //light a controller LED:
    light(note,'off');
}

function $(id) {
	return document.getElementById(id);
}

// 'value' is normalized to 0..1.
function controller( number, value ) {
    clog('cc '+number+' '+value);
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

function initAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	try {
    	audioContext = new AudioContext();
  	}
  	catch(e) {
    	alert('The Web Audio API is apparently not supported in this browser.');
  	}

	//window.addEventListener('keydown', keyDown, false);
	//window.addEventListener('keyup', keyUp, false);
	//setupSynthUI();

	isMobile = (navigator.userAgent.indexOf("Android")!=-1)||(navigator.userAgent.indexOf("iPad")!=-1)||(navigator.userAgent.indexOf("iPhone")!=-1);

}

window.onload=initAudio;
