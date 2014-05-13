# MIDI IN and OUT

This page is a simple example of getting MIDI input and output from and to a controller using the [Web MIDI API](http://webaudio.github.io/web-midi-api/). This example is designed around the [Livid Controllers](http://www.lividinstruments.com) Base, Alias8, and CNTRL:R.

At the time of this writing, Chrome Canary and Chrome Stable (33) have the only such implementation. 

You may want to visit [the wiki](http://wiki.lividinstruments.com) that has technical data for Livid Controllers.
There is also a chart of sysex messages in a [Google spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AsBJ5GihAJNadDZNb3pWT3hJU0ZURDdLNDFMdndnY0E&usp=drive_web#gid=0)

The Web MIDI flag must also be enabled via chrome://flags/#enable-web-midi

Make sure your Chrome is up to date via chrome://chrome/

Adapted from Chris Wilson's examples:

[Drum Machine](http://webaudiodemos.appspot.com/MIDIDrums/index.html)

[MIDI Synth](http://webaudiodemos.appspot.com/midi-synth/index.html)
