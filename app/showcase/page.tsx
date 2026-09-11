import type { Metadata } from "next";
import datasource from "@/data/organization_datasource.json";
import topOrganizations from "@/data/allOrganization/2026-06-26/top_10_knowledge_sharing_organization.json";
import styles from "./page.module.css";

type MonthKey = "2026-4" | "2026-5" | "2026-6";

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
  quarterAdd: number;
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
  title: "Datawhale 季度观察 | 2026 年第二季度增长海报",
  description: "基于飞书文档《2026年4-6月datawhale项目及外部同类组织数据分析》生成的 Datawhale 中文增长展示页。",
};

const monthKeys: MonthKey[] = ["2026-4", "2026-5", "2026-6"];

const monthLabels: Record<MonthKey, string> = {
  "2026-4": "4 月",
  "2026-5": "5 月",
  "2026-6": "6 月",
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
  "Agent-Learning-Hub": "Agent-Learning-Hub",
  "deepagents-in-action": "deepagents-in-action",
  "hello-generic-agent": "hello-generic-agent",
};

const topProjectInsights: Record<string, string> = {
  "hello-agents":
    "二季度新增 29,809 颗 Star，5 月单月新增 13,098，是本期最强爆发点，也是组织增长最核心的发动机。",
  "happy-llm":
    "高基数下继续稳定增长，4-6 月新增 3,272，6 月底总 Star 数达到 31,575，是组织 Star 结构里的重要基本盘。",
  "easy-vibe":
    "二季度新增 12,534，5 月单月新增 8,058，说明项目在一季度完成冷启动后又迎来明显扩散。",
  "all-in-rag":
    "二季度新增 3,447，4 月、5 月、6 月都维持较高水平，是 RAG 方向持续吸引学习者的稳定项目。",
  "Agent-Learning-Hub":
    "二季度新增 4,313，5 月和 6 月连续维持两千级增长，是本期唯一完全在二季度起量并进入增长 Top5 的项目。",
};

const breakoutInsights: Record<string, string> = {
  "Agent-Learning-Hub":
    "它不是传统教程，而是一份可以照着执行的 AI Agent 学习 todo list，整理社区分享、论文、官方博客和工程经验，因此很快获得关注。",
  "deepagents-in-action":
    "基于 LangChain/LangGraph 生态构建生产级 AI Agent，5 月新增 118，6 月直接提升到 801，曲线已经明显变陡。",
  "hello-generic-agent":
    "Generic Agent 入门教程，围绕上下文信息密度最大化展开，二季度完成从 0 到数百 Star 的冷启动。",
};

const peerGrowthByName: Record<
  string,
  { growth: number; note: string; label: string }
> = {
  datawhalechina: {
    growth: 68509,
    note: "全球排名从第 29 位升至第 22 位，本期同榜组织中增量最强。",
    label: "Datawhale",
  },
  freeCodeCamp: {
    growth: 12101,
    note: "同榜增量第二，但 Datawhale 的本期增量约为它的 5.7 倍。",
    label: "freeCodeCamp",
  },
  EbookFoundation: {
    growth: 6114,
    note: "排名小幅前进，总量依旧领先，但季度速度明显低于 Datawhale。",
    label: "EbookFoundation",
  },
  TheAlgorithms: {
    growth: 5584,
    note: "知识分享组织里的高基数代表，本期稳定增长但没有明显加速。",
    label: "TheAlgorithms",
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
  quarterAdd: sumQuarter(project.monthly_stars),
  totalStars: project.monthly_total_stars["2026-6"] ?? project.star_count,
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
  quarterAdd: sumQuarter(project.monthly_stars),
  totalStars: project.monthly_total_stars["2026-6"] ?? project.star_count,
  monthlyAdds: monthKeys.map((month) => project.monthly_stars[month] ?? 0),
  monthlyTotals: monthKeys.map(
    (month) => project.monthly_total_stars[month] ?? 0,
  ),
  insight: getProjectInsight(project.name, breakoutInsights),
}));

const quarterlyPulse = monthKeys.map((month) => {
  const total = (datasource.projectInfo as ProjectRecord[])
    .filter((project) => (project.monthly_total_stars["2026-6"] ?? 0) >= 1000)
    .reduce((sum, project) => sum + (project.monthly_total_stars[month] ?? 0), 0);

  return {
    month,
    label: monthLabels[month],
    total,
  };
});

const topFiveTotal = topProjects.reduce(
  (sum, project) => sum + project.quarterAdd,
  0,
);

