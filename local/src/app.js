'use strict';

var obtains = ['µ/midi.js', './src/scope.js', './src/synth2.js']; //, 'µ/piFig/piFig.js'

obtain(obtains, (midi, scope, synth, piFig)=> {
  exports.app = {};

  var audio = synth.audioCtx;
  var Synth = synth.synth;
  var harmonics = synth.harmonics;

  var analyser = audio.createAnalyser();
  analyser.fftSize = 2048;

  var analyserNote = null;

  exports.app.start = ()=> {

    midi.in.onReady = ()=> {
      var newIn = null;
      midi.in.devices.forEach((el)=> {
        if (el.name.includes('Axiom') && !newIn) {
          newIn = el;
          console.log(el.name);
        }
      });
      midi.in.select(newIn);
    };

    midi.in.setNoteHandler((note, vel)=> {
      if (note >= 0 && note < 80) {
        vel = vel / 256;

        //notes[note - 48].set(note);
        if (vel) {
          var noteNode = Synth.set(note, vel);
          if (noteNode) {
            if (analyserNote) analyserNote.gain.disconnect(analyser);
            analyserNote = noteNode;
            analyserNote.gain.connect(analyser);
          }
        } else Synth.release(note);

        /*if (vel) {
          notes[note - 48].attack(vel);

          // analyser
          if (analyserNote) analyserNote.gain.disconnect(analyser);
          analyserNote = notes[note - 48];
          analyserNote.gain.connect(analyser);
        } else {
          notes[note - 48].decay();
        }*/
      }
    });
    midi.in.setControlHandler((note, vel)=> {
      if (note > 2) {
        /*if (note % 2) synth.real[(note + 1) / 2] = (vel) / 128.0;
        else synth.imag[(note) / 2] = (vel) / 128.0;*/
        synth.real[note - 1] = (vel) / 128.0;

        Synth.regenWaveform();

        //harmonics.setLevel(note - 3, vel / 128.);
      } else if (note == 1) Synth.setAttack((vel) / 128.0);
      else if (note == 2) Synth.setDecay(3 * (vel) / 128.0);
    });

    var oscScope = new scope.scope(analyser, µ('#scope'));

    function draw() {
      oscScope.draw();
      requestAnimationFrame(draw);
    }

    draw();

    document.onkeyup = (e)=> {
      var electron = require('electron');
      if (e.which == 27) {
        valves.allOff();
        electron.remote.process.exit();
      }
    };

    console.log('started');
  };

  provide(exports);
});
