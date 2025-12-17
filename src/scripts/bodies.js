export class Body {
    constructor({
        x,
        y,
        vx,
        vy,
        mass,
        size,
        image
    }) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;
        this.size = size;
        this.image = image;

        this.trail = [];
        this.force = { x: 0, y: 0 };
    }
}
