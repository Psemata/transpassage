import Wigle from "@/types/Wigle";
import p5 from "p5";
import Out from "./Out";
import P5AnimatedElement from "./P5AnimatedElement";

export default class WigleElement extends P5AnimatedElement {
  wigle: Wigle | null;

  outs: Out[];

  target: p5.Vector;

  waitingTime: number;
  isWaiting: boolean;
  waitCounter: number;

  isTransformed: boolean;
  transformationCounter: number;

  noiseOffsetX: number;
  noiseOffsetY: number;

  lastCollisionTime: number;

  constructor(
    p: p5,
    position: p5.Vector,
    velocity: p5.Vector,
    acceleration: p5.Vector,
    outs: Out[]
  ) {
    super(p, position, velocity, acceleration);

    // At first the wigle is null and set later on if the element is "detected"
    this.wigle = null;

    // The possible exits
    this.outs = outs;

    // Chosen exit
    this.target = this.p.random(this.outs).randomPoint();

    // Noise added to the moving
    this.noiseOffsetX = this.p.random(this.p.random(5000));
    this.noiseOffsetY = this.p.random(this.p.random(5000));

    // The waiting parameters
    this.waitingTime = this.p.random(3);
    this.isWaiting = false;
    this.waitCounter = 0;

    // The transformation parameters
    this.isTransformed = false;
    this.transformationCounter = 0;

    this.lastCollisionTime = 0;

    // Base position
    this.position.x = this.p.random(-this.p.width / 2, this.p.width / 2);
    this.position.y = this.p.random(-this.p.height / 2, this.p.height / 2);
  }

  update() {
    // The element is transformed
    if (this.isTransformed) {
      this.transformationCounter += 1 / this.p.frameRate();
      if (this.transformationCounter >= 1) {
        this.isTransformed = false;
        this.transformationCounter = 0;
        this.wigle = null;
      }
    }

    // The element is waiting to move
    if (this.isWaiting) {
      this.waitCounter += 1 / this.p.frameRate();

      if (this.waitCounter >= this.waitingTime) {
        this.isWaiting = false;
        this.waitCounter = 0;
      }

      return;
    }

    // Random to chose if an element is going to pause or move
    if (this.p.random(1) < 0.005) {
      this.isWaiting = true;
      return;
    }

    // If the transformed point is a wifi, it doesn't move
    if (this.wigle && this.wigle.type == "WIFI") {
      return;
    }

    // Movement of the element
    const noiseX = this.p.map(this.p.noise(this.noiseOffsetX), 0, 1, -1, 1);
    const noiseY = this.p.map(this.p.noise(this.noiseOffsetY), 0, 1, -1, 1);

    const dir = p5.Vector.sub(this.target, this.position);
    dir.normalize();
    dir.mult(0.2);
    dir.add(noiseX * 0.4, noiseY * 0.4);
    this.acceleration = dir;

    const distanceToCenter = this.position.mag();
    const centerRadius = 110;
    const repulsionRange = 20;
    if (distanceToCenter < centerRadius + repulsionRange) {
      const repulsionForce = this.position.copy().normalize();
      repulsionForce.mult(
        0.1 * (1 - (distanceToCenter - centerRadius) / repulsionRange)
      );
      this.acceleration.add(repulsionForce);
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(0.6);

    // Calculate the next position
    const nextPosition = p5.Vector.add(this.position, this.velocity);
    const nextDistanceToCenter = nextPosition.mag();

    if (nextDistanceToCenter < centerRadius) {
      const normal = nextPosition.copy().normalize();
      const dotProduct = p5.Vector.dot(this.velocity, normal);
      const reflection = p5.Vector.sub(
        this.velocity,
        normal.copy().mult(2 * dotProduct)
      );

      // Ajouter une légère perturbation à la réflexion
      reflection.rotate(this.p.random(-0.1, 0.1));

      this.velocity = reflection;
      this.position = normal.mult(centerRadius + 1);

      // Ajouter un délai entre les collisions pour éviter les rebonds rapides
      const currentTime = this.p.millis();
      if (currentTime - this.lastCollisionTime > 500) {
        this.lastCollisionTime = currentTime;
        this.changeDir(); // Changer de direction après une collision
      }
    } else {
      this.position.add(this.velocity);
    }

    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;
  }

  show() {
    // Display the element
    this.p.push();

    this.p.translate(this.p.width / 2, this.p.height / 2);

    if (this.isTransformed && this.wigle) {
      if (this.wigle.type == "WIFI") {
        this.showWIFI();
      } else if (this.wigle.type == "BT") {
        this.showBT();
      } else if (this.wigle.type == "BLE") {
        this.showBLE();
      }
      if (this.wigle.ssid) {
        this.showSSID();
      }
    } else {
      this.showBase();
    }

    this.p.pop();
  }

  showWIFI() {
    const size = this.p.map(this.wigle!.frequency, 0, 8000, 10, 30);
    this.p.fill(255, 0, 0, 180);
    // this.p.fill(0);
    this.p.stroke(255, 0, 0, 220);
    this.p.ellipse(this.position.x, this.position.y, size, size);
  }

  showBT() {
    const size = this.p.map(this.wigle!.frequency, 0, 8000, 10, 20);
    this.p.fill(0, 0, 255, 180);
    // this.p.fill(0);
    this.p.stroke(0, 0, 255, 220);
    this.p.rectMode(this.p.CENTER);
    this.p.rect(this.position.x, this.position.y, size, size);
  }

  showBLE() {
    this.p.fill(0, 255, 0, 180);
    // this.p.fill(0);
    this.p.stroke(0, 255, 0, 220);
    this.p.triangle(
      this.position.x,
      this.position.y,
      this.position.x + 10,
      this.position.y - 15,
      this.position.x + 15,
      this.position.y
    );
  }

  showSSID() {
    this.p.noStroke();
    this.p.fill(255);
    this.p.textSize(18);
    this.p.text(this.wigle!.ssid!, this.position.x + 15, this.position.y + 5);
  }

  showBase() {
    this.p.fill(255, 90);
    this.p.stroke(255, 100);
    this.p.ellipse(this.position.x, this.position.y, 10, 10);
  }

  // Set the wigle element
  setWigle(wigle: Wigle) {
    this.wigle = wigle;
    this.isTransformed = true;
    this.transformationCounter = 0;
  }

  // Change the direction of the element
  changeDir() {
    this.target = this.p.random(this.outs).randomPoint();
  }

  // If the element has arrived to its target
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
