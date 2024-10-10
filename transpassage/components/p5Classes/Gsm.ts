import p5 from "p5";
import P5Element from "./P5Element";
import WigleElement from "./WigleElement";

interface LightningEffect {
  element: WigleElement;
  timer: number;
  depth: number;
  source: p5.Vector;
}

export default class Gsm extends P5Element {
  wigleElements: WigleElement[];
  lightningEffects: LightningEffect[];
  lastDiscoveredElements: Set<WigleElement>;

  constructor(p: p5, position: p5.Vector, wigleElements: WigleElement[]) {
    super(p, position);
    this.wigleElements = wigleElements;
    this.lightningEffects = [];
    this.lastDiscoveredElements = new Set();
  }

  update() {
    // Check for newly transformed elements
    const currentDiscoveredElements = new Set(
      this.wigleElements.filter((element) => element.isTransformed)
    );

    currentDiscoveredElements.forEach((element) => {
      if (!this.lastDiscoveredElements.has(element)) {
        this.addLightningEffect(element, 1, this.position);
      }
    });

    this.lastDiscoveredElements = currentDiscoveredElements;

    // Update and propagate lightning effects
    this.updateAndPropagateLightning();
  }

  addLightningEffect(element: WigleElement, depth: number, source: p5.Vector) {
    this.lightningEffects.push({
      element,
      timer: 1000, // 1 second timer
      depth,
      source,
    });
  }

  updateAndPropagateLightning() {
    const newEffects: LightningEffect[] = [];

    this.lightningEffects = this.lightningEffects.filter((effect) => {
      effect.timer -= this.p.deltaTime;

      if (effect.timer <= 0) {
        if (effect.depth > 1) {
          let nearbyCount = 0;
          const nearbyElements = this.findNearbyElements(effect.element);
          nearbyElements.forEach((nearbyElement) => {
            if (
              !this.lightningEffects.some((e) => e.element === nearbyElement)
            ) {
              if (nearbyCount <= 3) {
                newEffects.push({
                  element: nearbyElement,
                  timer: 1000,
                  depth: effect.depth - 1,
                  source: effect.element.position,
                });
              }

              nearbyCount++;
            }
          });
        }
        this.lightningEffects = [];
        return false;
      }
      return true;
    });

    this.lightningEffects.push(...newEffects);
  }

  findNearbyElements(element: WigleElement): WigleElement[] {
    const maxDistance = 200; // Adjust this value to control the propagation range
    return this.wigleElements.filter(
      (other) =>
        other !== element &&
        p5.Vector.dist(element.position, other.position) < maxDistance
    );
  }

  show() {
    this.p.push();
    this.p.translate(this.p.width / 2, this.p.height / 2);

    // Draw GSM antenna
    this.p.noFill();
    this.p.stroke(255, 255, 0);

    // Draw lightning effects
    this.lightningEffects.forEach((effect) => {
      this.drawLightning(
        effect.source,
        effect.element.position,
        effect.timer / 1000
      );
    });

    this.p.pop();
  }

  drawLightning(start: p5.Vector, end: p5.Vector, opacityFactor: number) {
    this.p.stroke(255, 255, 0, 200 * opacityFactor);
    this.p.strokeWeight(2);
    this.lightningLine(start, end);
  }

  lightningLine(start: p5.Vector, end: p5.Vector) {
    const points: p5.Vector[] = [start];
    const direction = p5.Vector.sub(end, start);
    const distance = direction.mag();
    const steps = Math.floor(distance / 60); // Adjust this value to control jaggedness

    for (let i = 0; i < steps; i++) {
      const progress = (i + 1) / steps;
      const target = p5.Vector.lerp(start, end, progress);
      points.push(target);
    }

    points.push(end);

    this.p.beginShape();
    for (const point of points) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape();
  }

  setWigleElements(wigleElements: WigleElement[]) {
    this.wigleElements = wigleElements;
  }
}
