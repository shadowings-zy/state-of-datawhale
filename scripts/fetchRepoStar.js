const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TOKEN = "";
const STAR_COUNT = 0;
const PAGE_SIZE = 100;

const getDatawhaleGithubRepo = async () => {
  const output = [];

  let needNextPage = true;
  let page = 1;
  while (needNextPage) {
    try {
      console.log("fetch datawhale repo:", page);

      const { data } = await axios.request({
        method: "get",
        url: `https://api.github.com/orgs/datawhalechina/repos?per_page=${PAGE_SIZE}&page=${page}`,
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${TOKEN}`,
        },
      });

      data.forEach((item) => {
        if (item.stargazers_count >= STAR_COUNT) {
          output.push({
            name: item.full_name,
            starCount: item.stargazers_count,
          });
        }
      });

      needNextPage = data.length === PAGE_SIZE;
      page = page + 1;
    } catch (e) {
      console.error("fetch repo error:", repo, e);
      needNextPage = false;
    }
  }
  return output.sort((a, b) => b.starCount - a.starCount);
};

const getGithubStarCount = async (repo) => {
  let output = { repoName: repo, monthlyStars: {}, monthlyTotalStars: {} };

  let needNextPage = true;
  let page = 1;
  let totalStars = 0;
  while (needNextPage) {
    try {
      console.log("fetch repo page:", repo, page);

      const { data } = await axios.request({
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.github.com/repos/datawhalechina/${repo}/stargazers?per_page=${PAGE_SIZE}&page=${page}`,
        headers: {
          accept: "application/vnd.github.v3.star+json",
          authorization: `token ${TOKEN}`,
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
          output.monthlyStars[`${year}-${month}`] =
            output.monthlyStars[`${year}-${month}`] + 1;
          output.monthlyTotalStars[`${year}-${month}`] = totalStars;
        }
      });

      needNextPage = data.length === PAGE_SIZE;
      page = page + 1;
    } catch (e) {
      console.error("fetch repo error:", repo, e);
      needNextPage = false;
    }
  }
  return output;
};

const main = async () => {
  const KEY = "2025-4";

  const repoList = await getDatawhaleGithubRepo();
  console.log("repoList", repoList);
  fs.writeFileSync(
    path.join(__dirname, `./data/repo.json`),
    JSON.stringify(repoList)
  );

  for (const repo of repoList) {
    const repoName = repo.name.split("/")[1];
    const output = await getGithubStarCount(repoName);
    fs.writeFileSync(
      path.join(__dirname, `../data/${KEY}/repoDetail/${repoName}.json`),
      JSON.stringify(output)
    );
    console.log("repoDetail", output);
  }
};

main();
