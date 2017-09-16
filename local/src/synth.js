obtain(['µ/utilities.js'], (utils)=> {

  var audio = new window.AudioContext();
  exports.audioCtx = audio;

  exports.real = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0]);
  exports.imag = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0]);

  var hCont = [0, 0, 0, 0, 0, 0];

  var attackTime = .1;
  var decayTime = 3;

  exports.setRealPortion = (ind, val)=> {
    real[ind] = val;
  };

  exports.setImaginaryPortion = (ind, val)=> {
    imag[ind] = val;
  };

  var synth = function() {
    var _this = this;
    this.notes = [];

    this.setAttack = (time)=> {
      attackTime = time;
    };

    this.setDecay = (time)=> {
      decayTime = time;
    };

    this.regenWaveform = ()=> {
      var wave = audio.createPeriodicWave(exports.real, exports.imag);
      for (let i = 0; i < 32; i++) {
        this.notes[i].osc.setPeriodicWave(wave);
      }
    };

    for (let i = 0; i < 32; i++) {
      let note = { osc: audio.createOscillator(), gain: audio.createGain(), key: i };

      note.osc.connect(note.gain);
      note.gain.connect(audio.destination);
      note.osc.start(0);
      note.gain.gain.value = 0;
      note.osc.frequency.value = 0;
      note.attack = (vel)=> {
        console.log(vel);
        let now = audio.currentTime;
        note.gain.gain.cancelScheduledValues(now);
        note.gain.gain.linearRampToValueAtTime(vel, now + attackTime);
      };

      note.decay = (vel)=> {
        let now = audio.currentTime;
        note.gain.gain.linearRampToValueAtTime(0, now + decayTime);
      };

      note.set = (midiNum)=> {
        note.osc.frequency.value = 523.251 * Math.pow(2.0, (midiNum - 60) / 12);
      };

      _this.notes.push(note);
    }
  };

  var harmonic = function() {
    var _this = this;
    _this.connectedNote = null;
    _this.stopped = false;
    _this.order = [];
    _this.disconnectTimer = null;
    for (let j = 0; j < 6; j++) {
      _this.order[j] = { osc: audio.createOscillator(), gain: audio.createGain() };
      _this.order[j].osc.connect(_this.order[j].gain);
      _this.order[j].osc.start(0);
    }

    _this.disconnect = (cb)=> {
      _this.disconnectTimer = setTimeout(()=> {
        for (let j = 0; j < 6; j++) {
          _this.order[j].gain.disconnect();
        }

        cb();
      }, decayTime * 1000);
    };

    _this.setHarmonics = (note)=> {
      var primary = note.osc.frequency.value;
      if (_this.disconnectTimer) clearTimeout(_this.disconnectTimer);
      for (let j = 0; j < 6; j++) {
        _this.order[j].osc.frequency.setValueAtTime(primary * (j + 1), audio.currentTime);
        _this.order[j].gain.gain.value = hCont[j];
        _this.order[j].gain.connect(note.gain);
      }

      _this.connectedNote = note;
    };
  };

  var Harmonics = function() {
    var _this = this;
    var harmonics = [];
    for (let i = 0; i < 5; i++) {
      harmonics[i] = new harmonic();
    }

    var used = [];

    this.setLevel = (ind, val)=> {
      hCont[ind] = val;
      for (let i = 0; i < harmonics.length; i++) {
        harmonics[i].order[ind].gain.gain.value = val;
      }
    };

    this.set = (note)=> {
      let ind = used.indexOf(note.key);
      if (ind < 0 && used.length < harmonics.length) {
        let next = used.length;
        console.log('Turning on harmonics ' + note.key);
        used.push(note.key);
        harmonics[next].setHarmonics(note);
      }
    };

    this.release = (note)=> {
      let ind = used.indexOf(note.key);
      if (ind >= 0) {
        harmonics[ind].disconnect(()=> {
          used.splice(ind, 1);
          console.log('Turned off harmonics ' + note.key);
        });
      }
    };
  };

  exports.synth = new synth();

  exports.harmonics = new Harmonics();

  provide(exports);
});
