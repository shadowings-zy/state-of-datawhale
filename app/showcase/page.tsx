import type { Metadata } from "next";
import datasource from "@/data/organization_datasource.json";
import topOrganizations from "@/data/allOrganization/2026-4/top_10_knowledge_sharing_organization.json";
import styles from "./page.module.css";

type MonthKey = "2026-1" | "2026-2" | "2026-3";

type MonthlySeries = Record<string, number>;

type ProjectRecord = {
  name: string;
  star_count: number;
  monthly_stars: MonthlySeries;
  monthly_total_stars: MonthlySeries;
};

type OrganizationRecord = {
  name: string;
  star_count: number;
  rank: number;
};

type ProjectCard = {
  name: string;
  displayName: string;
  q1Add: number;
  totalStars: number;
  monthlyAdds: number[];
  monthlyTotals: number[];
  insight: string;
};

type PeerCard = {
  name: string;
  label: string;
  growth: number;
  rank: number;
  totalStars: number;
  note: string;
};

export const metadata: Metadata = {
  title: "Datawhale 季度观察 | 2026 年第一季度增长展示",
  description: "基于 2026 年 1 至 3 月报告生成的 Datawhale 中文增长展示页。",
};

const monthKeys: MonthKey[] = ["2026-1", "2026-2", "2026-3"];

const monthLabels: Record<MonthKey, string> = {
  "2026-1": "1 月",
  "2026-2": "2 月",
  "2026-3": "3 月",
};

const projectDisplayNames: Record<string, string> = {
  "hello-agents": "hello-agents",
  "happy-llm": "happy-llm",
  "easy-vibe": "easy-vibe",
  "all-in-rag": "all-in-rag",
  "vibe-vibe": "vibe-vibe",
  "hello-claw": "hello-claw",
  "agent-skills-with-anthropic": "agent-skills-with-anthropic",
  "base-llm": "base-llm",
  "self-llm": "self-llm",
};

const topProjectInsights: Record<string, string> = {
  "hello-agents":
    "第一季度独增 18,904，3 月单月再推高 9,020，并在 2026 年 3 月底超越 self-llm，成为组织内Star数第一项目。",
  "happy-llm":
    "高基数下依旧稳定输出，1 月和 3 月都接近 1,900，已经从爆发型项目切入长期Star增长的区间。",
  "easy-vibe":
    "1 月冷启动冲到 2,169，2 月短暂回落后 3 月继续拉升，扩散不是一次性流量。",
  "all-in-rag":
    "第一季度合计新增 2,909，3 月显著抬升，组织内第二增长梯队已经开始成形。",
  "vibe-vibe":
    "走势最平滑，1 月起量后连续三个月保持增长，说明新用户获取具备持续性。",
};

const breakoutInsights: Record<string, string> = {
  "hello-claw":
    "前两个月几乎没有起量，3 月单月直接冲出 1,518，爆发强度在新项目里最明显。",
  "agent-skills-with-anthropic":
    "2 月开始获得首批关注，3 月继续新增 236，第一季度累计 349，曲线仍在加速。",
  "base-llm": "第一季度累计新增 447，3 月单月贡献 230，增长坡度已经开始变陡。",
};

const peerGrowthByName: Record<
  string,
  { growth: number; note: string; label: string }
> = {
  datawhalechina: {
    growth: 48868,
    note: "全球排名从第 41 位升至第 29 位，季度增量约为第二名的 7 倍。",
    label: "Datawhale",
  },
  TheAlgorithms: {
    growth: 6689,
    note: "知识分享组织里基数最高之一，但季度增量远低于 Datawhale。",
    label: "TheAlgorithms",
  },
  "dair-ai": {
    growth: 5777,
    note: "同样保持增长，但在总量和增速上都被 Datawhale 甩开。",
    label: "dair-ai",
  },
  EbookFoundation: {
    growth: 5390,
    note: "成熟组织依旧稳健，不过季度提速明显弱于 Datawhale。",
    label: "EbookFoundation",
  },
};

