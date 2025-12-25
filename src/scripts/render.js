const FORCE_SCALE = 400;
const VELOCITY_SCALE = 10;

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
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

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

        ctx.strokeStyle = `rgba(255,255,255,${i / t.length})`;
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
    'white'
  );
}

  drawArrow(
    ctx,
    ghostBody.x,
    ghostBody.y,
    ghostBody.vx * 20,
    ghostBody.vy * 20,
    'white'
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
  'red'
);


    }
    if (showVelocity) {
      drawArrow(ctx, b.x, b.y, b.vx * VELOCITY_SCALE, b.vy * VELOCITY_SCALE, 'cyan');
    }
  }

  // ===== ORBITS =====
  if (options.showOrbits) {
for (const b of bodies) {
  if (b === bodies[0]) continue; // skip sun

  const orbit = computeOrbitPoints(b, bodies[0]);

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1 / cam.scale;
  ctx.setLineDash([4 / cam.scale, 4 / cam.scale]);

  ctx.beginPath();
  ctx.moveTo(orbit[0].x, orbit[0].y);
  for (let i = 1; i < orbit.length; i++) {
    ctx.lineTo(orbit[i].x, orbit[i].y);
  }
  ctx.stroke();

  ctx.setLineDash([]);
}
  }


  // ===== BODIES =====
  for (const b of bodies) {
    const r = b.size / 2;

    if (b.image) {
        if (!b.image.complete) continue;
        ctx.drawImage(b.image, b.x - r, b.y - r, b.size, b.size);
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
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);

}

function drawArrow(ctx, x, y, vx, vy, color) {
  const len = Math.hypot(vx, vy);
  if (len < 0.001) return;

  const nx = vx / len;
  const ny = vy / len;
  const head = 6 / ctx.getTransform().a;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + vx, y + vy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + vx, y + vy);
  ctx.lineTo(x + vx - nx * head - ny * head * 0.5, y + vy - ny * head + nx * head * 0.5);
  ctx.lineTo(x + vx - nx * head + ny * head * 0.5, y + vy - ny * head - nx * head * 0.5);
  ctx.closePath();
  ctx.fill();
}

function computeOrbitPoints(body, center, steps = 400, dt = 0.02) {
  const points = [];

  let x = body.x;
  let y = body.y;
  let vx = body.vx;
  let vy = body.vy;

  for (let i = 0; i < steps; i++) {
    const dx = center.x - x;
    const dy = center.y - y;
    const r2 = dx * dx + dy * dy + 0.001;
    const r = Math.sqrt(r2);

    const accel = (0.5 * center.mass) / r2;
    const ax = accel * (dx / r);
    const ay = accel * (dy / r);

    vx += ax * dt;
    vy += ay * dt;

    x += vx * dt;
    y += vy * dt;

    points.push({ x, y });
  }

  return points;
}