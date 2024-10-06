import p5 from "p5";

export default class P5Element {
  protected p: p5;
  position: p5.Vector;

  constructor(p: p5, position: p5.Vector) {
    this.p = p;
    this.position = position;
  }

  update() {}

  show() {}
}
