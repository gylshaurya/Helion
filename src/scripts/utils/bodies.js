export class Body {
  constructor({ x, y, vx, vy, mass, size, image, color = '#ffffff', angle = 0, angularVelocity = 0}) {
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

    this.angle = angle;
    this.angularVelocity = angularVelocity;
    this.torque = 0;
    this.inertia = 0.5 * this.mass * (this.size / 2) ** 2;

    this.isEscaping = false;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}
