import datasource from "@/data/organization_datasource.json"
import { DatawhaleProjectOverview } from "../DatawhaleProjectOverview";

const source = datasource.projectInfo

export default function Home() {
  return (
    <DatawhaleProjectOverview
      source={source}
      title="Datawhale超过1000Star项目的Star数"
    />
  );
}
