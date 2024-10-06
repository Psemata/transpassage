"use client";

import useFetch from "@/hooks/useFetch";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Sketch = dynamic(() => import("@/components/transpassageSketch"), {
  ssr: false,
});

const Transpassage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvData, setCsvData] = useState<any[]>([]);
  const { fetchCsvData } = useFetch();

  useEffect(() => {
    fetchCsvData("/csv/wigle.csv", setCsvData);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Sketch csvData={csvData} />
    </div>
  );
};

export default Transpassage;
