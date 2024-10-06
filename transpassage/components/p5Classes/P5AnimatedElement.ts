import p5 from "p5";
import P5Element from "./P5Element";

export default class P5AnimatedElement extends P5Element {
  velocity: p5.Vector;
  acceleration: p5.Vector;

  constructor(
    p: p5,
    position: p5.Vector,
    velocity: p5.Vector,
    acceleration: p5.Vector
  ) {
    super(p, position);
    this.velocity = velocity;
    this.acceleration = acceleration;
  }

  update() {}

  show() {}
}
