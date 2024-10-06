import p5 from "p5";
import P5Element from "./P5Element";

export default class InOut extends P5Element {
  width: number;
  height: number;

  constructor(p: p5, position: p5.Vector, width: number, height: number) {
    super(p, position);
    this.width = width;
    this.height = height;
  }

  randomPoint() {
    return this.p.createVector(
      this.position.x + Math.random() * this.width,
      this.position.y + Math.random() * this.height
    );
  }

  /**
   * Used for debug
   */
  show() {
    this.p.fill(255, 0, 0);
    this.p.rect(this.position.x, this.position.y, this.width, this.height);
  }
}
