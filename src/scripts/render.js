const FORCE_SCALE = 500;
const VELOCITY_SCALE = 10;

const WARNING_IMG = new Image();
WARNING_IMG.src = '../assets/warning-icon.png';

export function drawScene(ctx, cam, bodies, options) {
  const { showTrails, showVelocity, showForce, ghostBody } = options;
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(
    cam.scale, 0,
    0, cam.scale,
    cam.x * cam.scale,
    cam.y * cam.scale
  );

  // ===== TRAILS =====
  if (showTrails) {
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);

    for (const b of bodies) {
      const t = b.trail;
      if (t.length < 2) continue;

      let dashOffset = 0;

      for (let i = 1; i < t.length; i++) {
        const a = t[i - 1];
        const c = t[i];

        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const segLen = Math.hypot(dx, dy);

        if (b.isEscaping) {
          ctx.strokeStyle = `rgba(220,90,40,${i / t.length})`;
        } else {
          ctx.strokeStyle = `rgba(255,255,255,${i / t.length})`;
        }

        ctx.lineDashOffset = -dashOffset;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();

        dashOffset += segLen;
      }
    }

    ctx.setLineDash([]);
  }

  // ===== GHOST BODY =====
  if (ghostBody) {
    ctx.strokeStyle = ghostBody.color;
    ctx.beginPath();
    ctx.arc(ghostBody.x, ghostBody.y, ghostBody.size / 2, 0, Math.PI * 2);
    ctx.stroke();

    if (options.selectedBody && options.isEditingVelocity) {
      drawArrow(
        ctx,
        options.selectedBody.x,
        options.selectedBody.y,
        options.selectedBody.vx * 20,
        options.selectedBody.vy * 20,
        'white',
        b.size / 2
      );
    }

    drawArrow(
      ctx,
      ghostBody.x,
      ghostBody.y,
      ghostBody.vx * 20,
      ghostBody.vy * 20,
      'white',
      b.size / 2
    );
  }

  // ===== VECTORS =====
  for (const b of bodies) {
    if (showForce) {
      drawArrow(
        ctx,
        b.x,
        b.y,
        (b.force.x / b.mass) * FORCE_SCALE,
        (b.force.y / b.mass) * FORCE_SCALE,
        'red',
        b.size / 2
      );
    }

    if (showVelocity) {
      drawArrow(
        ctx,
        b.x,
        b.y,
        b.vx * VELOCITY_SCALE,
        b.vy * VELOCITY_SCALE,
        'cyan',
        b.size / 2
      );
    }
  }

  // ===== BODIES =====
  for (const b of bodies) {
    const r = b.size / 2;

    if (b.image) {
      if (!b.image.complete) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.drawImage(b.image, -r, -r, b.size, b.size);
      ctx.restore();
    } else {
      ctx.fillStyle = b.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (b === options.selectedBody) {
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2 / cam.scale;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r + 4 / cam.scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (b.isEscaping && WARNING_IMG.complete) {
      let offsetX = -b.size * 0.2;
      let offsetY = -b.size * 0.3;

      const size = 100;

      if (b === options.selectedBody) {
        WARNING_IMG.src = '../assets/warning.png';
      } else {
        WARNING_IMG.src = '../assets/warning-icon.png';
      }

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(
        WARNING_IMG,
        b.x + offsetX,
        b.y + offsetY,
        size,
        size
      );
      ctx.restore();
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawArrow(ctx, x, y, vx, vy, color, radius = 0) {
  const len = Math.hypot(vx, vy);
  if (len < 0.001) return;

  const nx = vx / len;
  const ny = vy / len;

  // 🔑 extend vector by radius
  const ex = vx + nx * radius;
  const ey = vy + ny * radius;

  const head = 6;

  const lineEndX = x + ex - nx * head;
  const lineEndY = y + ey - ny * head;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  // shaft
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(lineEndX, lineEndY);
  ctx.stroke();

  // arrow head
  ctx.beginPath();
  ctx.moveTo(x + ex, y + ey);
  ctx.lineTo(
    x + ex - nx * head - ny * head,
    y + ey - ny * head + nx * head
  );
  ctx.lineTo(
    x + ex - nx * head + ny * head,
    y + ey - ny * head - nx * head
  );
  ctx.closePath();
  ctx.fill();
}



