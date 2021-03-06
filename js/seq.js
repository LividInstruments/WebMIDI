/*
This is a primitive sequencing example built around Chris Wilson's WebAudio metronome example https://github.com/cwilso/metronome for best timing practices
This comments out the beeps, and sequences MIDI note output to light the leds on a Livid controller.

*/
                            
//what leds are we sequencing?
var lednn = {}
lednn.Base = leds.Base.pad;
lednn.Alias8 = leds.Alias8.btn;
lednn.CNTRLR = leds.CNTRLR.rowbtn;
lednn.OhmRGB = leds.OhmRGB.grid;
lednn.Ohm64 = leds.Ohm64.grid;

var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote;        // What note is currently last scheduled?
var tempo = 120.0;          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // length of "beep" (in seconds)
var timerID = 0;            // setInterval identifier.

var canvas,                 // the canvas element
    canvasContext;          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    if ( (noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes

// create an oscillator - we need this for the timing.
    var osc = seqContext.createOscillator();
    osc.connect( seqContext.destination );
    
    //too noisy! I'll just comment out the blips
/*    
    if (beatNumber % 16 === 0)    // beat 0 == low pitch
        osc.frequency.value = 220.0;
    else if (beatNumber % 4)    // quarter notes = medium pitch
        osc.frequency.value = 440.0;
    else                        // other 16th notes = high pitch
        osc.frequency.value = 880.0;
    osc.start( time );
    osc.stop( time + noteLength );
*/
    //light the leds on the controller
    var color = 'g'
    if (beatNumber % 16 === 0){    // beat 0 == low pitch
        color = 'r';
    }
    else if (beatNumber % 4){    // quarter notes = medium pitch
        color = 'b';
    }
    var mspsn = (60000.0 / tempo)/4; //ms per sixteenth note
    var nn = lednn[product][beatNumber];
    light(nn,color,mspsn,'w'); //off color is white
    //clog('seq time '+ time +' len '+ noteLength + ' beat '+beatNumber+' nn '+nn );
}

function scheduler() {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < seqContext.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
    timerID = window.setTimeout( scheduler, lookahead );
}

function play() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = seqContext.currentTime;
        scheduler();    // kick off scheduling
        return "stop";
    } else {
        window.clearTimeout( timerID );
        return "play";
    }
}

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0); 
}

function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = seqContext.currentTime;

    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
    }

    // We only need to draw if the note has moved.
    if (last16thNoteDrawn != currentNote) {
        var x = Math.floor( canvas.width / 18 );
        canvasContext.clearRect(0,0,canvas.width, canvas.height); 
        for (var i=0; i<16; i++) {
            canvasContext.fillStyle = ( currentNote == i ) ? 
                ((currentNote%4 === 0)?"red":"blue") : "black";
            canvasContext.fillRect( x * (i+1), x, x/2, x/2 );
        }
        last16thNoteDrawn = currentNote;
    }
    // set up to draw again
    requestAnimFrame(draw);
}

function initseq(){
    clog('init sequencer');
    var container = document.createElement( 'div' );

    container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    document.body.appendChild( container );
    container.appendChild(canvas);    
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;
    
    seqContext = new AudioContext();
    
    // if we wanted to load audio files, etc., this is where we should do it.

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    requestAnimFrame(draw);    // start the drawing loop.
}

window.addEventListener("load", initseq );

