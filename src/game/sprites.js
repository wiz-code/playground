const { sin, cos, floor, PI } = Math;

const sprites = {
  sightLines(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.rect(4, 56, 1, 16);
    context.rect(16, 56, 1, 16);
    context.rect(28, 56, 1, 16);

    context.rect(99, 56, 1, 16);
    context.rect(111, 56, 1, 16);
    context.rect(123, 56, 1, 16);
    context.fill();

    return context;
  },

  verticalFrame(context) {
    const { canvas } = context;
    canvas.width = 256;
    canvas.height = 256;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(0, 36);
    context.lineTo(3, 36);
    context.lineTo(3, 38);
    context.lineTo(1, 38);
    context.lineTo(1, 218);
    context.lineTo(3, 218);
    context.lineTo(3, 220);
    context.lineTo(0, 220);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(256, 36);
    context.lineTo(253, 36);
    context.lineTo(253, 38);
    context.lineTo(255, 38);
    context.lineTo(255, 218);
    context.lineTo(253, 218);
    context.lineTo(253, 220);
    context.lineTo(256, 220);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(7, 124);
    context.lineTo(7, 132);
    context.lineTo(3, 128);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(249, 124);
    context.lineTo(249, 132);
    context.lineTo(253, 128);
    context.closePath();
    context.fill();

    return context;
  },

  verticalIndicator(context) {
    const { canvas } = context;
    canvas.width = 256;
    canvas.height = 256;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(7, 124);
    context.lineTo(7, 132);
    context.lineTo(3, 128);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(249, 124);
    context.lineTo(249, 132);
    context.lineTo(253, 128);
    context.closePath();
    context.fill();

    return context;
  },

  crossStar(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(56, 0);
    context.lineTo(72, 0);
    context.lineTo(72, 56);
    context.lineTo(128, 56);
    context.lineTo(128, 72);
    context.lineTo(72, 72);
    context.lineTo(72, 128);
    context.lineTo(56, 128);
    context.lineTo(56, 72);
    context.lineTo(0, 72);
    context.lineTo(0, 56);
    context.lineTo(56, 56);
    context.closePath();
    context.fill();

    return context;
  },

  crossStarThick(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(48, 0);
    context.lineTo(80, 0);
    context.lineTo(80, 48);
    context.lineTo(128, 48);
    context.lineTo(128, 80);
    context.lineTo(80, 80);
    context.lineTo(80, 128);
    context.lineTo(48, 128);
    context.lineTo(48, 80);
    context.lineTo(0, 80);
    context.lineTo(0, 48);
    context.lineTo(48, 48);
    context.closePath();
    context.fill();

    return context;
  },

  crossStarThin(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(60, 0);
    context.lineTo(68, 0);
    context.lineTo(68, 60);
    context.lineTo(128, 60);
    context.lineTo(128, 68);
    context.lineTo(68, 68);
    context.lineTo(68, 128);
    context.lineTo(60, 128);
    context.lineTo(60, 68);
    context.lineTo(0, 68);
    context.lineTo(0, 60);
    context.lineTo(60, 60);
    context.closePath();
    context.fill();

    return context;
  },

  sight(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFF';
    context.translate(64, 64);
    context.rotate(PI * 0.25);
    context.beginPath();
    context.arc(0, 0, 4, 0, 2 * PI);

    for (let i = 0; i < 4; i += 1) {
      context.moveTo(-2, -62);
      context.arc(0, -62, 2, PI, 0, false);
      context.lineTo(2, -24);
      context.arc(0, -24, 2, 0, PI, false);
      context.lineTo(-2, -62);

      context.rotate(PI * 0.5);
    }

    context.closePath();
    context.fill();

    return context;
  },

  triangle(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.lineWidth = 8;
    context.miterLimit = 20;
    context.strokeStyle = '#FFF';
    context.beginPath();
    context.moveTo(64, 16);
    context.lineTo(119, 112);
    context.lineTo(9, 112);
    context.lineTo(64, 16);
    context.closePath();

    context.stroke();

    return context;
  },

  isoscelesTriangle(context, rotation = 0, fill = false) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);

    context.translate(64, 64);
    context.rotate(rotation);
    context.lineWidth = 6;
    context.miterLimit = 20;
    context.strokeStyle = '#FFF';
    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(55, 48);
    context.lineTo(-55, 48);
    context.closePath();

    if (fill) {
      context.fill();
    } else {
      context.stroke();
    }

    return context;
  },

  direction(context) {
    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);
    context.lineCap = 'butt';
    context.miterLimit = 20;

    context.shadowColor = '#FFF';
    context.shadowOffsetY = 0;
    context.shadowBlur = 8;

    context.fillStyle = '#FFF';
    context.beginPath();
    context.moveTo(0, 20);
    context.bezierCurveTo(44, 4, 84, 4, 128, 20);
    context.moveTo(128, 20);
    context.bezierCurveTo(84, 8, 44, 8, 0, 20);
    context.fill();

    context.beginPath();
    context.moveTo(61, 10);
    context.lineTo(67, 10);
    context.lineTo(64, 18);
    context.closePath();
    context.fill();

    return context;
  },

  centerGauge(context) {
    const len = 13;
    const r1 = 176;
    const r2 = 166;
    const range = (30 / 360) * PI * 2;
    const rad = range / (len - 1);
    const start = 0.75 * PI * 2 - range / 2;
    const midIndex = floor(len / 2);

    const { canvas } = context;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 128, 128);

    context.miterLimit = 20;
    context.strokeStyle = '#FFF';

    const cx = 64;
    const cy = 204;

    for (let i = 0; i < len; i += 1) {
      const theta = start + rad * i;
      let r0 = 0;

      if (i === midIndex) {
        context.lineWidth = 3;
        r0 = 6;
      } else if (i === 0 || i === len - 1) {
        context.lineWidth = 2;
        r0 = 6;
      } else {
        context.lineWidth = 2;
      }

      const x1 = cx + (r1 + r0) * cos(theta);
      const y1 = cy + (r1 + r0) * sin(theta);

      const x2 = cx + r2 * cos(theta);
      const y2 = cy + r2 * sin(theta);

      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);

      context.stroke();
    }

    return context;
  },
};

export default sprites;
