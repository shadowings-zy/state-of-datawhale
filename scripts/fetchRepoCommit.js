const axios = require("axios");
const fs = require("fs");
const path = require("path");
const repoList = require("./data/repo.json");
const dayjs = require("dayjs");

const TOKEN = "";
const PAGE_SIZE = 100;

const getGithubRepoCommit = async (repo) => {
  let output = [];

  let needNextPage = true;
  let page = 1;
  while (needNextPage) {
    try {
      console.log("fetch repo commit page:", repo, page);

      const { data } = await axios.request({
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.github.com/repos/datawhalechina/${repo}/commits?per_page=${PAGE_SIZE}&page=${page}`,
        headers: {
          accept: "application/vnd.github.v3.star+json",
          authorization: `token ${TOKEN}`,
        },
      });

      for (let i = 0; i < data.length; i++) {
        const commit = data[i];
        const commitDetail = await getCommitDetail(repo, commit.sha);
        output.push({
          sha: commit.sha,
          author: commit.author?.login || commit.commit?.author?.name,
          email: commit.commit?.author?.email,
          date: dayjs(commit.commit.author.date).format("YYYY-MM-DD HH:mm:ss"),
          ...commitDetail,
        });
        console.log(`handle ${repo} page ${page} commit ${i} complete!`);
      }

      needNextPage = data.length === PAGE_SIZE;
      page = page + 1;
    } catch (e) {
      console.error("fetch repo error:", repo, e);
      needNextPage = false;
    }
  }
  return output;
};

const getCommitDetail = async (repo, commitHash) => {
  const { data } = await axios.request({
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.github.com/repos/datawhalechina/${repo}/commits/${commitHash}`,
    headers: {
      accept: "application/vnd.github.v3.star+json",
      authorization: `token ${TOKEN}`,
    },
  });
  const codeAdditionsCount = data.files
    .map((file) => file.additions)
    .reduce((a, b) => a + b, 0);
  const codeDeletionsCount = data.files
    .map((file) => file.deletions)
    .reduce((a, b) => a + b, 0);
  const codeChangesCount = data.files
    .map((file) => file.changes)
    .reduce((a, b) => a + b, 0);
  return { codeAdditionsCount, codeDeletionsCount, codeChangesCount };
};


const main = async () => {
  console.log("repoList", repoList);

  for (const repo of repoList.filter((item) =>
    repoNameList.includes(item.name.split("/")[1])
  )) {
    const repoName = repo.name.split("/")[1];
    const output = await getGithubRepoCommit(repoName);
    if (output.length !== 0) {
      fs.writeFileSync(
        path.join(__dirname, `./data/repoCommitDetail/${repoName}.json`),
        JSON.stringify(output)
      );
    }
    console.log("repoDetail", output);
  }
};

main();
