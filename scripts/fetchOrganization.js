const path = require("path");

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
  ensureDirAndWriteFiles,
  readJson,
  toPrettyJson,
} = require("./utils.js");

loadDotEnv();

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const DATA_ROOT = path.join(PROJECT_ROOT, "docs", "public", "data", "datawhalechina");

const CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  DATAWHALE_ORGANIZATION_NAME: "datawhalechina",
  TOP_10_KNOWLEDGE_SHARING_ORGANIZATION: [
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
  DATA_DIR: DATA_ROOT,
  REPO_DATA_DIR: path.join(DATA_ROOT, "repo"),
  ORGANIZATION_DATA_DIR: path.join(DATA_ROOT, "organization"),
  ALL_ORGANIZATION_FILE_NAME: "all_organization.json",
  TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME:
    "top_10_knowledge_sharing_organization.json",
  REPO_DATA_LIST_FILE_NAME: "repo_list.json",
  ANALYZED_DATASOURCE_FILE_NAME: path.join(
    DATA_ROOT,
    "organization_datasource.json",
  ),
  FETCH_TIME_KEY_FILE_NAME: path.join(DATA_ROOT, "fetch_time_key.json"),
};

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const envData = readJsonLikeEnv(envPath);

  for (const [key, value] of Object.entries(envData)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function readJsonLikeEnv(filePath) {
  const fs = require("fs");
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const output = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    output[key] = value;
  }
  return output;
}

async function fetchOrganizationData(key) {
  const repoDataListFilePath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const repoDataListFilePathWithKey = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    key,
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const originRepoDataList = readJson(repoDataListFilePath, []);
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
    10,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION,
  );
  const allOrganizationPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    CONFIG.ALL_ORGANIZATION_FILE_NAME,
  );
  const allOrganizationPathWithKey = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    key,
    CONFIG.ALL_ORGANIZATION_FILE_NAME,
  );
  const top10KnowledgeSharingOrganizationPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const top10KnowledgeSharingOrganizationPathWithKey = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    key,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );

  ensureDirAndWriteFiles(
    [allOrganizationPath, allOrganizationPathWithKey],
    toPrettyJson(starHistoryRes.organization_list),
  );
  ensureDirAndWriteFiles(
    [
      top10KnowledgeSharingOrganizationPath,
      top10KnowledgeSharingOrganizationPathWithKey,
    ],
    toPrettyJson(starHistoryRes.top_10_knowledge_sharing_organization),
  );

  const repoDetailRes = await fetchOrganizationRepoDetail(
    CONFIG.DATAWHALE_ORGANIZATION_NAME,
    CONFIG.GITHUB_TOKEN,
    [".github"],
    originRepoDetailList,
    key,
  );
  ensureDirAndWriteFiles(
    [repoDataListFilePath, repoDataListFilePathWithKey],
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
  const previousTop10OrganizationPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    previousKey,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const currentTop10OrganizationPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    currentKey,
    CONFIG.TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME,
  );
  const previousRepoListPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    previousKey,
    CONFIG.REPO_DATA_LIST_FILE_NAME,
  );
  const currentRepoListPath = path.join(
    CONFIG.ORGANIZATION_DATA_DIR,
    currentKey,
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

function parseArgs(argv) {
  const options = {
    force: false,
    fetchOnly: false,
    analyzeOnly: false,
    currentKey: null,
    previousKey: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      options.force = true;
    } else if (arg === "--fetch-only") {
      options.fetchOnly = true;
    } else if (arg === "--analyze-only") {
      options.analyzeOnly = true;
    } else if (arg === "--current-key") {
      options.currentKey = argv[index + 1];
      index += 1;
    } else if (arg === "--previous-key") {
      options.previousKey = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date();

  if (now.getDate() !== 1 && !options.force) {
    process.exit(0);
  }

  const currentKey =
    options.currentKey || `${now.getFullYear()}-${now.getMonth() + 1}`;
  const keyList = readJson(CONFIG.FETCH_TIME_KEY_FILE_NAME, []);
  let previousKey =
    options.previousKey ||
    (keyList.includes(currentKey) ? keyList[keyList.length - 2] : keyList[keyList.length - 3]);

  if (!previousKey) {
    previousKey = keyList[keyList.length - 1];
  }

  if (!options.analyzeOnly && !keyList.includes(currentKey)) {
    keyList.push(currentKey);
    ensureDirAndWriteFile(CONFIG.FETCH_TIME_KEY_FILE_NAME, toPrettyJson(keyList));
  }

  if (!options.analyzeOnly) {
    await fetchOrganizationData(currentKey);
  }

  if (!options.fetchOnly) {
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
  parseArgs,
};
