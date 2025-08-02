const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 从starHistory网站中获取开源组织列表
 * @param {number} page 页数
 * @returns 组织列表
 */
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

/**
 * 从starHistory网站中获取开源组织列表
 * @param {number} pageCount 需要拉取多少页的数据
 * @param {string[]} topKnowledgeSharingOrganizationNameList 前十名知识分享类组织列表
 * @returns 组织列表，以及前十名知识分享类组织列表
 */
const fetchOrganizationFromStarHistory = async (pageCount, topKnowledgeSharingOrganizationNameList) => {
  let organizationList = [];
  for (let i = 1; i <= pageCount; i++) {
    const result = await getOrganizationList(i);
    organizationList = [...organizationList, ...result];
    console.log(`fetch organization from star history page ${i} success`);
  }
  organizationList = organizationList
    .sort((a, b) => b.starCount - a.starCount)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const top10KnowledgeSharingOrganization = organizationList.filter((item) =>
    topKnowledgeSharingOrganizationNameList.includes(item.name)
  );

  console.log("organizationList", organizationList);
  console.log("top10KnowledgeSharingOrganization", top10KnowledgeSharingOrganization);

  return {
    organizationList,
    top10KnowledgeSharingOrganization
  }
};

module.exports = {
  fetchOrganizationFromStarHistory
}

