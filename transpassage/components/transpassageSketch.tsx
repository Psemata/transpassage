"use client";

import { cn, parseDateString } from "@/lib/utils";
import Wigle from "@/types/Wigle";
import p5 from "p5";
import { useEffect, useRef, useState } from "react";
import Gsm from "./p5Classes/Gsm";
import Out from "./p5Classes/Out";
import WigleElement from "./p5Classes/WigleElement";

interface TranspassageSketchProp {
  csvData: Wigle[];
}

const TranspassageSketch = ({ csvData }: TranspassageSketchProp) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const listRefLeft = useRef<HTMLUListElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  const connectionCount = useRef<number>(0);

  const [dataList, setDataList] = useState<Wigle[]>([]);
  const [stationTime, setStationTime] = useState(
    new Date(2024, 10, 9, 14, 0, 0)
  );
  const [newItemIndex, setNewItemIndex] = useState<number | null>(null);

  const addItem = (newItem: Wigle) => {
    setDataList((prevList) => {
      const updatedList = [...prevList, newItem];
      setNewItemIndex(updatedList.length - 1);
      return updatedList;
    });

    // Reset the newItemIndex after the animation
    setTimeout(() => {
      setNewItemIndex(null);
    }, 500); // Match this with the CSS transition duration
  };

  const wigleFilter = (v: Wigle) => {
    return (
      parseDateString(v.firstseen).getDate() == 9 &&
      parseDateString(v.firstseen).getHours() >= 14 &&
      parseDateString(v.firstseen).getHours() < 15
    );
  };

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    connectionCount.current = dataList.length;
  }, [dataList]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch: p5 = new p5((p: p5) => {
      const outs: Out[] = [];

      let data: Wigle[] = [];
      const addedData: Set<Wigle> = new Set<Wigle>();

      const wigleStream: WigleElement[] = [];

      let gsmElement: Gsm;

      let monoFont: p5.Font;

      // Info bar
      const altitude: string = "ALT 468.2399696998695";
      const latitude: string = "LAT 46.210846601205034";
      const longitude: string = "LONG 6.142975067290402";
      let date: string = "";
      let time: string = "";
      let average: string = "";
      let wigleCount = 0;
      let wigleCountMin = 0;

      p.preload = () => {
        monoFont = p.loadFont("/fonts/FragmentMono-Regular.ttf");
      };

      // Setup
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Adding out spaces - top, right, bottom, left
        outs.push(
          new Out(
            p,
            p.createVector(-p.width / 2 + 200, -p.height / 2 - 20),
            p.width - 400,
            10
          ),
          new Out(
            p,
            p.createVector(p.width / 2 + 20, -p.height / 2 + 200),
            10,
            p.height - 400
          ),
          new Out(
            p,
            p.createVector(-p.width / 2 + 200, p.height / 2 + 20),
            p.width - 400,
            10
          ),
          new Out(
            p,
            p.createVector(-p.width / 2 - 20, -p.height / 2 + 200),
            10,
            p.height - 400
          )
        );

        // Preparing data
        data = csvData.filter(wigleFilter);

        // Creating the base elements
        for (let i = 0; i < 400; i++) {
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

        gsmElement = new Gsm(p, p.createVector(0, 0), wigleStream);
      };

      // Draw
      p.draw = () => {
        p.background(25);

        p.textFont(monoFont);

        if (stationTime.getSeconds() != p.second()) {
          addedData.clear();
        }

        if (stationTime.getMinutes() != p.minute()) {
          wigleCountMin = wigleCount;
          wigleCount = 0;
        }

        stationTime.setMinutes(p.minute());
        stationTime.setSeconds(p.second());

        time =
          stationTime.getHours() +
          2 +
          ":" +
          stationTime.getMinutes().toString().padStart(2, "0") +
          ":" +
          stationTime.getSeconds().toString().padStart(2, "0");

        date =
          stationTime.getFullYear() +
          "-" +
          stationTime.getMonth().toString().padStart(2, "0") +
          "-" +
          stationTime.getDate().toString().padStart(2, "0");

        setStationTime(stationTime);

        for (const caughtData of data) {
          if (
            parseDateString(caughtData.firstseen!).getMinutes() ==
              stationTime.getMinutes() &&
            parseDateString(caughtData.firstseen!).getSeconds() ==
              stationTime.getSeconds()
          ) {
            if (!addedData.has(caughtData)) {
              const elem = p.random(wigleStream.filter((v) => v.wigle == null));
              elem.setWigle(caughtData);

              if (!addedData.has(caughtData)) {
                addItem(caughtData);
                wigleCount++;
              }

              addedData.add(caughtData);
            }
          }
        }

        average = "connections per minute : " + wigleCountMin;

        for (const element of wigleStream) {
          element.update();
          element.show();

          if (element.arrived()) {
            element.changeDir();
          }
        }

        // Draw center of the experience, the gsm towers
        gsmElement.show();
        gsmElement.update();

        // Info bar
        p.fill(255);
        p.textSize(15);
        p.text(altitude, p.width - p.textWidth(altitude) - 10, p.height - 10);
        p.text("//", p.width - p.textWidth(altitude) - 40, p.height - 10);
        p.text(
          latitude,
          p.width - p.textWidth(latitude) - p.textWidth(altitude) - 50,
          p.height - 10
        );
        p.text(
          "//",
          p.width - p.textWidth(latitude) - p.textWidth(altitude) - 80,
          p.height - 10
        );
        p.text(
          longitude,
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            90,
          p.height - 10
        );
        p.text(
          "//",
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            120,
          p.height - 10
        );
        p.text(
          date,
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            130,
          p.height - 10
        );
        p.text(
          "//",
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            160,
          p.height - 10
        );
        p.text(
          time,
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            p.textWidth(time) -
            170,
          p.height - 10
        );
        p.text(
          "//",
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            p.textWidth(time) -
            200,
          p.height - 10
        );
        p.text(
          average,
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            p.textWidth(time) -
            p.textWidth(average) -
            210,
          p.height - 10
        );
        p.text(
          "//",
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            p.textWidth(time) -
            p.textWidth(average) -
            240,
          p.height - 10
        );
        p.text(
          "total of connections : " + connectionCount.current,
          p.width -
            p.textWidth(latitude) -
            p.textWidth(altitude) -
            p.textWidth(longitude) -
            p.textWidth(date) -
            p.textWidth(time) -
            p.textWidth(average) -
            500,
          p.height - 10
        );
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
    <div className="relative w-full h-screen font-custom">
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-transparent"
      />
      <div className="absolute top-0 left-0 z-10 p-4 bg-black bg-opacity-70 text-white h-full w-56 max-h-full overflow-y-auto whitespace-pre-wrap">
        {/* <h1 className="w-full text-center text-2xl font-custom mb-4">
          {dataList.length} <br />
          Connections
        </h1> */}
        <ul
          ref={listRefLeft}
          className="flex flex-col pl-2 my-2 max-h-full overflow-y-auto"
        >
          {dataList.map((item, index) => {
            let listElem = "";

            if (item.frequency) {
              listElem += "Frequency " + item.frequency + "\n";
            }

            if (item.channel) {
              listElem += "Channel " + item.channel + "\n";
            }

            listElem += item.type + "\n";
            listElem += item.authmode + "\n";

            return (
              <div
                key={index + item.mac + "group"}
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  index === newItemIndex
                    ? "opacity-0 translate-y-4"
                    : "opacity-100 translate-y-0"
                )}
                ref={index === dataList.length - 1 ? lastItemRef : null}
              >
                <li
                  key={index + item.mac}
                  className={cn(
                    "border-dotted border-t-2 pt-2 text-opacity-50 opacity-50",
                    item.type === "WIFI"
                      ? "text-red-700"
                      : item.type === "BLE"
                      ? "text-green-500"
                      : "text-blue-600",
                    parseDateString(item.firstseen).getMinutes() ==
                      stationTime.getMinutes() &&
                      parseDateString(item.firstseen).getSeconds() ==
                        stationTime.getSeconds() &&
                      "text-opacity-100 opacity-100"
                  )}
                >
                  {item.mac}
                </li>
                <li
                  key={"content" + index + item.mac}
                  className={cn(
                    "mb-2 text-opacity-30 opacity-30",
                    parseDateString(item.firstseen).getMinutes() ==
                      stationTime.getMinutes() &&
                      parseDateString(item.firstseen).getSeconds() ==
                        stationTime.getSeconds() &&
                      "text-opacity-70 opacity-70"
                  )}
                >
                  {listElem}
                </li>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TranspassageSketch;
