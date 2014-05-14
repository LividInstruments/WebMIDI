var inquire = [0xf0,0x7e,0x7f,0x06,0x01,0xf7]; //(240, 126, 127, 6, 1, 247) standard MIDI inquiry. controller replies with a sysex message
var CH = 0x00;

//change this depending on the controller you are using. Sysex should take care of this, but if it doesn't, this works too:
var product = 'CNTRLR'; 
//var product = 'OhmRGB'; 
//var product = 'Base'; 
//var product = 'Alias8'; 
var products = ['-','Brain','Ohm64','block','Code','-','-','OhmRGB','CNTRLR','BrainV2','-','Alias8','Base','BrainJR','+','GuitarWing','DS1','+'];
var leds = {};
leds.Base = {};
leds.Alias8 = {};
leds.CNTRLR = {};
leds.OhmRGB = {};
leds.Ohm64 = {};
//let's give the LEDs some names:
leds.Base.pad = [36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67]; //index bottom left to top right!
leds.Base.touch_center = [10,11,12,13,14,15,16,17]; //index left to right
leds.Base.touch_corner = [68,69,70,71,72,73,74,75]; //top touch buttons on base have a 2nd led in the corner
leds.Base.sidebtn_left = [18,19,20,21,22,23,24,25]; //right buttons have 2 leds each.
leds.Base.sidebtn_right = [26,27,28,29,30,31,32,33];
leds.Alias8.btn = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]; //index from top left to bottom right, in rows
leds.CNTRLR.grid = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]; //index from top left, go down in columns to bottom right.
leds.CNTRLR.rowbtn = [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47]; //index from top left to bottom right, in rows.
leds.CNTRLR.encbtn = [48,49,50,51,52,53,54,55,56,57,58,59];//index from top left to bottom right, in columns
leds.CNTRLR.encring = [100,101,102,103,104,105,106,107,108,109,110,111];//CC#s: index from top left to bottom right, in columns
leds.OhmRGB.grid = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] //index from top left, go down in columns to bottom right.
leds.OhmRGB.xfade = [64,72]; //left & right
leds.OhmRGB.sliderbtns = [65,73,66,74,67,75,68,76]; //index left to right
leds.OhmRGB.fbtns = [69,70,71,77,78,79];//index top left to bottom right,in rows
leds.OhmRGB.livid = [87];
leds.Ohm64.grid = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] //index from top left, go down in columns to bottom right.
leds.Ohm64.xfade = [64,72]; //left & right
leds.Ohm64.sliderbtns = [65,73,66,74,67,75,68,76]; //index left to right
leds.Ohm64.fbtns = [69,70,71,77,78,79];//index top left to bottom right,in rows
leds.Ohm64.livid = [87];
var color = {'white':1,'w':1,'cyan':4,'c':4,'mag':8,'magenta':8,'m':8,'red':16,'r':16,'blue':32,'b':32,'yellow':64,'yel':64,'y':64,'green':127,'g':127,'black':0,'off':0,'k':0};
var monochrome = false;

function clog(s){
  console.log(s+'\n');
}

function midiMessageReceived( ev ) {
  var cmd = ev.data[0] >> 4;
  var channel = ev.data[0] & 0xf;
  var noteNumber = ev.data[1];
  var velocity = ev.data[2];
  if(cmd>14){
  
    //handle sysex
    if(ev.data[5]===0 && ev.data[6]===1 && ev.data[7]===97){
     isLivid = true;
     var id = ev.data[10];
     product = products[id]; //turn product ID into a name like CNTRLR or Base
     if(product==='Ohm64' || product==='Code' || product==='block'){
      monochrome = true;
     }
     clog('LIVID CONTROLLER MODEL: '+product+' (id '+id+')');
    }
    
  } else {
    if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
      // note off
      noteOff( noteNumber );
    } else if (cmd == 9) {
      // note on
      noteOn( noteNumber, velocity/127.0);
    } else if (cmd == 11) {
      controller( noteNumber, velocity/127.0);
    } else if (cmd == 14) {
      // pitch wheel
      pitchWheel( ((velocity * 128.0 + noteNumber)-8192)/8192.0 );
    }
  } 
}

function testnote() {
  clog("test out note 2")
  var noteOnMessage = [0x90, 2, 0x7f];    // note on, full velocity
  midiOut.send( noteOnMessage );  //omitting the timestamp means send immediately.
  midiOut.send( [0x80, 2, 0x40], window.performance.now() + 4000.0 ); // Inlined array creation- note off, 
                                                                      // release velocity = 64, timestamp = now + 4 secs.
}

