export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
    }

    screenToWorld(sx, sy) {
        return {
            x: (sx / this.scale) - this.x,
            y: (sy / this.scale) - this.y
        };
    }


    zoomAt(factor, sx, sy) {
        const before = this.screenToWorld(sx, sy);
        this.scale *= factor;
        const after = this.screenToWorld(sx, sy);

        this.x += before.x - after.x;
        this.y += before.y - after.y;
    }
}
