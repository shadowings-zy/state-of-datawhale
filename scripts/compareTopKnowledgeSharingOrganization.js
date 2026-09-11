const path = require("path");
const { readJson, toPrettyJson } = require("./utils.js");

const defaultPreviousPath =
  "data/allOrganization/2026-06-26/top_10_knowledge_sharing_organization.json";
const defaultCurrentPath =
  "data/allOrganization/2026-09-11/top_10_knowledge_sharing_organization.json";

function resolveProjectPath(filePath) {
  return path.resolve(__dirname, "..", filePath);
}

function formatSignedNumber(value) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function formatRank(currentRank, previousRank) {
  if (!Number.isFinite(previousRank)) {
    return `${currentRank}（-）`;
  }

  const rankChange = previousRank - currentRank;
  return `${currentRank}（${formatSignedNumber(rankChange)}）`;
}

function formatStarCount(currentStarCount, previousStarCount) {
  if (!Number.isFinite(previousStarCount)) {
    return `${currentStarCount}（-）`;
  }

  const starGrowth = currentStarCount - previousStarCount;
  return `${currentStarCount}（${formatSignedNumber(starGrowth)}）`;
}

function compareTopKnowledgeSharingOrganization(previousPath, currentPath) {
  const previousDataList = readJson(previousPath, []);
  const currentDataList = readJson(currentPath, []);
  const previousByName = new Map(
    previousDataList.map((item) => [item.name, item]),
  );

  return currentDataList.map((item) => {
    const previousItem = previousByName.get(item.name);

    return {
      name: item.name,
      rank: formatRank(item.rank, previousItem?.rank),
      star_count: formatStarCount(
        item.star_count,
        previousItem?.star_count,
      ),
    };
  });
}

if (require.main === module) {
  const [, , previousArg = defaultPreviousPath, currentArg = defaultCurrentPath] =
    process.argv;
  const previousPath = resolveProjectPath(previousArg);
  const currentPath = resolveProjectPath(currentArg);
  const result = compareTopKnowledgeSharingOrganization(
    previousPath,
    currentPath,
  );

  console.log(toPrettyJson(result));
}

module.exports = {
  compareTopKnowledgeSharingOrganization,
};
