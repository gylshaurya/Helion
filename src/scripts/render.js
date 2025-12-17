const FORCE_SCALE = 50;
const VELOCITY_SCALE = 10;

export function drawScene(context, cam, bodies, options) {
    const { showTrails, showVelocity, showForce } = options;

    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.setTransform(
        cam.scale, 0,
        0, cam.scale,
        cam.x * cam.scale,
        cam.y * cam.scale
    );

    // ================== TRAILS =======================
    if (showTrails) {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.setLineDash([6, 6]);

        for (const b of bodies) {
            if (!b.trail || b.trail.length < 2) continue;

            context.beginPath();
            context.moveTo(b.trail[0].x, b.trail[0].y);
            for (let i = 1; i < b.trail.length; i++) {
                context.lineTo(b.trail[i].x, b.trail[i].y);
            }
            context.stroke();
        }

        context.setLineDash([]);
    }

    // ================== VECTORS ========================
    for (const b of bodies) {
        if (showForce) {
            drawArrow(context, b.x, b.y, b.force.x * FORCE_SCALE, b.force.y * FORCE_SCALE, 'red');
        }
        if (showVelocity) {
            drawArrow(context, b.x, b.y, b.vx * VELOCITY_SCALE, b.vy * VELOCITY_SCALE, 'cyan');
        }
    }

    // ================== BODIES =========================
    for (const b of bodies) {
        if (!b.image.complete) continue;
        const half = b.size / 2;
        context.drawImage(b.image, b.x - half, b.y - half, b.size, b.size);
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
}

function drawArrow(ctx, x, y, vx, vy, color) {
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len < 0.0001) return;

    const nx = vx / len;
    const ny = vy / len;
    const headSize = 6 / ctx.getTransform().a;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + vx, y + vy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + vx, y + vy);
    ctx.lineTo(
        x + vx - nx * headSize - ny * headSize * 0.5,
        y + vy - ny * headSize + nx * headSize * 0.5
    );
    ctx.lineTo(
        x + vx - nx * headSize + ny * headSize * 0.5,
        y + vy - ny * headSize - nx * headSize * 0.5
    );
    ctx.closePath();
    ctx.fill();
}
