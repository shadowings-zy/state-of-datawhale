import datasource from "@/data/organization_datasource.json"
import { DatawhaleChart } from "../DatawhaleChart";

const source = datasource.projectAddInfo

export default function Home() {
  return (
    <DatawhaleChart
      source={source}
      mode="yearlyGrowth"
      title="Datawhale项目本年度Star增长数"
      animationDuration={5000}
    />
  );
}
