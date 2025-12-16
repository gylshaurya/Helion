export function drawScene(context, cam, bodies) {
    const canvas = context.canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.setTransform(
        cam.scale, 0,
        0, cam.scale,
        cam.x * cam.scale,
        cam.y * cam.scale
    );

    // ---- DASHED TRAILS ----
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.setLineDash([6, 6]);

    for (const b of bodies) {
        if (!b.trail || b.trail.length < 2) continue;

        context.beginPath();
        context.moveTo(b.trail[0].x, b.trail[0].y);

        for (let i = 1; i < b.trail.length; i++) {
            const p = b.trail[i];
            context.lineTo(p.x, p.y);
        }

        context.stroke();
    }

    context.setLineDash([]);

    // ---- DRAW BODIES ----
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