const signalMetrics = [
  {
    label: "全球排名",
    value: "第 22 位",
    note: "从 2026 年 4 月 1 日的第 29 位上升到 2026 年 6 月 26 日的第 22 位",
  },
  {
    label: "季度增量",
    value: "68,000+",
    note: "Datawhale 组织总 Star 数在 2026 年 4-6 月的新增量",
  },
  {
    label: "前五贡献",
    value: "53,000+",
    note: "增长 Top5 合计新增 53,000+，占千星项目总增量超过 80%",
  },
  {
    label: "五月峰值",
    value: "29,000+",
    note: "当前千星项目在 5 月新增 Star 数冲到本季度最高",
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
    title: "超头部项目继续拉动组织增长",
    text: "hello-agents 和 easy-vibe 两个项目合计新增 40,000+ 颗 Star，占项目总增量 65%+。",
  },
  {
    tag: "时间节奏",
    title: "5 月是本季度最关键的增长月份",
    text: "5 月由 hello-agents 单月 13,000+ 和 easy-vibe 单月 8,000+ 共同拉动，把季度热度推到高点。",
  },
  {
    tag: "外部对照",
    title: "Datawhale 进入头部竞争阶段",
    text: "在知识分享类组织里，Datawhale 的本期 Star 增量约为第二名的 5.7 倍，位置已经从快速追赶进入头部竞争。",
  },
];

export default function ShowcasePage() {
  return (
    <div className={styles.page}>
      <div className={styles.scanline} />
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>
            State-of-Datawhale 季度观察 (数据抓取 2026-06-26)
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <section id="overview" className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>2026 年第二季度增长海报</p>
            <h1 className={styles.heroTitle}>
              <span className={styles.highlight}>
                Datawhale在2026年第二季度继续刷新全球组织排名
              </span>
            </h1>
            <p className={styles.heroLead}>
              2026 年 4-6 月，Datawhale 总 Star 数从 28w 进一步提升到 35w，全球组织排名从第 29 位升到第 22 位。组织内部仍由{" "}
              <strong>{getProjectDisplayName("hello-agents")}</strong>{" "}
              和 AI Agent、大模型学习类项目驱动，5 月成为本季度最关键的增长月份。
            </p>
          </div>

          <div className={styles.heroPanel}>
            <article className={styles.rankCard}>
              <div className={styles.rankHeader}>
                <span className={styles.cardLabel}>全球排名提升</span>
              </div>
              <div className={styles.rankTrack}>
                <div className={`${styles.rankNode} ${styles.rankNodeStart}`}>
                  <span className={styles.rankNodeLabel}>2026-04-01</span>
                  <strong className={styles.rankValue}>29</strong>
                </div>
                <div className={styles.rankLine} />
                <div
                  className={`${styles.rankNode} ${styles.rankNodeEnd} ${styles.rankNodeActive}`}
                >
                  <span className={styles.rankNodeLabel}>2026-06-26</span>
                  <strong className={styles.rankValue}>22</strong>
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
                千星项目总量继续抬升，5 月出现季度增长峰值。
              </h2>
              <p className={styles.sectionText}>
                当前 Star 数超过 1000 的项目在 4-6 月合计新增 60,000+ 颗 Star，其中 4 月新增 19,000+，5 月冲高到 29,000+，6 月回落到 15,000+。
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
              <span className={styles.summaryTag}>五月高点</span>
              <p className={styles.summaryText}>
                5 月由 {getProjectDisplayName("hello-agents")} 单月新增 13,000+ 和{" "}
                {getProjectDisplayName("easy-vibe")} 单月新增 8,000+ 共同拉动，是本季度最明显的热度峰值。
              </p>
            </div>
          </article>

          <article className={styles.sectionCard}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionTag}>增长引擎</span>
              <h2 className={styles.sectionTitle}>
                增长 Top5 合计拿下 53,000+ 颗 Star。
              </h2>
              <p className={styles.sectionText}>
                文档指出，本季度增长高度集中在头部：hello-agents 和 easy-vibe 两个项目合计新增 40,000+ 颗 Star，占项目总增量 65%+；增长 Top5 占比超过 80%。
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
                      +{formatNumber(project.quarterAdd)}
                    </strong>
                  </div>
                  <div className={styles.stackTrack}>
                    <span
                      className={styles.stackFill}
                      style={{
                        width: `${(project.quarterAdd / topProjects[0].quarterAdd) * 100}%`,
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
                二季度新增 29,809 颗 Star，比一季度增量还要更高，继续稳居 Datawhale 内部第一。
              </p>
            </div>
          </article>
        </section>

        <section id="projects" className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionTag}>项目增长Top5</span>
            <h2 className={styles.headingTitle}>
              增长前五项目，继续撑起 Q2 的主要热度。
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
                      +{formatNumber(project.quarterAdd)}
                    </strong>
                  </div>
                  <div className={styles.projectMetric}>
                    <span className={styles.projectMetricLabel}>
                      六月底总Star数
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
              新项目在 Q2 已经跑出清晰的增长曲线。
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
                  +{formatNumber(project.quarterAdd)}
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
                <span className={styles.projectMetricLabel}>六月底总Star数</span>
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
                对外部同类组织，Datawhale 的速度差继续拉开。
              </h2>
              <p className={styles.sectionText}>
                文档指出，Datawhale 总 Star 数达到 352,615，GitHub 全球组织排名第 22，较 4 月 1 日继续前进 7 名；本期 Star 增量为 68,509，约为第二名的 5.7 倍。
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
