import p5 from "p5";
import P5AnimatedElement from "./P5AnimatedElement";
import Wigle from "@/types/Wigle";

export default class WigleElement extends P5AnimatedElement {
  wigle: Wigle;

  constructor(
    p: p5,
    position: p5.Vector,
    velocity: p5.Vector,
    acceleration: p5.Vector,
    wigle: Wigle
  ) {
    super(p, position, velocity, acceleration);
    this.wigle = wigle;
  }

  update() {}

  show() {
    const x = this.p.random(this.p.width);
    const y = this.p.random(this.p.height);
    this.p.ellipse(x, y, 10, 10);
    this.p.text(this.wigle.ssid!, x, y + 5);
  }
}
