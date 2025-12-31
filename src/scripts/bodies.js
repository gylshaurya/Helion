export class Body {
  constructor({ x, y, vx, vy, mass, size, image, color = '#ffffff' }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
    this.size = size;
    this.image = image;
    this.color = color;

    this.force = { x: 0, y: 0 };
    this.trail = [];
    this.selected = false;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}
