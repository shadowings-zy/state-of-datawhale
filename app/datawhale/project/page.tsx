import datasource from "@/data/organization_datasource.json"
import { DatawhaleChart } from "../DatawhaleChart";

const source = datasource.projectInfo

export default function Home() {
  return <DatawhaleChart source={source} mode="total" title="Datawhale项目Star数" />;
}
