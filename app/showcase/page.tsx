import type { CSSProperties } from "react";
import type { Metadata } from "next";
import datasource from "@/data/organization_datasource.json";
import styles from "./page.module.css";

type MonthKey = "2026-7" | "2026-8" | "2026-9";
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
  starAdd: number;
  rankAdd: number;
};

type ProjectView = ProjectRecord & {
  quarterAdd: number;
  monthlyAdds: number[];
  insight: string;
};

export const metadata: Metadata = {
  title: "Datawhale 季度观察 | 2026 年第三季度",
  description:
    "Datawhale 2026 年 7—9 月项目增长与外部同类组织观察，数据截至 2026 年 9 月 11 日。",
};

const months: MonthKey[] = ["2026-7", "2026-8", "2026-9"];
const monthLabels: Record<MonthKey, string> = {
  "2026-7": "7 月",
  "2026-8": "8 月",
  "2026-9": "9 月*",
};

const topProjectInsights: Record<string, string> = {
  "hello-agents":
    "本季度新增 15,710 颗 Star，贡献千星项目约 47% 的新增量。月度热度虽较二季度峰值回落，仍是组织最重要的增长发动机。",
  "Agent-Learning-Hub":
    "本季度新增 3,165 颗 Star，延续二季度起量后的稳定传播，成为 hello-agents 之外最强的增量来源。",
  "happy-llm":
    "在高基数下继续稳定增长，7 月与 8 月增量接近。作为长期高热度的大模型学习项目，它仍是组织的重要基本盘。",
  "all-in-rag":
    "三个月保持连续增长，没有依赖单月爆发。项目持续吸引 RAG 方向学习者，是项目矩阵中的稳定增长项。",
  "easy-vibe":
    "热度较二季度高峰明显回落，但仍保持持续增长。项目完成大规模扩散后，正在进入更平稳的长尾阶段。",
};

const breakoutInsights: Record<string, string> = {
  "zero-to-sglang":
    "Datawhale 与 RadixArk 联合推出的大模型推理实战教程，从零实现 mini-sglang，再深入真实 SGLang 源码。9 月截至 11 日已新增 674 颗 Star。",
  "deep-learning-notes":
    "从 PyTorch 基础延伸到 Transformer、生成模型、多模态及工程实践的系统化学习笔记，本季度保持稳步积累。",
  "omni-info-radar":
    "面向 AI 与技术从业者的个性化信息雷达，覆盖聚合、筛选、摘要、报告与推送，8 月完成一轮明显冷启动。",
};

