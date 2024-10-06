import p5 from "p5";
import P5Element from "./P5Element";

export default class Set extends P5Element {
  width: number;
  height: number;

  constructor(p: p5, position: p5.Vector, width: number, height: number) {
    super(p, position);
    this.width = width;
    this.height = height;
  }

  update() {}

  show() {
    this.p.fill(0);
    this.p.rect(this.position.x, this.position.y, this.width, this.height);
  }

  contains(point: p5.Vector) {
    return (
      point.x > this.position.x &&
      point.x < this.position.x + this.width &&
      point.y > this.position.y &&
      point.y < this.position.y + this.height
    );
  }
}
