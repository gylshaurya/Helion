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
    if (!b.image.complete) continue;

    const half = b.size / 2;
    context.drawImage(
      b.image,
      b.x - half,
      b.y - half,
      b.size,
      b.size
    );
  }

    context.setTransform(1, 0, 0, 1, 0, 0);
}
