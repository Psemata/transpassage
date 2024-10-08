import p5 from "p5";
import P5Element from "./P5Element";
import Wigle from "@/types/Wigle";

export default class Gsm extends P5Element {
  wigle: Wigle;

  constructor(p: p5, position: p5.Vector, wigle: Wigle) {
    super(p, position);
    this.wigle = wigle;
  }

  update() {}

  show() {
    this.p.push();

    this.p.translate(this.p.width / 2, this.p.height / 2);

    this.p.fill(0, 255);
    this.p.noStroke();
    this.p.ellipse(this.position.x, this.position.y, 200, 200);

    this.p.pop();
  }
}
