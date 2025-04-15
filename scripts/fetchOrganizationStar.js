const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const getOrganizationList = async (page) => {
  const output = [];

  try {
    const { data } = await axios.request({
      method: "get",
      url: `https://gitstar-ranking.com/organizations?page=${page}`,
    });

    const $ = cheerio.load(data);
    for (let i = 0; i < 100; i++) {
      const nameElement = $(
        `body > div.container > div.row > div:nth-child(${
          i < 50 ? 1 : 2
        }) > div > a:nth-child(${
          (i % 50) + 1
        }) > span.name > span.hidden-xs.hidden-sm`
      );
      const starCountElement = $(
        `body > div.container > div.row > div:nth-child(${Math.ceil(
          i < 50 ? 1 : 2
        )}) > div > a:nth-child(${
          (i % 50) + 1
        }) > span.stargazers_count.pull-right`
      );
      const name = nameElement.html().replace(/\s+/g, "");
      const starCount = starCountElement
        .html()
        .replace(/<[^>]*>.*?<\/[^>]*>/g, "")
        .replace(/\s+/g, "");

      output.push({
        name,
        starCount: Number(starCount),
      });
    }
  } catch (e) {
    console.error("fetch repo error:", e);
    needNextPage = false;
  }

  return output;
};

const main = async () => {
  const KEY = "2025-4";
  const PAGE_COUNT = 10;
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

  let organizationList = [];
  for (let i = 1; i <= PAGE_COUNT; i++) {
    const result = await getOrganizationList(i);
    organizationList = [...organizationList, ...result];
  }
  organizationList = organizationList
    .sort((a, b) => b.starCount - a.starCount)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const top10KnowledgeSharingOrganization = organizationList.filter((item) =>
    TOP_10_KNOWLEDGE_SHARING_ORGANIZATION.includes(item.name)
  );

  fs.writeFileSync(
    path.join(__dirname, `../data/${KEY}/allOrganization.json`),
    JSON.stringify(organizationList)
  );
  fs.writeFileSync(
    path.join(__dirname, `../data/${KEY}/top10KnowledgeSharingOrganization.json`),
    JSON.stringify(top10KnowledgeSharingOrganization)
  );

  console.log("organizationList", organizationList);
  console.log("top10KnowledgeSharingOrganization", top10KnowledgeSharingOrganization);
};

main();
