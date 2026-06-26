const path = require("path");
const fs = require("fs-extra");

const rawConfig = require("../fetchOrganization.config.js");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function buildConfig(configSource) {
  const values = {};

  for (const [key, entry] of Object.entries(configSource)) {
    if (!entry || typeof entry !== "object" || !("description" in entry)) {
      throw new Error(`配置项 ${key} 缺少 description`);
    }
    if (!("value" in entry)) {
      throw new Error(`配置项 ${key} 缺少 value`);
    }
    values[key] = entry.value;
  }

  return {
    GITHUB_TOKEN: readTokenFile(values.githubTokenFile),
    DATAWHALE_ORGANIZATION_NAME: values.organizationName,
    TOP_10_KNOWLEDGE_SHARING_ORGANIZATION:
      values.topKnowledgeSharingOrganizationNames,
    REPO_DATA_DIR: resolveProjectPath(values.repoDataDir),
    ALL_ORGANIZATION_DATA_DIR: resolveProjectPath(values.allOrganizationDataDir),
    ALL_ORGANIZATION_FILE_NAME: values.allOrganizationFileName,
    TOP_10_KNOWLEDGE_SHARING_ORGANIZATION_FILE_NAME:
      values.topKnowledgeSharingOrganizationFileName,
    REPO_DATA_LIST_FILE_NAME: values.repoDataListFileName,
    ANALYZED_DATASOURCE_FILE_NAME: resolveProjectPath(
      values.analyzedDatasourceFileName,
    ),
    CURRENT_KEY: values.currentKey,
    PREVIOUS_KEY: values.previousKey,
    RUN_ONLY_ON_FIRST_DAY: values.runOnlyOnFirstDay,
    FETCH_ENABLED: values.fetchEnabled,
    ANALYZE_ENABLED: values.analyzeEnabled,
    STAR_HISTORY_PAGE_COUNT: values.starHistoryPageCount,
    IGNORED_REPO_NAMES: values.ignoredRepoNames,
  };
}

function readTokenFile(tokenFile) {
  if (!tokenFile) {
    return "";
  }

  const tokenFilePath = resolveProjectPath(tokenFile);
  if (!fs.existsSync(tokenFilePath)) {
    console.log(`GitHub Token 文件未找到: ${tokenFilePath}`);
    return "";
  }

  return fs.readFileSync(tokenFilePath, "utf8").trim();
}

function resolveProjectPath(targetPath) {
  return path.isAbsolute(targetPath)
    ? targetPath
    : path.join(PROJECT_ROOT, targetPath);
}

const CONFIG = buildConfig(rawConfig);

module.exports = {
  CONFIG,
  PROJECT_ROOT,
  buildConfig,
  resolveProjectPath,
};
