const repoList = require("./data/repo.json");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");

const yearlyKey = [
  "2024-1",
  "2024-2",
  "2024-3",
  "2024-4",
  "2024-5",
  "2024-6",
  "2024-7",
  "2024-8",
  "2024-9",
  "2024-10",
  "2024-11",
  "2024-12",
];

const getYearlyGrowth = (monthlyStars) => {
  let yearlyGrowth = 0;
  for (const key of yearlyKey) {
    if (monthlyStars[key] !== undefined) {
      yearlyGrowth += monthlyStars[key];
    }
  }
  return yearlyGrowth;
};

const getAllCommit = () => {
  const allCommit = [];

  for (const repo of repoList) {
    const repoName = repo.name.split("/")[1];
    const commitDetail = require(`./data/repoCommitDetail/${repoName}.json`);
    const starDetail = require(`./data/repoStarDetail/${repoName}.json`);
    commitDetail.forEach((commit) => {
      if (commit.date.includes("2024")) {
        allCommit.push({
          username: commit.author,
          email: commit.email,
          date: commit.date,
          codeAdditionsCount: commit.codeAdditionsCount,
          project: {
            name: repoName,
            yearGrowth: getYearlyGrowth(starDetail.monthlyStars),
            starCount: starDetail.monthlyTotalStars["2025-1"],
          },
        });
      }
    });
  }

  return allCommit;
};

const unionCommitByUsername = (commitList) => {
  const commitMap = {};
  for (const commit of commitList) {
    if (commitMap[commit.username]) {
      commitMap[commit.username].push(commit);
    } else {
      commitMap[commit.username] = [commit];
    }
  }
  return commitMap;
};

const getProjectByCommitList = (commitList) => {
  const projectMap = {};
  for (const commit of commitList) {
    if (projectMap[commit.project.name]) {
      projectMap[commit.project.name].commitCount++;
    } else {
      projectMap[commit.project.name] = {
        ...commit.project,
        commitCount: 0,
      };
    }
  }
  return Object.values(projectMap);
};

const getLatestTimeCommit = (commitList) => {
  const earlyMorningCommit = commitList
    .filter((item) => {
      const date = dayjs(item.date, "HH:mm:ss");
      return date.hour() <= 5;
    })
    .sort((a, b) => {
      const dateA = dayjs(a, "HH:mm:ss");
      const dateB = dayjs(b, "HH:mm:ss");
      return dateA.isAfter(dateB);
    });
  const midnightCommit = commitList
    .filter((item) => {
      const date = dayjs(item.date, "HH:mm:ss");
      return date.hour() >= 22;
    })
    .sort((a, b) => {
      const dateA = dayjs(a, "HH:mm:ss");
      const dateB = dayjs(b, "HH:mm:ss");
      return dateA.isAfter(dateB);
    });
  if (earlyMorningCommit.length > 0) {
    return earlyMorningCommit[0];
  }
  return midnightCommit[0];
};

const convertCommitMapToTargetFormat = (commitMap) => {
  const targetFormat = [];
  for (const username in commitMap) {
    const commitList = commitMap[username];
    const projectInfoList = getProjectByCommitList(commitList);
    const maxCommitProject = projectInfoList.sort(
      (a, b) => b.commitCount - a.commitCount
    )[0];
    const latestTimeCommitInfo = getLatestTimeCommit(commitList);
    const item = {
      username,
      email: commitList[0].email,
      project: projectInfoList,
      commitCount: commitList.length,
      codeCount: commitList.reduce((a, b) => a + b.codeAdditionsCount, 0),
      maxCommitProject,
      maxCommitProjectCommitCount: maxCommitProject.commitCount,
    };
    if (latestTimeCommitInfo?.date && latestTimeCommitInfo?.project?.name) {
      item.lastCommitTime = latestTimeCommitInfo.date;
      item.lastCommitProjectName = latestTimeCommitInfo.project.name;
    }
    targetFormat.push(item);
  }
  return targetFormat;
};

const main = async () => {
  const allCommit = getAllCommit();
  const unionCommit = unionCommitByUsername(allCommit);
  const targetFormat = convertCommitMapToTargetFormat(unionCommit);
  console.log("targetFormat", targetFormat);

  fs.writeFileSync(
    path.join(__dirname, `./data/datawhale-data-2024.json`),
    JSON.stringify(targetFormat)
  );
};

main();
