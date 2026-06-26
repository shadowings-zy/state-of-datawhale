import datasource from "@/data/organization_datasource.json"
import { DatawhaleGrowthRace } from "../DatawhaleGrowthRace";

const source = datasource.projectAddInfo

export default function Home() {
  return (
    <DatawhaleGrowthRace
      source={source}
      title="Datawhale项目本年度Star增长数"
    />
  );
}
