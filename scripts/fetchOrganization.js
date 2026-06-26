const path = require("path");
const fs = require("fs-extra");

const { getTop10KnowledgeSharingOrganizationInfo } = require("./analyzeOrganization.js");
const {
  getAddStarTop3NewRepo,
  getAddStarTop5Repo,
  getRepoAddStarMoreThan1000,
  getRepoStarMoreThan1000,
} = require("./analyzeRepo.js");
const { fetchOrganizationFromStarHistory } = require("./fetchOrganizationFromStarHistory.js");
const { fetchOrganizationRepoDetail } = require("./fetchOrganizationRepoDetail.js");
const {
  ensureDirAndWriteFile,
  readJson,
  toPrettyJson,
} = require("./utils.js");
const { CONFIG } = require("./fetchOrganizationConfig.js");

function parseMonthKeyParts(key) {
  const match = String(key).match(/^(\d{4})-(\d{1,2})$/);
  if (!match) {
    throw new Error(`月份 key 格式不正确: ${key}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`月份 key 月份范围不正确: ${key}`);
  }

  return { year, month };
}

function formatMonthKey(key, { padMonth = false } = {}) {
  const { year, month } = parseMonthKeyParts(key);
  return `${year}-${padMonth ? String(month).padStart(2, "0") : month}`;
}

function getMonthAliases(key) {
  return [formatMonthKey(key, { padMonth: true }), formatMonthKey(key)].filter(
    (item, index, list) => list.indexOf(item) === index,
  );
}

function getOrganizationMonthDir(key) {
  return path.join(CONFIG.ALL_ORGANIZATION_DATA_DIR, key);
}

function resolveExistingMonthKey(key) {
  for (const alias of getMonthAliases(key)) {
    if (fs.existsSync(getOrganizationMonthDir(alias))) {
      return alias;
    }
  }
  return key;
}

function listExistingMonthKeys() {
  if (!fs.existsSync(CONFIG.ALL_ORGANIZATION_DATA_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONFIG.ALL_ORGANIZATION_DATA_DIR)
    .filter((name) =>
      fs.statSync(path.join(CONFIG.ALL_ORGANIZATION_DATA_DIR, name)).isDirectory(),
    )
    .filter((name) => /^\d{4}-\d{1,2}$/.test(name))
    .sort((left, right) => {
      const leftParts = parseMonthKeyParts(left);
      const rightParts = parseMonthKeyParts(right);
      return (
        leftParts.year * 12 +
        leftParts.month -
        (rightParts.year * 12 + rightParts.month)
      );
    });
}

function getPreviousMonthKey(currentKey) {
  const currentParts = parseMonthKeyParts(currentKey);
  const currentValue = currentParts.year * 12 + currentParts.month;
  const monthKeys = listExistingMonthKeys().filter((monthKey) => {
    const parts = parseMonthKeyParts(monthKey);
    return parts.year * 12 + parts.month < currentValue;
  });

  return monthKeys[monthKeys.length - 1] || null;
}

async function fetchOrganizationData(key, previousKey = null) {
  const currentMonthDir = getOrganizationMonthDir(key);
  const originRepoListMonthKey = previousKey
    ? resolveExistingMonthKey(previousKey)
    : getPreviousMonthKey(key);
  const repoDataListFilePath = originRepoListMonthKey
    ? path.join(
        getOrganizationMonthDir(originRepoListMonthKey),
        CONFIG.REPO_DATA_LIST_FILE_NAME,
      )
    : null;
  const repoDataListFilePathWithKey = path.join(
    currentMonthDir,
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const originRepoDataList = repoDataListFilePath
    ? readJson(repoDataListFilePath, [])
    : [];
  const originRepoDetailList = [];

  for (const repoDetail of originRepoDataList) {
    const repoName = repoDetail.name.split("/")[1];
    const repoDetailPath = path.join(CONFIG.REPO_DATA_DIR, `${repoName}.json`);
    const repoDetailData = readJson(repoDetailPath);
    if (repoDetailData !== null) {
      originRepoDetailList.push(repoDetailData);
    }
  }

  const starHistoryRes = await fetchOrganizationFromStarHistory(
    CONFIG.STAR_HISTORY_PAGE_COUNT,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION,
  );
  const allOrganizationPathWithKey = path.join(
    currentMonthDir,
    CONFIG.ALL_ORGANIZATION_FILE_NAME,
  );
  const top10KnowledgeSharingOrganizationPathWithKey = path.join(
    currentMonthDir,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );

  ensureDirAndWriteFile(
    allOrganizationPathWithKey,
    toPrettyJson(starHistoryRes.organization_list),
  );
  ensureDirAndWriteFile(
    top10KnowledgeSharingOrganizationPathWithKey,
    toPrettyJson(starHistoryRes.top_10_knowledge_sharing_organization),
  );

  const repoDetailRes = await fetchOrganizationRepoDetail(
    originRepoDetailList,
    key,
  );
  ensureDirAndWriteFile(
    repoDataListFilePathWithKey,
    toPrettyJson(repoDetailRes.repo_list),
  );

  for (const repoDetail of repoDetailRes.repo_detail_list) {
    const repoDetailPath = path.join(
      CONFIG.REPO_DATA_DIR,
      `${repoDetail.repo_name}.json`,
    );
    ensureDirAndWriteFile(repoDetailPath, toPrettyJson(repoDetail));
  }
}

function analyzeOrganizationData(previousKey, currentKey) {
  const resolvedPreviousKey = resolveExistingMonthKey(previousKey);
  const resolvedCurrentKey = resolveExistingMonthKey(currentKey);
  const previousTop10OrganizationPath = path.join(
    getOrganizationMonthDir(resolvedPreviousKey),
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const currentTop10OrganizationPath = path.join(
    getOrganizationMonthDir(resolvedCurrentKey),
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const previousRepoListPath = path.join(
    getOrganizationMonthDir(resolvedPreviousKey),
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const currentRepoListPath = path.join(
    getOrganizationMonthDir(resolvedCurrentKey),
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );

  const datasource = {
    projectInfo: getRepoStarMoreThan1000(
      currentRepoListPath,
      CONFIG.REPO_DATA_DIR,
    ),
    projectAddInfo: getRepoAddStarMoreThan1000(
      previousRepoListPath,
      currentRepoListPath,
      CONFIG.REPO_DATA_DIR,
    ),
    projectAddTop5Info: getAddStarTop5Repo(
      previousRepoListPath,
      currentRepoListPath,
      CONFIG.REPO_DATA_DIR,
    ),
    newProjectAddTop3Info: getAddStarTop3NewRepo(
      previousRepoListPath,
      currentRepoListPath,
      CONFIG.REPO_DATA_DIR,
    ),
    top10KnowledgeSharingOrganizationInfo:
      getTop10KnowledgeSharingOrganizationInfo(
        previousTop10OrganizationPath,
        currentTop10OrganizationPath,
      ),
  };

  ensureDirAndWriteFile(
    CONFIG.ANALYZED_DATASOURCE_FILE_NAME,
    toPrettyJson(datasource),
  );
}

async function main() {
  const now = new Date();

  if (now.getDate() !== 1 && CONFIG.RUN_ONLY_ON_FIRST_DAY) {
    process.exit(0);
  }

  const currentKey = CONFIG.CURRENT_KEY
    ? formatMonthKey(CONFIG.CURRENT_KEY, { padMonth: CONFIG.CURRENT_KEY.includes("-0") })
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousKey = CONFIG.PREVIOUS_KEY
    ? resolveExistingMonthKey(CONFIG.PREVIOUS_KEY)
    : getPreviousMonthKey(currentKey);

  if (CONFIG.FETCH_ENABLED) {
    await fetchOrganizationData(currentKey, previousKey);
  }

  if (CONFIG.ANALYZE_ENABLED) {
    if (!previousKey) {
      throw new Error("缺少 previousKey，无法分析组织和仓库增量数据");
    }
    analyzeOrganizationData(previousKey, currentKey);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  CONFIG,
  analyzeOrganizationData,
  fetchOrganizationData,
  formatMonthKey,
  getPreviousMonthKey,
  resolveExistingMonthKey,
};
