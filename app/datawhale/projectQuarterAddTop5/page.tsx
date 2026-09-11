import datasource from "@/data/organization_datasource.json";
import { QuarterGrowthTop5 } from "../QuarterGrowthTop5";

const sourceByName = new Map(
  [...datasource.projectInfo, ...datasource.projectAddTop5Info].map((project) => [
    project.name,
    project,
  ]),
);
const source = [...sourceByName.values()];

export default function Home() {
  return (
    <QuarterGrowthTop5
      source={source}
      title="Datawhale 项目本季度 Star 增长 Top5"
    />
  );
}
