const axios = require("axios");

/**
 * 使用Github的API获取组织信息
 * @param {string} organizationName 组织名
 * @param {string} token Github的token
 * @returns 倒叙排列的组织详情
 */
const getGithubRepoByOrganizationName = async (organizationName, token = '') => {
  const output = [];

  let needNextPage = true;
  let page = 1;
  let pageSize = 100;
  while (needNextPage) {
    try {
      console.log(`fetch organization: ${organizationName}, page: ${page}`);

      const { data } = await axios.request({
        method: "get",
        url: `https://api.github.com/orgs/${organizationName}/repos?per_page=${pageSize}&page=${page}`,
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
        },
      });

      data.forEach((item) => {
        output.push({
          name: item.full_name,
          starCount: item.stargazers_count,
        });
      });

      needNextPage = data.length === pageSize;
      page = page + 1;
    } catch (e) {
      console.error("fetch organization error:", organizationName, e);
      needNextPage = false;
    }
  }
  return output.sort((a, b) => b.starCount - a.starCount);
};


/**
 * 使用Github的API获取star数信息
 * @param {string} organizationName 组织名
 * @param {string} repo Github的仓库
 * @param {string} token Github的token
 * @returns 返回月度star数和月度总star数
 */
const getGithubStarCount = async (organizationName, repo, token = '') => {
  let output = { repoName: repo, monthlyStars: {}, monthlyTotalStars: {}, starCount: 0 };

  let needNextPage = true;
  let page = 1;
  let totalStars = 0;
  let pageSize = 100;
  while (needNextPage) {
    try {
      console.log(`fetch repo: ${repo}, page: ${page}`);

      const { data } = await axios.request({
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.github.com/repos/${organizationName}/${repo}/stargazers?per_page=${pageSize}&page=${page}`,
        headers: {
          accept: "application/vnd.github.v3.star+json",
          authorization: `token ${token}`,
        },
      });
      data.forEach(({ starred_at: starredAt }) => {
        totalStars = totalStars + 1;
        const date = new Date(starredAt);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        if (output.monthlyStars[`${year}-${month}`] === undefined) {
          output.monthlyStars[`${year}-${month}`] = 1;
          output.monthlyTotalStars[`${year}-${month}`] = totalStars;
        } else {
          output.monthlyStars[`${year}-${month}`] = output.monthlyStars[`${year}-${month}`] + 1;
          output.monthlyTotalStars[`${year}-${month}`] = totalStars;
        }
      });

      needNextPage = data.length === pageSize;
      page = page + 1;
    } catch (e) {
      console.error("fetch repo error:", repo, e);
      needNextPage = false;
    }
  }
  output.starCount = totalStars;
  return output;
};

/**
 * 获取Github组织及仓库的star信息
 * @param {string} organizationName 组织名
 * @param {string} token Github的token
 * @returns 
 */
const fetchOrganizationRepoDetail = async (organizationName, token) => {
  const repoList = await getGithubRepoByOrganizationName(organizationName, token);
  console.log(`${organizationName} repoList:`, repoList);

  const repoDetailList = [];
  for (const repo of repoList) {
    const repoName = repo.name.split("/")[1];
    const output = await getGithubStarCount(organizationName, repoName, token);
    repoDetailList.push(output);
    console.log(`${organizationName} ${repoName} repoDetail:`, output);
  }
  repoDetailList.sort((a, b) => b.starCount - a.starCount);

  return {
    repoList,
    repoDetailList
  }
};

module.exports = {
  getGithubRepoByOrganizationName,
  fetchOrganizationRepoDetail
}


