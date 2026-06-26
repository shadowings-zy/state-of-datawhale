const axios = require("axios");
const cheerio = require("cheerio");

async function getOrganizationList(page) {
  const output = [];

  try {
    const response = await axios.get(
      `https://gitstar-ranking.com/organizations?page=${page}`,
    );
    const $ = cheerio.load(response.data);

    $("div.container > div.row > div")
      .slice(0, 2)
      .each((_, column) => {
        $(column)
          .find("a")
          .each((__, org) => {
            const name = $(org)
              .find("span.name > span.hidden-xs.hidden-sm")
              .text()
              .trim();
            const starCountText = $(org)
              .find("span.stargazers_count.pull-right")
              .text()
              .trim()
              .replace(/,/g, "");

            if (name && starCountText) {
              output.push({
                name,
                star_count: Number.parseInt(starCountText, 10),
              });
            }
          });
      });
  } catch (error) {
    console.log(`fetch repo error: ${error.message}`);
    return [];
  }

  return output;
}

async function fetchOrganizationFromStarHistory(
  pageCount,
  topKnowledgeSharingOrganizationNameList,
) {
  const organizationList = [];

  for (let page = 1; page <= pageCount; page += 1) {
    const result = await getOrganizationList(page);
    organizationList.push(...result);
    console.log(`fetch organization from star history page ${page} success`);
  }

  organizationList.sort((a, b) => b.star_count - a.star_count);
  organizationList.forEach((item, index) => {
    item.rank = index + 1;
  });

  const top10KnowledgeSharingOrganization = organizationList.filter((item) =>
    topKnowledgeSharingOrganizationNameList.includes(item.name),
  );

  console.log("organization_list", organizationList);
  console.log(
    "top_10_knowledge_sharing_organization",
    top10KnowledgeSharingOrganization,
  );

  return {
    organization_list: organizationList,
    top_10_knowledge_sharing_organization: top10KnowledgeSharingOrganization,
  };
}

module.exports = {
  fetchOrganizationFromStarHistory,
  getOrganizationList,
};
