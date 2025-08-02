const path = require("path");
const fs = require("fs");
const { ensureDirAndWriteFile } = require("./util");

const ALL_ORGANIZATION_PATH = path.join(__dirname, `../data/allOrganizationIntroduction.json`);
const ALL_ORGANIZATION_NEW_PATH = path.join(__dirname, `../data/allOrganizationIntroduction.json`);

const main = async () => {
  const oldAllOrganizationIntroductionStr = fs.readFileSync(ALL_ORGANIZATION_PATH, "utf-8");
  const oldAllOrganizationIntroduction = JSON.parse(oldAllOrganizationIntroductionStr)
  const output = oldAllOrganizationIntroduction.map(item => {
    return {
      "name": item.name,
      "introduction": item.introduction,
      "isKnowledgeSharingOrganization": item.isKnowledgeSharingOrganization,
      "isAIOrganization": item.isAIOrganization,
      "timeline": {
        "2025-4": {
          "starCount": item.starCount,
          "rank": item.rank,
        }
      }
    }
  })

  ensureDirAndWriteFile(ALL_ORGANIZATION_NEW_PATH, JSON.stringify(output));
}

main()