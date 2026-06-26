const { readJson, toPrettyJson } = require("./utils.js");

function getTop10KnowledgeSharingOrganizationInfo(
  previousDataPath,
  currentDataPath,
) {
  const previousDataList = readJson(previousDataPath, []);
  const currentDataList = readJson(currentDataPath, []);

  const diffInfo = [];
  for (const item of currentDataList) {
    const previousItem = previousDataList.find(
      (previous) => previous.name === item.name,
    );
    if (previousItem) {
      diffInfo.push({
        ...item,
        starAdd: item.star_count - previousItem.star_count,
        rankAdd: item.rank - previousItem.rank,
      });
    }
  }

  console.log(toPrettyJson(diffInfo));
  return diffInfo;
}

module.exports = {
  getTop10KnowledgeSharingOrganizationInfo,
};