var isLivid = false;
var selectMIDI_in = null;
var selectMIDI_out = null;
var midi = null;
var midiIn = null;
var midiOut = null;
var outindex = 0;
var sysexEnabled = true; //should be able to get as attribute midi.sysexEnabled, but it didn't work!

function selectMIDIIn( ev ) {
  midiIn = midi.inputs()[selectMIDI_in.selectedIndex];
  midiIn.onmidimessage = midiMessageReceived;
  portInit('in');
}
function selectMIDIOut( ev ) {
  outindex = selectMIDI_out.selectedIndex;
  midiOut = midi.outputs()[outindex];
  portInit('out');
}

function portInit(p){
  var portname = '';
  if(p==='out'){
    portname = selectMIDI_out.options[outindex].text;
    clog('OUT port: '+portname);
    testnote();
    if(sysexEnabled){
      clog('sysex enabled, sending inquire')
      midiOut.send(inquire);
    }
  } else {
    portname = selectMIDI_in.options[selectMIDI_in.selectedIndex].text;
    clog('IN port: '+portname);
  }
}

function onMIDIStarted( midiAccess ) {
  clog('start midi!');
  var preferredIndex = -1;
  var list = [];
  var str = '';
  midi = midiAccess;
  selectMIDI_in=document.getElementById('midiIn');
  list=midi.inputs();
  // clear the MIDI input select
  selectMIDI_in.options.length = 0;
  //fill it up
  for (var i=0; (i<list.length)&&(preferredIndex==-1); i++) {
    //look for the word "Controls" - Livid controllers usually have this in the name:
    str=list[i].name.toString();
    if ((str.indexOf('Controls') != -1))
      preferredIndex=i;
      clog('preferred @ index '+preferredIndex);
  }
  if (preferredIndex==-1)
    preferredIndex = 0;
  if (list.length) {
    //fill up DOM:
    for (var i=0; i<list.length; i++) {
      selectMIDI_in.appendChild(new Option(list[i].name,list[i].fingerprint,i==preferredIndex,i==preferredIndex));
    }
    //select the preferred controller:
    midiIn = list[preferredIndex];
    portInit('in');
    //latch some functions:
    midiIn.onmidimessage = midiMessageReceived;
    selectMIDI_in.onchange = selectMIDIIn;
  }
  
  //do the same for midi out ports
  selectMIDI_out=document.getElementById('midiOut');
  list=midi.outputs();

  // clear the MIDI input select
  selectMIDI_out.options.length = 0;

  for (var i=0; (i<list.length)&&(preferredIndex==-1); i++) {
    str=list[i].name.toString();
    if ((str.indexOf('Controls') != -1))
      preferredIndex=i;
  }
  if (preferredIndex==-1)
    preferredIndex=0;

  if (list.length) {
    for (var i=0; i<list.length; i++) {
      selectMIDI_out.appendChild(new Option(list[i].name,list[i].fingerprint,i==preferredIndex,i==preferredIndex));
    }
    //select preferred port:
    midiOut = list[preferredIndex];
    portInit('out');
    //latch a fcn:
    selectMIDI_out.onchange = selectMIDIOut;
  }
}

//use time to blink
function light(nn,c,time,offcolor){
  var notemsg = [0x90+CH, nn, color[c]];
  if(monochrome){
    notemsg[2] = 127;
  }
  if(time){
    //clog('blink light '+nn+' '+c+' '+color[c]+' time '+time);
    midiOut.send( notemsg );  //omitting the timestamp means send immediately.
    notemsg[2] = color[offcolor]; //change velocity to off color
    if(monochrome){
      notemsg[2] = 0;
    }
    midiOut.send( notemsg, window.performance.now() + time ); //note off
  }else{
    //clog('solid light '+nn+' '+c+' '+color[c]);
    midiOut.send( notemsg );
  }
}
function ring(cc,value){
  clog('ring '+cc+' '+value);
   midiOut.send( [0xB0+CH, cc, value] );
}

function onMIDISystemError( err ) {
  document.getElementById('synthbox').className = 'error';
  console.log( 'MIDI not initialized - error encountered:' + err.code );
}

//init: start up MIDI
window.addEventListener('load', function() {   
  if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess( { sysex: true } ).then( onMIDIStarted, onMIDISystemError );
    //navigator.requestMIDIAccess(  ).then( onMIDIStarted, onMIDISystemError );
    //initseq();
  }

});