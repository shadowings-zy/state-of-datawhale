import datasource from "@/data/organization_datasource.json"
import { DatawhaleChart } from "../DatawhaleChart";

const source = datasource.projectAddTop5Info

export default function Home() {
  return (
    <DatawhaleChart
      source={source}
      mode="yearlyGrowth"
      title="Datawhale项目本年度Star增长数Top5"
      showLabel
    />
  );
}
