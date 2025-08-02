const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");

const { fetchOrganizationFromStarHistory } = require("./fetchOrganizationFromStarHistory");
const { fetchOrganizationRepoDetail, getGithubRepoByOrganizationName } = require("./fetchOrganizationRepoDetail");
const { fetchOrganizationInfoByAI, fetchRepoInfoByAI } = require("./fetchOrganizationInfoByAI");
const { ensureDirAndWriteFile } = require("../util");

const KEY = "2025-7";
const DATAWHALE_ORGANIZATION_NAME = "datawhalechina";
const TOP_10_KNOWLEDGE_SHARING_ORGANIZATION = [
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
];
const ENV_JSON_PATH = path.join(__dirname, `../../env.json`);
const ALL_ORGANIZATION_PATH = path.join(__dirname, `../../data/${KEY}/allOrganization.json`);
const TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_PATH = path.join(__dirname, `../../data/${KEY}/top10KnowledgeSharingOrganization.json`);
const ALL_ORGANIZATION_INTRODUCTION_PATH = path.join(__dirname, `../../data/allOrganizationIntroduction.json`);
const DATAWHALE_REPO_LIST_PATH = path.join(__dirname, `../../data/${KEY}/${DATAWHALE_ORGANIZATION_NAME}/repoList.json`);

const main = async () => {
  const envStr = fs.readFileSync(ENV_JSON_PATH, "utf-8");
  const envObject = JSON.parse(envStr)
  const aiToken = envObject.aiToken;
  const githubToken = envObject.githubToken;

  fse.ensureDirSync(path.join(__dirname, `../../data/${KEY}`));

  // 从starHistory网站中获取开源组织列表
  const { organizationList, top10KnowledgeSharingOrganization } = await fetchOrganizationFromStarHistory(10, TOP_10_KNOWLEDGE_SHARING_ORGANIZATION);
  ensureDirAndWriteFile(ALL_ORGANIZATION_PATH, JSON.stringify(organizationList));
  ensureDirAndWriteFile(TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_PATH, JSON.stringify(top10KnowledgeSharingOrganization));

  // 使用AI获取组织介绍
  const allOrganization = fs.readFileSync(ALL_ORGANIZATION_PATH, "utf-8");
  const oldAllOrganizationIntroduction = fs.readFileSync(ALL_ORGANIZATION_INTRODUCTION_PATH, "utf-8");
  const output = await fetchOrganizationInfoByAI(JSON.parse(allOrganization), JSON.parse(oldAllOrganizationIntroduction), KEY, aiToken);
  ensureDirAndWriteFile(ALL_ORGANIZATION_INTRODUCTION_PATH, JSON.stringify(output));

  // 获取Datawhale的仓库列表和仓库详情
  const { repoList, repoDetailList } = await fetchOrganizationRepoDetail(DATAWHALE_ORGANIZATION_NAME, githubToken);
  ensureDirAndWriteFile(DATAWHALE_REPO_LIST_PATH, JSON.stringify(repoList));
  repoDetailList.forEach((repoDetail) => {
    ensureDirAndWriteFile(
      path.join(__dirname, `../../data/${KEY}/${DATAWHALE_ORGANIZATION_NAME}/repoDetail/${repoDetail.repoName}.json`),
      JSON.stringify(repoDetail)
    );
  });

  // 获取StarHistory排名前1000的组织中，知识分享类组织的top3的仓库列表，以及它们是用来干什么的
  const allOrganizationIntroduction = fs.readFileSync(ALL_ORGANIZATION_INTRODUCTION_PATH, "utf-8");
  const allOrganizationIntroductionList = JSON.parse(allOrganizationIntroduction);
  const knowledgeSharingOrganizationList = allOrganizationIntroductionList.filter((item) => item.isKnowledgeSharingOrganization && item.isAIOrganization && item.name !== DATAWHALE_ORGANIZATION_NAME);
  const aiKnowledgeSharingOrganizationList = [];
  for (const organization of knowledgeSharingOrganizationList) {
    const repoList = await getGithubRepoByOrganizationName(organization.name, githubToken)
    const top3RepoList = repoList.slice(0, 3);
    const repoIntroductionList = await fetchRepoInfoByAI(organization.name, top3RepoList, aiToken);
    aiKnowledgeSharingOrganizationList.push({
      ...organization,
      repoIntroductionList
    });
  }
  ensureDirAndWriteFile(
    path.join(__dirname, `../../data/${KEY}/aiKnowledgeSharingOrganization.json`),
    JSON.stringify(aiKnowledgeSharingOrganizationList)
  );
}

main();
