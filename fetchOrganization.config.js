module.exports = {
  githubTokenFile: {
    description: "GitHub Token 文件路径；相对路径基于项目根目录，脚本会读取文件内容作为 token。",
    value: "key.txt",
  },
  organizationName: {
    description: "需要抓取仓库列表和仓库 star 明细的 GitHub 组织名。",
    value: "datawhalechina",
  },
  currentKey: {
    description: "本次生成的数据月份；组织快照会写入 data/allOrganization/<currentKey>。",
    value: "2026-6",
  },
  previousKey: {
    description: "用于计算增量的上一期月份；为空时会从 data/allOrganization 已有月份中自动推断。",
    value: "2026-4",
  },
  runOnlyOnFirstDay: {
    description: "是否仅允许每月 1 日执行；补历史月份时设为 false。",
    value: false,
  },
  fetchEnabled: {
    description: "是否执行网络抓取，并写入 data/allOrganization/<currentKey> 和 data/repo。",
    value: true,
  },
  analyzeEnabled: {
    description: "是否基于 previousKey 和 currentKey 生成增量分析数据。",
    value: true,
  },
  starHistoryPageCount: {
    description: "从 gitstar-ranking.com 抓取组织榜单的页数。",
    value: 10,
  },
  ignoredRepoNames: {
    description: "抓取组织仓库时需要忽略的仓库名列表。",
    value: [".github"],
  },
  topKnowledgeSharingOrganizationNames: {
    description: "从组织总榜中筛选出的知识分享类组织名单。",
    value: [
      "freeCodeCamp",
      "TheAlgorithms",
      "EbookFoundation",
      "ossu",
      "doocs",
      "h5bp",
      "datawhalechina",
      "dair-ai",
      "jobbole",
      "papers-we-love",
    ],
  },
  repoDataDir: {
    description: "按仓库粒度保存 star 明细的目录；相对路径基于项目根目录。",
    value: "data/repo",
  },
  allOrganizationDataDir: {
    description: "按月份保存组织榜单快照和 repoList 快照的目录；相对路径基于项目根目录。",
    value: "data/allOrganization",
  },
  allOrganizationFileName: {
    description: "组织总榜快照文件名。",
    value: "all_organization.json",
  },
  topKnowledgeSharingOrganizationFileName: {
    description: "知识分享类组织榜单快照文件名。",
    value: "top_10_knowledge_sharing_organization.json",
  },
  repoDataListFileName: {
    description: "组织当月仓库 star 数快照文件名。",
    value: "repo_list.json",
  },
  analyzedDatasourceFileName: {
    description: "增量分析结果输出文件；相对路径基于项目根目录。",
    value: "data/organization_datasource.json",
  },
};
