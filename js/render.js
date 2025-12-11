export function drawScene(ctx, cam, bodies) {
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(
        cam.scale, 0,
        0, cam.scale,
        cam.x * cam.scale,
        cam.y * cam.scale
    );

    for (const b of bodies) {
        ctx.beginPath();
        ctx.fillStyle = b.color;
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
