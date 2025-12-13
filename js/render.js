export function drawScene(context, cam, bodies) {
    const canvas = context.canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.setTransform(
        cam.scale, 0,
        0, cam.scale,
        cam.x * cam.scale,
        cam.y * cam.scale
    );

    for (const b of bodies) {
        context.beginPath();
        context.fillStyle = b.color;
        context.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        context.fill();
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
}
