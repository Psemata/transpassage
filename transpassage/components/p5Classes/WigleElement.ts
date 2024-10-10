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

  avoidanceRadius: number;
  avoidancePoints: p5.Vector[];

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
    this.waitingTime = this.p.random(1);
    this.isWaiting = false;
    this.waitCounter = 0;

    // The transformation parameters
    this.isTransformed = false;
    this.transformationCounter = 0;

    this.lastCollisionTime = 0;

    this.avoidanceRadius = 90;
    this.avoidancePoints = [this.p.createVector(0, 0)];

    // Base position
    this.position.x = this.p.random(-this.p.width / 2, this.p.width / 2);
    this.position.y = this.p.random(-this.p.height / 2, this.p.height / 2);
  }

  update() {
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

    // Movement of the element
    const noiseX = this.p.map(this.p.noise(this.noiseOffsetX), 0, 1, -1, 1);
    const noiseY = this.p.map(this.p.noise(this.noiseOffsetY), 0, 1, -1, 1);

    const dir = p5.Vector.sub(this.target, this.position);
    dir.normalize();
    dir.mult(0.2);
    dir.add(noiseX * 0.3, noiseY * 0.3);
    this.acceleration = dir;

    // Add repuslive forces when the element is in a "forbidden" space
    this.addRepulsionForces();

    this.velocity.add(this.acceleration);
    this.velocity.limit(1);

    const nextPosition = p5.Vector.add(this.position, this.velocity);

    if (this.checkCollision(nextPosition)) {
      this.handleCollision();
    } else {
      this.position.add(this.velocity);
    }

    this.position.add(this.velocity);

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
    }

    this.showBase();

    this.p.pop();
  }

  showWIFI() {
    this.p.noFill();
    this.p.stroke(255, 0, 0, 220);
    this.p.strokeWeight(2);

    // Dessiner les arcs circulaires autour de la position actuelle
    const arcRadius = 40;
    this.p.arc(
      this.position.x,
      this.position.y,
      arcRadius,
      arcRadius,
      0.2,
      this.p.PI - 0.2
    );
    this.p.arc(
      this.position.x,
      this.position.y,
      arcRadius,
      arcRadius,
      this.p.PI + 0.2,
      this.p.TWO_PI - 0.2
    );

    const secondRadius = 50;
    this.p.arc(
      this.position.x,
      this.position.y,
      secondRadius,
      secondRadius,
      this.p.HALF_PI * 3 + 0.2,
      this.p.HALF_PI - 0.2
    );
    this.p.arc(
      this.position.x,
      this.position.y,
      secondRadius,
      secondRadius,
      this.p.HALF_PI + 0.2,
      this.p.HALF_PI * 3 - 0.2
    );

    this.showText();
  }

  showBT() {
    this.p.noFill();
    this.p.strokeWeight(2);
    this.p.stroke(0, 0, 255, 220);
    this.p.rectMode(this.p.CENTER);

    // Taille du carré
    const sideLength = 30;

    // Dessiner le carré
    this.p.rect(this.position.x, this.position.y, sideLength, sideLength);

    // Dessiner les lignes croisées
    this.p.line(
      this.position.x - 10,
      this.position.y - 10,
      this.position.x - 20,
      this.position.y - 20
    );
    this.p.line(
      this.position.x + 10,
      this.position.y - 10,
      this.position.x + 20,
      this.position.y - 20
    );
    this.p.line(
      this.position.x + 10,
      this.position.y + 10,
      this.position.x + 20,
      this.position.y + 20
    );
    this.p.line(
      this.position.x - 10,
      this.position.y + 10,
      this.position.x - 20,
      this.position.y + 20
    );

    this.showText();
  }

  showBLE() {
    this.p.stroke(0, 255, 0);
    this.p.noFill();
    this.p.strokeWeight(2);

    // Bottom left
    const vertex1 = this.p.createVector(
      this.position.x - 23,
      this.position.y + 15
    );
    // Top
    const vertex2 = this.p.createVector(this.position.x, this.position.y - 25);
    // Bottom right
    const vertex3 = this.p.createVector(
      this.position.x + 23,
      this.position.y + 15
    );

    // Middle left
    const vertexMiddle1 = this.p.createVector(
      this.position.x - 8,
      this.position.y - 5
    );
    // Middle right
    const vertexMiddle2 = this.p.createVector(
      this.position.x + 8,
      this.position.y - 5
    );
    // Middle bottom
    const vertexMiddleBottom = this.p.createVector(
      this.position.x,
      this.position.y + 10
    );

    this.p.beginShape();
    this.p.vertex(vertex1.x, vertex1.y);
    this.p.vertex(vertexMiddle1.x, vertexMiddle1.y);
    this.p.vertex(vertex2.x, vertex2.y);
    this.p.vertex(vertexMiddle2.x, vertexMiddle2.y);
    this.p.vertex(vertex3.x, vertex3.y);
    this.p.vertex(vertexMiddleBottom.x, vertexMiddleBottom.y);
    this.p.endShape(this.p.CLOSE);

    this.showText();
  }

  showBase() {
    this.p.fill(255, 90);
    this.p.stroke(255, 100);
    this.p.ellipse(this.position.x, this.position.y, 10, 10);
  }

  showText() {
    if (this.wigle!.ssid) {
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(15);
      this.p.noStroke();
      this.p.fill(255);

      let arclength = 0;
      const radiusText = 40;

      this.p.push();
      this.p.translate(this.position.x, this.position.y);
      this.p.rotate(this.p.frameCount * 0.01);

      for (let i = 0; i < this.wigle!.ssid.length; i++) {
        const currentChar = this.wigle!.ssid.charAt(i);
        const w = this.p.textWidth(currentChar);
        arclength += w / 2;

        const theta = arclength / radiusText;

        this.p.push();
        const x = radiusText * this.p.cos(theta);
        const y = radiusText * this.p.sin(theta);
        this.p.translate(x, y);

        this.p.rotate(theta + this.p.PI / 2);

        this.p.text(currentChar, 0, 0);
        this.p.pop();

        arclength += w / 2;
      }

      this.p.pop();
    }
  }

  addRepulsionForces() {
    const repulsionRange = 300;

    for (const point of this.avoidancePoints) {
      const distanceToPoint = p5.Vector.sub(this.position, point).mag();
      if (distanceToPoint < this.avoidanceRadius + repulsionRange) {
        const repulsionForce = p5.Vector.sub(this.position, point).normalize();
        repulsionForce.mult(
          0.1 * (1 - (distanceToPoint - this.avoidanceRadius) / repulsionRange)
        );
        this.acceleration.add(repulsionForce);
      }
    }
  }

  checkCollision(nextPosition: p5.Vector): boolean {
    for (const point of this.avoidancePoints) {
      if (p5.Vector.sub(nextPosition, point).mag() < this.avoidanceRadius) {
        return true;
      }
    }
    return false;
  }

  handleCollision() {
    const normal = this.position.copy().normalize();
    const dotProduct = p5.Vector.dot(this.velocity, normal);
    const reflection = p5.Vector.sub(
      this.velocity,
      normal.copy().mult(2 * dotProduct)
    );

    reflection.rotate(this.p.random(-0.1, 0.1));

    this.velocity = reflection;
    this.position.add(normal);

    const currentTime = this.p.millis();
    if (currentTime - this.lastCollisionTime > 200) {
      this.lastCollisionTime = currentTime;
    }
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
    this.isTransformed = false;
    this.wigle = null;
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
