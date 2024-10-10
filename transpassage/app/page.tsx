"use client";

import useFetch from "@/hooks/useFetch";
import Wigle from "@/types/Wigle";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Sketch = dynamic(() => import("@/components/transpassageSketch"), {
  ssr: false,
});

const Transpassage: React.FC = () => {
  const [csvData, setCsvData] = useState<Wigle[]>([]);
  const { fetchCsvData } = useFetch();

  useEffect(() => {
    fetchCsvData("/csv/wigle-2.csv", setCsvData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Sketch csvData={csvData} />
    </div>
  );
};

export default Transpassage;