function sumQuarter(series: MonthlySeries) {
  return months.reduce((sum, month) => sum + (series[month] ?? 0), 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

const projectInfo = datasource.projectInfo as ProjectRecord[];

const topProjects: ProjectView[] = (
  datasource.projectAddTop5Info as ProjectRecord[]
)
  .map((project) => ({
    ...project,
    quarterAdd: sumQuarter(project.monthly_stars),
    monthlyAdds: months.map((month) => project.monthly_stars[month] ?? 0),
    insight:
      topProjectInsights[project.name] ??
      "项目在本季度保持增长，是组织项目矩阵的重要组成部分。",
  }))
  .sort((left, right) => right.quarterAdd - left.quarterAdd);

const breakoutProjects: ProjectView[] = (
  datasource.newProjectAddTop3Info as ProjectRecord[]
)
  .map((project) => ({
    ...project,
    quarterAdd: sumQuarter(project.monthly_stars),
    monthlyAdds: months.map((month) => project.monthly_stars[month] ?? 0),
    insight:
      breakoutInsights[project.name] ??
      "项目已经完成冷启动，正在积累第一批稳定关注者。",
  }))
  .sort((left, right) => right.quarterAdd - left.quarterAdd);

const thousandStarProjects = projectInfo.filter(
  (project) => (project.monthly_total_stars["2026-9"] ?? project.star_count) >= 1000,
);

const monthlyPulse = months.map((month) => ({
  month,
  label: monthLabels[month],
  value: thousandStarProjects.reduce(
    (sum, project) => sum + (project.monthly_stars[month] ?? 0),
    0,
  ),
}));

const projectQuarterGrowth = monthlyPulse.reduce(
  (sum, month) => sum + month.value,
  0,
);
const topFiveGrowth = topProjects.reduce(
  (sum, project) => sum + project.quarterAdd,
  0,
);
const topFiveShare = Math.round((topFiveGrowth / projectQuarterGrowth) * 100);

const organizations =
  datasource.top10KnowledgeSharingOrganizationInfo as OrganizationRecord[];
const datawhale = organizations.find(
  (organization) => organization.name === "datawhalechina",
)!;
const comparisonOrganizations = organizations
  .filter((organization) => organization.name !== "datawhalechina")
  .sort((left, right) => right.starAdd - left.starAdd)
  .slice(0, 3);
const peerRows = [datawhale, ...comparisonOrganizations];
const peerMaxGrowth = Math.max(...peerRows.map((organization) => organization.starAdd));
const runnerUpGrowth = comparisonOrganizations[0]?.starAdd ?? 1;
const growthMultiple = (datawhale.starAdd / runnerUpGrowth).toFixed(1);

const metricCards = [
  { value: "第 20 位", label: "全球组织排名", note: "较 6 月底再前进 2 位" },
  { value: "391,164", label: "组织总 Star", note: "从 35.2 万提升至 39.1 万" },
  { value: "+38,549", label: "本季度新增 Star", note: "同类知识分享组织中增量第一" },
  { value: topFiveShare + "%", label: "Top5 贡献", note: "合计新增 " + formatNumber(topFiveGrowth) + " 颗" },
];

export default function ShowcasePage() {
  const maxPulse = Math.max(...monthlyPulse.map((month) => month.value));

  return (
    <div className={styles.page}>
      <main id="top" className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.issueLine}>
              <span>2026 · Q3</span>
              <span>季度增长观察</span>
            </div>
            <h1>
              从 35.2 万到
              <span>39.1 万</span>
            </h1>
            <p className={styles.heroLead}>
              7—9 月，Datawhale 延续高位增长，GitHub 全球组织排名升至第 20。
              hello-agents 继续领跑，成熟项目稳定接力，新项目开始提供下一阶段动力。
            </p>
            <div className={styles.heroNotes}>
              <span>数据抓取：2026 年 9 月 11 日</span>
              <span>9 月为进行中数据</span>
            </div>
          </div>

          <aside className={styles.rankPoster} aria-label="全球排名变化">
            <span className={styles.posterKicker}>GLOBAL RANK</span>
            <div className={styles.rankStatement}>
              <span>Star 排名</span>
              <strong>22 → 20</strong>
            </div>
          </aside>
        </section>

        <section className={styles.metricStrip} aria-label="核心数据">
          {metricCards.map((metric, index) => (
            <article className={styles.metric} key={metric.label}>
              <span className={styles.metricIndex}>{"0" + (index + 1)}</span>
              <strong>{metric.value}</strong>
              <h2>{metric.label}</h2>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section id="pulse" className={styles.storySection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionNumber}>01 / QUARTERLY PULSE</span>
              <h2>组织项目的增长仍在高位</h2>
            </div>
            <p>
              当前 {thousandStarProjects.length} 个千星项目在 7—9 月共新增{" "}
              <strong>{formatNumber(projectQuarterGrowth)}</strong> 颗 Star。7 月是完整月份中的高点，
              9 月仅统计至 11 日，不与前两个月直接比较。
            </p>
          </div>

          <div className={styles.pulseChart}>
            {monthlyPulse.map((item, index) => (
              <article className={styles.pulseColumn} key={item.month}>
                <div className={styles.pulseLabelBlock}>
                  <span>{item.label}</span>
                  {item.month === "2026-9" && (
                    <small>截至 9 月 11 日</small>
                  )}
                </div>
                <div className={styles.pulseTrack}>
                  <span
                    className={styles.pulseFill}
                    style={
                      {
                        "--bar-width": Math.max((item.value / maxPulse) * 100, 12) + "%",
                        "--bar-delay": index * 90 + "ms",
                      } as CSSProperties
                    }
                  />
                </div>
                <strong className={styles.pulseNumber}>+{formatNumber(item.value)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className={styles.storySection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionNumber}>02 / GROWTH ENGINE</span>
              <h2>头部带动，多项目稳定补位</h2>
            </div>
            <p>
              增长 Top5 合计新增 <strong>{formatNumber(topFiveGrowth)}</strong> 颗 Star，
              占千星项目本季度新增量约 <strong>{topFiveShare}%</strong>。
              hello-agents 一项贡献近半，但增长结构正变得更加多元。
            </p>
          </div>

          <div className={styles.projectList}>
            {topProjects.map((project, index) => (
              <article
                className={styles.projectRow + (index === 0 ? " " + styles.projectRowLead : "")}
                key={project.name}
              >
                <div className={styles.projectRank}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.projectIdentity}>
                  <h3>{project.name}</h3>
                  <p>{project.insight}</p>
                </div>
                <div className={styles.projectNumbers}>
                  <span>季度新增</span>
                  <strong>+{formatNumber(project.quarterAdd)}</strong>
                  <small>总计 {formatNumber(project.star_count)}</small>
                </div>
                <div className={styles.miniBars} aria-label={project.name + " 月度新增"}>
                  {project.monthlyAdds.map((value, monthIndex) => (
                    <div className={styles.miniBarRow} key={project.name + "-" + months[monthIndex]}>
                      <span>{monthLabels[months[monthIndex]]}</span>
                      <div>
                        <i
                          style={{
                            width:
                              Math.max(
                                (value / Math.max(...project.monthlyAdds, 1)) * 100,
                                value > 0 ? 5 : 0,
                              ) + "%",
                          }}
                        />
                      </div>
                      <b>{formatNumber(value)}</b>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.breakoutSection}>
          <div className={styles.breakoutIntro}>
            <span className={styles.sectionNumber}>03 / NEW SIGNALS</span>
            <h2>新项目在茁壮成长</h2>
            <p>
              新项目规模尚小，但方向更聚焦：大模型推理、系统化深度学习，以及个性化技术情报。
            </p>
          </div>
          <div className={styles.breakoutGrid}>
            {breakoutProjects.map((project, index) => (
              <article className={styles.breakoutCard} key={project.name}>
                <span className={styles.breakoutOrdinal}>{"SIGNAL / 0" + (index + 1)}</span>
                <h3>{project.name}</h3>
                <strong>+{formatNumber(project.quarterAdd)}</strong>
                <p>{project.insight}</p>
                <div className={styles.monthChips}>
                  {project.monthlyAdds.map((value, monthIndex) => (
                    <span key={project.name + "-" + months[monthIndex]}>
                      {monthLabels[months[monthIndex]]} {formatNumber(value)}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="benchmark" className={styles.benchmarkSection}>
          <div className={styles.benchmarkCopy}>
            <span className={styles.sectionNumber}>04 / PEER BENCHMARK</span>
            <h2>增速领先第二名 {growthMultiple} 倍</h2>
            <p>
              Datawhale 本季度新增 38,549 颗 Star，同榜第二名 EbookFoundation 新增 5,318 颗。
              组织已从快速追赶进入全球知识分享类组织的头部竞争阶段。
            </p>
          </div>

          <div className={styles.peerList}>
            {peerRows.map((organization) => (
              <article
                className={
                  styles.peerRow +
                  (organization.name === "datawhalechina" ? " " + styles.peerRowActive : "")
                }
                key={organization.name}
              >
                <div className={styles.peerHeader}>
                  <div>
                    <h3>{organization.name === "datawhalechina" ? "Datawhale" : organization.name}</h3>
                    <span>全球第 {organization.rank} 位 · {formatNumber(organization.star_count)} Star</span>
                  </div>
                  <strong>+{formatNumber(organization.starAdd)}</strong>
                </div>
                <div className={styles.peerTrack}>
                  <i style={{ width: (organization.starAdd / peerMaxGrowth) * 100 + "%" }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>STATE OF DATAWHALE · 2026 Q3</span>
          <p>* 本页 9 月数据统计截至 2026 年 9 月 11 日，季度结论为阶段性观察。</p>
        </footer>
      </main>
    </div>
  );
}
