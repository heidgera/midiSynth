'use strict';

var obtains = ['µ/midi.js', './src/scope.js', './src/synth.js']; //, 'µ/piFig/piFig.js'

obtain(obtains, (midi, scope, synth, piFig)=> {
  exports.app = {};

  var audio = synth.audioCtx;
  var notes = synth.synth.notes;
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
      if (note >= 48 && note < 80) {
        vel = vel / 256;

        notes[note - 48].set(note);

        if (vel) {
          notes[note - 48].attack(vel);

          // analyser
          if (analyserNote) analyserNote.gain.disconnect(analyser);
          analyserNote = notes[note - 48];
          analyserNote.gain.connect(analyser);
        } else {
          notes[note - 48].decay();
        }
      }
    });
    midi.in.setControlHandler((note, vel)=> {
      if (note > 2) {
        /*if (note % 2) synth.real[(note + 1) / 2] = (vel) / 128.0;
        else synth.imag[(note) / 2] = (vel) / 128.0;*/
        synth.real[note - 1] = (vel) / 128.0;

        synth.synth.regenWaveform();

        //harmonics.setLevel(note - 3, vel / 128.);
      } else if (note == 1) synth.synth.setAttack((vel) / 128.0);
      else if (note == 2) synth.synth.setDecay(3 * (vel) / 128.0);
    });

    /*var oscScope = new scope.scope(analyser, µ('#scope'));

    function draw() {
      oscScope.draw();
      requestAnimationFrame(draw);
    }

    draw();*/

    console.log('started');
  };

  provide(exports);
});
