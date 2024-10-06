import p5 from "p5";
import P5AnimatedElement from "./P5AnimatedElement";
import Set from "./Set";

export default class Person extends P5AnimatedElement {
  private target: p5.Vector;

  private noiseOffsetX: number;
  private noiseOffsetY: number;

  private maxForce: number;
  private maxSpeed: number;

  private sets: Set[];

  constructor(p: p5, start: p5.Vector, end: p5.Vector, sets: Set[]) {
    super(p, start.copy(), p.createVector(0, 0), p.createVector(0, 0));

    this.target = end.copy();
    this.noiseOffsetX = p.random(1000);
    this.noiseOffsetY = p.random(1000);

    this.maxForce = 0.1;
    this.maxSpeed = 2;

    this.sets = sets;

    this.p.randomSeed(this.noiseOffsetX);
  }

  applyForce(force: p5.Vector) {
    this.acceleration.add(force);
  }

  avoid(sets: Set[]) {
    sets.forEach((set) => {
      const futurePos = this.p.createVector(
        this.position.x + this.velocity.x * 10,
        this.position.y + this.velocity.y * 10
      );

      if (set.contains(futurePos)) {
        const desired = this.p.createVector();

        if (this.position.x < set.position.x) {
          desired.add(-this.maxSpeed, 0);
        } else if (this.position.x > set.position.x + set.width) {
          desired.add(this.maxSpeed, 0);
        }

        if (this.position.y < set.position.y) {
          desired.add(0, -this.maxSpeed);
        } else if (this.position.y > set.position.y + set.height) {
          desired.add(0, this.maxSpeed);
        }

        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        this.applyForce(steer.mult(5));
      }
    });
  }

  override update() {
    const noiseX = this.p.map(this.p.noise(this.noiseOffsetX), 0, 1, -1, 1);
    const noiseY = this.p.map(this.p.noise(this.noiseOffsetY), 0, 1, -1, 1);

    const desired = p5.Vector.sub(this.target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);

    desired.add(noiseX * 0.8, noiseY * 0.8);

    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);

    this.avoid(this.sets);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;
  }

  show() {
    this.p.fill(255);
    this.p.ellipse(this.position.x, this.position.y, 5, 5);
  }

  arrived() {
    return (
      this.p.dist(
        this.position.x,
        this.position.y,
        this.target.x,
        this.target.y
      ) < 5
    );
  }
}
