"use client";

import { parseDateString } from "@/lib/utils";
import Wigle from "@/types/Wigle";
import p5 from "p5";
import { useEffect, useRef } from "react";
import Gsm from "./p5Classes/Gsm";
import Out from "./p5Classes/Out";
import WigleElement from "./p5Classes/WigleElement";

interface TranspassageSketchProp {
  csvData: Wigle[];
}

const TranspassageSketch = ({ csvData }: TranspassageSketchProp) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const wigleFilter = (v: Wigle) => {
    return (
      parseDateString(v.firstseen).getDate() == 3 &&
      parseDateString(v.firstseen).getHours() >= 14 &&
      parseDateString(v.firstseen).getHours() < 15
    );
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch: p5 = new p5((p: p5) => {
      const outs: Out[] = [];

      let data: Wigle[] = [];
      let addedData: Set<Wigle> = new Set<Wigle>();

      const wigleStream: WigleElement[] = [];

      let gsm: Wigle;
      let gsmElement: Gsm;

      const stationTime = new Date(2024, 9, 3, 14, 0, 0);

      // Setup
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Adding out spaces - top, right, bottom, left
        outs.push(
          new Out(
            p,
            p.createVector(-p.width / 2, -p.height / 2 - 20),
            p.width,
            10
          ),
          new Out(
            p,
            p.createVector(p.width / 2 + 20, -p.height / 2),
            10,
            p.height
          ),
          new Out(
            p,
            p.createVector(-p.width / 2, p.height / 2 + 20),
            p.width,
            10
          ),
          new Out(
            p,
            p.createVector(-p.width / 2 - 20, -p.height / 2),
            10,
            p.height
          )
        );

        // Preparing data
        data = csvData.filter(wigleFilter);

        gsm = data
          .filter((v) => v.type == "GSM")
          .sort((v1, v2) => v1.accuracymeters - v2.accuracymeters)[0];

        gsmElement = new Gsm(p, p.createVector(0, 0), gsm);

        // Creating the base elements
        for (let i = 0; i < 1000; i++) {
          wigleStream.push(
            new WigleElement(
              p,
              p.createVector(0, 0),
              p.createVector(0, 0),
              p.createVector(0, 0),
              outs
            )
          );
        }
      };

      // Draw
      p.draw = () => {
        p.background(0);

        if (stationTime.getMinutes() != p.minute()) {
          addedData.clear();
        }

        stationTime.setMinutes(p.minute());
        stationTime.setSeconds(p.second());

        // Draw center of the experience, the gsm towers
        gsmElement.show();

        for (const caughtData of data) {
          if (
            parseDateString(caughtData.firstseen!).getMinutes() ==
              stationTime.getMinutes() &&
            parseDateString(caughtData.firstseen!).getSeconds() ==
              stationTime.getSeconds()
          ) {
            if (!addedData.has(caughtData)) {
              const elem = p.random(wigleStream);
              elem.setWigle(caughtData);
              addedData.add(caughtData);
            }
          }
        }

        for (const element of wigleStream) {
          element.update();
          element.show();

          if (element.arrived()) {
            element.changeDir();
          }
        }

        // for (const caughtData of wigleStream) {
        //   if (
        //     parseDateString(caughtData.wigle.firstseen!).getMinutes() ==
        //       stationTime.getMinutes() &&
        //     parseDateString(caughtData.wigle.firstseen!).getSeconds() ==
        //       stationTime.getSeconds()
        //   ) {
        //     addedWigle.push(caughtData);

        //     p.textAlign(p.LEFT);

        //     // Right list
        //     if (caughtData.wigle.ssid) {
        //       p.text(caughtData.wigle.ssid, p.width - 200, textIndex);
        //     } else {
        //       p.text("x", p.width - 200, textIndex);
        //     }

        //     // Left list
        //     // p.text(caughtData.wigle.mac, 10, textIndex);

        //     // Circle text test
        //     p.textAlign(p.CENTER);

        //     p.push();
        //     p.translate(100, textIndex * 4);
        //     p.noStroke();
        //     p.ellipse(0, 0, 50, 50);

        //     // We must keep track of our position along the curve
        //     let arclength = 0;

        //     // For every box
        //     for (let i = 0; i < caughtData.wigle.mac.length; i++) {
        //       // The character and its width
        //       const currentChar = caughtData.wigle.mac.charAt(i);
        //       // Instead of a constant width, we check the width of each character.
        //       const w = p.textWidth(currentChar);
        //       // Each box is centered so we move half the width
        //       arclength += w / 2;

        //       // Angle in radians is the arclength divided by the radius
        //       // Starting on the left side of the circle by adding PI
        //       const theta = p.PI + arclength / 25;

        //       p.push();

        //       // Polar to Cartesian conversion allows us to find the point along the curve. See Chapter 13 for a review of this concept.
        //       p.translate(25 * p.cos(theta), 25 * p.sin(theta));
        //       // Rotate the box (rotation is offset by 90 degrees)
        //       p.rotate(theta + p.PI / 2);

        //       // Display the character
        //       p.fill(0);
        //       p.text(currentChar, 0, 0);

        //       p.pop();

        //       // Move halfway again
        //       arclength += w / 2;
        //     }
        //     p.pop();

        //     textIndex += 20;
        //   }
        // }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    }, canvasRef.current!);

    // Memory safety
    return () => {
      if (sketch) {
        sketch.remove();
      }
    };
  }, [csvData]);

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent"
    />
  );
};

export default TranspassageSketch;
