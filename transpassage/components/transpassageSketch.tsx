/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { parseDateString } from "@/lib/utils";
import Wigle from "@/types/Wigle";
import p5 from "p5";
import { useEffect, useRef } from "react";
import WigleElement from "./p5Classes/WigleElement";
// import Set from "./p5Classes/Set";
// import InOut from "./p5Classes/InOut";
// import Person from "./p5Classes/Person";

interface TranspassageSketchProp {
  csvData: Wigle[];
}

const TranspassageSketch = ({ csvData }: TranspassageSketchProp) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // First idea
  // useEffect(() => {
  //   if (!canvasRef.current) return;

  //   const sketch: p5 = new p5((p: p5) => {
  //     // List of entries and exits
  //     const inOuts: InOut[] = [];
  //     // List of sets
  //     const sets: Set[] = [];
  //     // List of persons
  //     const persons: Person[] = [];

  //     // Setup
  //     p.setup = () => {
  //       p.createCanvas(p.windowWidth, p.windowHeight);

  //       // Definition of entries and exites
  //       inOuts.push(
  //         new InOut(p, p.createVector(600, 0), 528, 10),
  //         new InOut(p, p.createVector(p.width - 10, 150), 10, 430),
  //         new InOut(p, p.createVector(965, p.height - 10), 262, 10),
  //         new InOut(p, p.createVector(500, p.height - 10), 264, 10),
  //         new InOut(p, p.createVector(0, 150), 10, 330)
  //       );

  //       // Definition of the set
  //       sets.push(
  //         new Set(p, p.createVector(0, 0), 600, 150),
  //         new Set(p, p.createVector(p.width - 600, 0), 600, 150),
  //         new Set(p, p.createVector(0, p.height - 600), 500, 600),
  //         new Set(
  //           p,
  //           p.createVector(p.width / 2 - 100, p.height / 2 + 200),
  //           200,
  //           350
  //         ),
  //         new Set(p, p.createVector(p.width - 500, p.height - 500), 500, 500)
  //       );

  //       // Definition of the persons
  //       for (let i = 0; i < 100; i++) {
  //         const pSpawn = p.random(inOuts).randomPoint();
  //         const pExit = p
  //           .random(inOuts.filter((v) => v != pSpawn))
  //           .randomPoint();
  //         persons.push(new Person(p, pSpawn, pExit, sets));
  //       }
  //     };

  //     // Draw function
  //     p.draw = () => {
  //       p.background(225);

  //       // Drawing of the sets
  //       for (const set of sets) {
  //         set.show();
  //       }

  //       for (const inout of inOuts) {
  //         inout.show();
  //       }

  //       // Drawing of the people
  //       for (const person of persons) {
  //         if (!person.arrived()) {
  //           person.update();
  //           person.show();
  //         }
  //       }
  //     };
  //   }, canvasRef.current!);

  //   // Memory safety
  //   return () => {
  //     if (sketch) {
  //       sketch.remove();
  //     }
  //   };
  // }, []);

  const wigleFilter = (v: any) => {
    return (
      parseDateString(v.firstseen).getDate() == 3 &&
      parseDateString(v.firstseen).getHours() >= 14 &&
      parseDateString(v.firstseen).getHours() < 15 &&
      v.ssid != null
    );
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch: p5 = new p5((p: p5) => {
      let data: Wigle[] = [];
      const wigleStream: WigleElement[] = [];

      const stationTime = new Date(2024, 3, 10, 14, 0, 0);

      // Setup
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        data = csvData.filter(wigleFilter);

        for (const dataElement of data) {
          wigleStream.push(
            new WigleElement(
              p,
              p.createVector(0),
              p.createVector(0),
              p.createVector(0),
              dataElement
            )
          );
        }
      };

      // Draw function
      p.draw = () => {
        p.background(225);

        stationTime.setMinutes(p.second());

        p.textSize(90);
        p.textAlign(p.CENTER);
        p.text(
          stationTime.getHours().toString() +
            ":" +
            stationTime.getMinutes().toString().padStart(2, "0"),
          p.width / 2,
          p.height / 2
        );

        p.textSize(45);
        for (const caughtData of wigleStream) {
          if (
            parseDateString(caughtData.wigle.firstseen!).getMinutes() ==
            stationTime.getMinutes()
          ) {
            caughtData.show();
          }
        }
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
    // Display of the sketch
    <div
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent"
    />
  );
};

export default TranspassageSketch;
