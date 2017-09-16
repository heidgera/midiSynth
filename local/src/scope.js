obtain(['µ/utilities.js'], (utils)=> {

  exports.scope = function(analyser, elem) {

    this.data = new Uint8Array(analyser.frequencyBinCount);
    this.width = elem.width;
    this.height = elem.height;

    var ctx = elem.getContext('2d');

    var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

    function findFirstPositiveZeroCrossing(buf, buflen) {
      var i = 0;
      var lastZero = -1;
      var t;

      // advance until we're zero or negative
      while (i < buflen && (buf[i] > 128))
        i++;

      if (i >= buflen)
        return 0;

      // advance until we're above MINVAL, keeping track of last zero.
      while (i < buflen && ((t = buf[i]) < MINVAL)) {
        if (t >= 128) {
          if (lastZero == -1)
            lastZero = i;
        } else
          lastZero = -1;
        i++;
      }

      // we may have jumped over MINVAL in one sample.
      if (lastZero == -1)
        lastZero = i;

      if (i == buflen)  // We didn't find any positive zero crossings
        return 0;

      // The first sample might be a zero.  If so, return it.
      if (lastZero == 0)
        return 0;

      return lastZero;
    }

    this.draw = ()=> {
      //console.log('draw');
      var data = this.data;
      var quarterHeight = this.height / 4;
      var scaling = this.height / 256;

      analyser.getByteTimeDomainData(data);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#004737';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.width, 0);
      ctx.stroke();
      ctx.moveTo(0, this.height);
      ctx.lineTo(this.width, this.height);
      ctx.stroke();
      ctx.save();
      ctx.strokeStyle = '#006644';
      ctx.beginPath();
      if (ctx.setLineDash)
        ctx.setLineDash([5]);
      ctx.moveTo(0, quarterHeight);
      ctx.lineTo(this.width, quarterHeight);
      ctx.stroke();
      ctx.moveTo(0, quarterHeight * 3);
      ctx.lineTo(this.width, quarterHeight * 3);
      ctx.stroke();

      ctx.restore();
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.moveTo(0, quarterHeight * 2);
      ctx.lineTo(this.width, quarterHeight * 2);
      ctx.stroke();

      ctx.strokeStyle = 'white';

      ctx.beginPath();

      var zeroCross = findFirstPositiveZeroCrossing(data, this.width);

      ctx.moveTo(0, (256 - data[zeroCross]) * scaling);
      for (var i = zeroCross, j = 0; (j < this.width) && (i < data.length); i++, j++)
        ctx.lineTo(j, (256 - data[i]) * scaling);

      ctx.stroke();
    };
  };

  provide(exports);
});
