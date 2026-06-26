import datasource from "@/data/organization_datasource.json"
import { DatawhaleChart } from "../DatawhaleChart";

const source = datasource.newProjectAddTop3Info

export default function Home() {
  return (
    <DatawhaleChart
      source={source}
      mode="yearlyGrowth"
      title="Datawhale新创建的项目本年度Star增长数Top3"
      showLabel
    />
  );
}
