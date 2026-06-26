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

function parseSnapshotKeyParts(key) {
  const match = String(key).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`快照日期 key 格式不正确，应为 YYYY-MM-DD: ${key}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`快照日期 key 日期不合法: ${key}`);
  }

  return { date, day, month, year };
}

function formatSnapshotKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getOrganizationSnapshotDir(key) {
  return path.join(CONFIG.ALL_ORGANIZATION_DATA_DIR, key);
}

function resolveExistingSnapshotKey(key) {
  parseSnapshotKeyParts(key);
  return key;
}

function listExistingSnapshotKeys() {
  if (!fs.existsSync(CONFIG.ALL_ORGANIZATION_DATA_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONFIG.ALL_ORGANIZATION_DATA_DIR)
    .filter((name) =>
      fs.statSync(path.join(CONFIG.ALL_ORGANIZATION_DATA_DIR, name)).isDirectory(),
    )
    .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort((left, right) => {
      const leftParts = parseSnapshotKeyParts(left);
      const rightParts = parseSnapshotKeyParts(right);
      return leftParts.date.getTime() - rightParts.date.getTime();
    });
}

function getPreviousSnapshotKey(currentKey) {
  const currentParts = parseSnapshotKeyParts(currentKey);
  const snapshotKeys = listExistingSnapshotKeys().filter((snapshotKey) => {
    const parts = parseSnapshotKeyParts(snapshotKey);
    return parts.date.getTime() < currentParts.date.getTime();
  });

  return snapshotKeys[snapshotKeys.length - 1] || null;
}

async function fetchOrganizationData(key, previousKey = null) {
  const currentSnapshotDir = getOrganizationSnapshotDir(key);
  const originRepoListSnapshotKey = previousKey
    ? resolveExistingSnapshotKey(previousKey)
    : getPreviousSnapshotKey(key);
  const repoDataListFilePath = originRepoListSnapshotKey
    ? path.join(
        getOrganizationSnapshotDir(originRepoListSnapshotKey),
        CONFIG.REPO_DATA_LIST_FILE_NAME,
      )
    : null;
  const repoDataListFilePathWithKey = path.join(
    currentSnapshotDir,
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
    currentSnapshotDir,
    CONFIG.ALL_ORGANIZATION_FILE_NAME,
  );
  const top10KnowledgeSharingOrganizationPathWithKey = path.join(
    currentSnapshotDir,
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
  const resolvedPreviousKey = resolveExistingSnapshotKey(previousKey);
  const resolvedCurrentKey = resolveExistingSnapshotKey(currentKey);
  const previousTop10OrganizationPath = path.join(
    getOrganizationSnapshotDir(resolvedPreviousKey),
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const currentTop10OrganizationPath = path.join(
    getOrganizationSnapshotDir(resolvedCurrentKey),
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const previousRepoListPath = path.join(
    getOrganizationSnapshotDir(resolvedPreviousKey),
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const currentRepoListPath = path.join(
    getOrganizationSnapshotDir(resolvedCurrentKey),
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
    ? resolveExistingSnapshotKey(CONFIG.CURRENT_KEY)
    : formatSnapshotKey(now);
  const previousKey = CONFIG.PREVIOUS_KEY
    ? resolveExistingSnapshotKey(CONFIG.PREVIOUS_KEY)
    : getPreviousSnapshotKey(currentKey);

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
  formatSnapshotKey,
  getPreviousSnapshotKey,
  resolveExistingSnapshotKey,
};
