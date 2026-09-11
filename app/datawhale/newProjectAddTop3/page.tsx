import datasource from "@/data/organization_datasource.json"
import { QuarterGrowthTop5 } from "../QuarterGrowthTop5";

const source = datasource.newProjectAddTop3Info

export default function Home() {
  return (
    <QuarterGrowthTop5
      source={source}
      title="Datawhale新创建的项目本季度Star增长数Top3"
      periodMode="quarter"
      limit={3}
    />
  );
}