function sumQuarter(series: MonthlySeries) {
  return monthKeys.reduce((sum, month) => sum + (series[month] ?? 0), 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function getProjectDisplayName(name: string) {
  return projectDisplayNames[name] ?? name;
}

function getProjectInsight(name: string, insights: Record<string, string>) {
  return insights[name] ?? "该项目在本季度保持增长，是组织扩张的重要组成部分。";
}

const topProjects: ProjectCard[] = (
  datasource.projectAddTop5Info as ProjectRecord[]
).map((project) => ({
  name: project.name,
  displayName: getProjectDisplayName(project.name),
  q1Add: sumQuarter(project.monthly_stars),
  totalStars: project.monthly_total_stars["2026-3"] ?? project.star_count,
  monthlyAdds: monthKeys.map((month) => project.monthly_stars[month] ?? 0),
  monthlyTotals: monthKeys.map(
    (month) => project.monthly_total_stars[month] ?? 0,
  ),
  insight: getProjectInsight(project.name, topProjectInsights),
}));

const breakoutProjects: ProjectCard[] = (
  datasource.newProjectAddTop3Info as ProjectRecord[]
).map((project) => ({
  name: project.name,
  displayName: getProjectDisplayName(project.name),
  q1Add: sumQuarter(project.monthly_stars),
  totalStars: project.monthly_total_stars["2026-3"] ?? project.star_count,
  monthlyAdds: monthKeys.map((month) => project.monthly_stars[month] ?? 0),
  monthlyTotals: monthKeys.map(
    (month) => project.monthly_total_stars[month] ?? 0,
  ),
  insight: getProjectInsight(project.name, breakoutInsights),
}));

const quarterlyPulse = monthKeys.map((month) => {
  const total = (datasource.projectInfo as ProjectRecord[])
    .filter((project) => (project.monthly_total_stars["2026-3"] ?? 0) >= 1000)
    .reduce((sum, project) => sum + (project.monthly_total_stars[month] ?? 0), 0);

  return {
    month,
    label: monthLabels[month],
    total,
  };
});

const topFiveTotal = topProjects.reduce(
  (sum, project) => sum + project.q1Add,
  0,
);

const signalMetrics = [
  {
    label: "全球排名",
    value: "第 29 位",
    note: "从 2026 年 1 月的第 41 位跃升到 2026 年 4 月 1 日的第 29 位",
  },
  {
    label: "季度增量",
    value: "48,868",
    note: "组织总 Star 数在 2026 年第一季度的新增量",
  },
  {
    label: "前五贡献",
    value: formatNumber(topFiveTotal),
    note: "增长前五项目合计贡献了 70% 以上的Star数增量",
  },
  {
    label: "三月峰值",
    value: formatNumber(quarterlyPulse[2].total),
    note: "3 月项目总 Star 数达到季度观测窗口内最高值",
  },
];

const peerCards: PeerCard[] = (topOrganizations as OrganizationRecord[])
  .filter((organization) => organization.name in peerGrowthByName)
  .map((organization) => ({
    name: organization.name,
    label: peerGrowthByName[organization.name].label,
    growth: peerGrowthByName[organization.name].growth,
    rank: organization.rank,
    totalStars: organization.star_count,
    note: peerGrowthByName[organization.name].note,
  }))
  .sort((left, right) => right.growth - left.growth);

const takeawayCards = [
  {
    tag: "增长模型",
    title: "超级引擎与第二梯队接力",
    text: "hello-agents、easy-vibe、happy-llm、all-in-rag、vibe-vibe 共同把组织增长从单点爆发拉成面状扩散。",
  },
  {
    tag: "时间节奏",
    title: "3 月是整个季度的转折点",
    text: "项目在 2026 年 3 月单月新增 20,456 颗 Star，接近季度总量的一半，说明增长不是均匀推进，而是集中放大。",
  },
  {
    tag: "外部对照",
    title: "对外部同类组织形成明显速度差",
    text: "Datawhale 一季度新增 48,868 颗 Star，而 TheAlgorithms、dair-ai、EbookFoundation 仍停留在 5,000 到 6,000 区间，成熟组织普遍还在低速爬坡。",
  },
];

export default function ShowcasePage() {
  return (
    <div className={styles.page}>
      <div className={styles.scanline} />
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>
            State-of-Datawhale 季度观察 (数据快照 2026-04-01)
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <section id="overview" className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>2026 年第一季度增长报告</p>
            <h1 className={styles.heroTitle}>
              <span className={styles.highlight}>
                Datawhale在2026年第一季度冲进全球知识分享组织前三十
              </span>
            </h1>
            <p className={styles.heroLead}>
              组织整体在 2026 年 1 至 3 月新增 48,868 颗 Star，全球排名从第 41 位升到第 29 位。增长的关键不是单一项目的偶发爆发，而是{" "}
              <strong>{getProjectDisplayName("hello-agents")}</strong>{" "}
              飞速增长之后，第二梯队项目继续接力，把季度曲线在 3 月推到了最高点。
            </p>
          </div>

          <div className={styles.heroPanel}>
            <article className={styles.rankCard}>
              <div className={styles.rankHeader}>
                <span className={styles.cardLabel}>全球排名提升</span>
              </div>
              <div className={styles.rankTrack}>
                <div className={`${styles.rankNode} ${styles.rankNodeStart}`}>
                  <span className={styles.rankNodeLabel}>2026-01-01</span>
                  <strong className={styles.rankValue}>41</strong>
                </div>
                <div className={styles.rankLine} />
                <div
                  className={`${styles.rankNode} ${styles.rankNodeEnd} ${styles.rankNodeActive}`}
                >
                  <span className={styles.rankNodeLabel}>2026-04-01</span>
                  <strong className={styles.rankValue}>29</strong>
                </div>
              </div>
            </article>

            <div className={styles.metricGrid}>
              {signalMetrics.map((metric) => (
                <article key={metric.label} className={styles.metricCard}>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <strong className={styles.metricValue}>{metric.value}</strong>
                  <p className={styles.metricNote}>{metric.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="momentum" className={styles.momentumSection}>
          <article className={styles.sectionCard}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionTag}>季度增长</span>
              <h2 className={styles.sectionTitle}>
                项目总量在整个季度持续抬升，3 月站上最高点。
              </h2>
              <p className={styles.sectionText}>
                超过 1000 颗 Star 的项目在 1 月、2 月、3 月的总量分别是 232,408、242,140、262,596，整个季度都在持续抬升。
              </p>
            </div>

            <div className={styles.pulseRows}>
              {quarterlyPulse.map((item) => (
                <div key={item.month} className={styles.pulseRow}>
                  <span className={styles.pulseLabel}>{item.label}</span>
                  <div className={styles.pulseTrack}>
                    <span
                      className={styles.pulseFill}
                      style={{
                        width: `${(item.total / quarterlyPulse[2].total) * 100}%`,
                      }}
                    />
                  </div>
                  <strong className={styles.pulseValue}>
                    {formatNumber(item.total)}
                  </strong>
                </div>
              ))}
            </div>

            <div className={styles.pulseSummary}>
              <span className={styles.summaryTag}>三月高点</span>
              <p className={styles.summaryText}>
                到 2026 年 3 月底，{getProjectDisplayName("hello-agents")} 总 Star
                达到 32,568；{getProjectDisplayName("easy-vibe")}、
                {getProjectDisplayName("all-in-rag")} 和
                {getProjectDisplayName("happy-llm")} 也同步把第二增长梯队整体抬高。
              </p>
            </div>
          </article>

          <article className={styles.sectionCard}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionTag}>增长引擎</span>
              <h2 className={styles.sectionTitle}>
                前五项目合计拿下 34,078 颗 Star。
              </h2>
              <p className={styles.sectionText}>
                报告口径里，增长前五的项目合计贡献了 70%
                以上的项目增量。只看这五个项目的季度表现，
                {getProjectDisplayName("hello-agents")}{" "}
                已经一个项目吃下了超过一半的前五增量。
              </p>
            </div>

            <div className={styles.stackRows}>
              {topProjects.map((project) => (
                <div key={project.name} className={styles.stackRow}>
                  <div className={styles.stackHeader}>
                    <span className={styles.stackName}>
                      {project.displayName}
                    </span>
                    <strong className={styles.stackValue}>
                      +{formatNumber(project.q1Add)}
                    </strong>
                  </div>
                  <div className={styles.stackTrack}>
                    <span
                      className={styles.stackFill}
                      style={{
                        width: `${(project.q1Add / topProjects[0].q1Add) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.engineQuote}>
              <span className={styles.summaryTag}>核心观察</span>
              <p className={styles.summaryText}>
                {getProjectDisplayName("hello-agents")}{" "}
                在 2026 年 3 月底以 32,568 颗 Star 正式正式超越 {getProjectDisplayName("self-llm")}
                ，成为组织新第一项目。
              </p>
            </div>
          </article>
        </section>

        <section id="projects" className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionTag}>项目增长Top5</span>
            <h2 className={styles.headingTitle}>
              增长前五项目，正在把组织拉进新的规模阶段。
            </h2>
          </div>
        </section>

        <section className={styles.projectGrid}>
          {topProjects.map((project, index) => (
            <article
              key={project.name}
              className={`${styles.projectCard} ${index === 0 ? styles.projectCardFeatured : ""}`}
            >
              <div className={styles.projectHeader}>
                <div>
                  <span className={styles.projectIndex}>{`0${index + 1}`}</span>
                  <h3 className={styles.projectName}>{project.displayName}</h3>
                </div>
                <div className={styles.projectMetrics}>
                  <div className={styles.projectMetric}>
                    <span className={styles.projectMetricLabel}>季度新增</span>
                    <strong className={styles.projectMetricValue}>
                      +{formatNumber(project.q1Add)}
                    </strong>
                  </div>
                  <div className={styles.projectMetric}>
                    <span className={styles.projectMetricLabel}>
                      三月总Star数
                    </span>
                    <strong className={styles.projectMetricValue}>
                      {formatNumber(project.totalStars)}
                    </strong>
                  </div>
                </div>
              </div>

              <p className={styles.projectInsight}>{project.insight}</p>

              <div className={styles.sparkPanel}>
                <div className={styles.breakoutBars}>
                  {project.monthlyTotals.map((value, monthIndex) => (
                    <div
                      key={`${project.name}-total-${monthLabels[monthKeys[monthIndex]]}`}
                      className={styles.breakoutRow}
                    >
                      <span className={styles.breakoutMonth}>
                        {monthLabels[monthKeys[monthIndex]]}
                      </span>
                      <div className={styles.breakoutTrack}>
                        <span
                          className={styles.breakoutFill}
                          style={{
                            width: `${(value / Math.max(...project.monthlyTotals, 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <strong className={styles.breakoutCount}>
                        {formatNumber(value)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionTag}>新项目增长Top3</span>
            <h2 className={styles.headingTitle}>
              新项目在 3 月已经出现明显爆点。
            </h2>
          </div>
        </section>

        <section className={styles.breakoutGrid}>
          {breakoutProjects.map((project) => (
            <article key={project.name} className={styles.breakoutCard}>
              <div className={styles.breakoutHeader}>
                <div>
                  <h3 className={styles.breakoutName}>{project.displayName}</h3>
                </div>
                <strong className={styles.breakoutValue}>
                  +{formatNumber(project.q1Add)}
                </strong>
              </div>

              <p className={styles.breakoutText}>{project.insight}</p>

	              <div className={styles.breakoutBars}>
	                {project.monthlyTotals.map((value, monthIndex) => (
	                  <div
	                    key={`${project.name}-bar-${monthLabels[monthKeys[monthIndex]]}`}
	                    className={styles.breakoutRow}
	                  >
                    <span className={styles.breakoutMonth}>
                      {monthLabels[monthKeys[monthIndex]]}
                    </span>
                    <div className={styles.breakoutTrack}>
	                      <span
	                        className={styles.breakoutFill}
	                        style={{
	                          width: `${(value / Math.max(...project.monthlyTotals, 1)) * 100}%`,
	                        }}
	                      />
                    </div>
                    <strong className={styles.breakoutCount}>
                      {formatNumber(value)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className={styles.breakoutFooter}>
                <span className={styles.projectMetricLabel}>三月总Star数</span>
                <strong className={styles.breakoutTotal}>
                  {formatNumber(project.totalStars)}
                </strong>
              </div>
            </article>
          ))}
        </section>

        <section id="benchmark" className={styles.dualSection}>
          <article className={styles.sectionCard}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionTag}>外部对照</span>
              <h2 className={styles.sectionTitle}>
                对外部同类组织，Datawhale 的速度差已经非常明显。
              </h2>
              <p className={styles.sectionText}>
                报告里直接给出结论：在知识分享类组织里，Datawhale
                一季度是排名提升最快的组织。即便放到全球Star数规模更大的
                成熟组织里，这个季度增长量也明显拉开了差距。
              </p>
            </div>

            <div className={styles.peerTable}>
              {peerCards.map((peer) => (
                <div
                  key={peer.name}
                  className={`${styles.peerRow} ${
                    peer.name === "datawhalechina" ? styles.peerRowActive : ""
                  }`}
                >
                  <div className={styles.peerIdentity}>
                    <span className={styles.peerName}>{peer.label}</span>
                    <span className={styles.peerNote}>{peer.note}</span>
                  </div>
                  <span className={styles.peerStat}>第 {peer.rank} 位</span>
                  <span className={styles.peerStat}>
                    共 {formatNumber(peer.totalStars)} Star
                  </span>
                  <span className={styles.peerGrowth}>
                    +{formatNumber(peer.growth)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.sectionCard}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionTag}>关键结论</span>
              <h2 className={styles.sectionTitle}>
                这份报告真正说明了三件事。
              </h2>
            </div>

            <div className={styles.takeawayList}>
              {takeawayCards.map((card) => (
                <article key={card.title} className={styles.takeawayCard}>
                  <span className={styles.takeawayTag}>{card.tag}</span>
                  <h3 className={styles.takeawayTitle}>{card.title}</h3>
                  <p className={styles.takeawayText}>{card.text}</p>
                </article>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
