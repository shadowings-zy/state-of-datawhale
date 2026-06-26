const path = require("path");

const {
  getObjectByMonthKey,
  readJson,
  toPrettyJson,
} = require("./utils.js");

function joinRepoDetailByName(repoList, repoDetailDir, monthCount = 12) {
  const result = [];

  for (const item of repoList) {
    const filename = item.name.replace("datawhalechina/", "");
    const repoDetailPath = path.join(repoDetailDir, `${filename}.json`);
    const repoData = readJson(repoDetailPath, {});
    const monthlyStars = repoData.monthly_stars || {};
    const monthlyTotalStars = repoData.monthly_total_stars || {};

    result.push({
      name: filename,
      star_count: item.star_count,
      monthly_stars: getObjectByMonthKey(monthlyStars, monthCount),
      monthly_total_stars: getObjectByMonthKey(monthlyTotalStars, monthCount),
    });
  }

  return result;
}

function getRepoStarMoreThan1000(repoListPath, repoDetailDir) {
  const repoList = readJson(repoListPath, []);
  const moreThan1000RepoList = repoList.filter(
    (item) => item.star_count >= 1000,
  );
  const result = joinRepoDetailByName(moreThan1000RepoList, repoDetailDir);

  console.log(toPrettyJson(result));
  return result;
}

function getRepoAddStarMoreThan1000(
  previousRepoListPath,
  currentRepoListPath,
  repoDetailDir,
) {
  const previousRepoList = readJson(previousRepoListPath, []);
  const currentRepoList = readJson(currentRepoListPath, []);
  const diffInfo = [];

  for (const item of currentRepoList) {
    if (item.star_count >= 1000) {
      const previousItem = previousRepoList.find(
        (previous) => previous.name === item.name,
      );
      diffInfo.push({
        ...item,
        starAdd:
          item.star_count - (previousItem ? previousItem.star_count : 0),
      });
    }
  }

  diffInfo.sort((a, b) => b.starAdd - a.starAdd);
  const result = joinRepoDetailByName(diffInfo, repoDetailDir);

  console.log(toPrettyJson(result));
  return result;
}

function getAddStarTop5Repo(
  previousRepoListPath,
  currentRepoListPath,
  repoDetailDir,
) {
  const previousRepoList = readJson(previousRepoListPath, []);
  const currentRepoList = readJson(currentRepoListPath, []);
  const diffInfo = [];

  for (const item of currentRepoList) {
    const previousItem = previousRepoList.find(
      (previous) => previous.name === item.name,
    );
    diffInfo.push({
      ...item,
      starAdd: item.star_count - (previousItem ? previousItem.star_count : 0),
    });
  }

  diffInfo.sort((a, b) => b.starAdd - a.starAdd);
  const result = joinRepoDetailByName(diffInfo.slice(0, 5), repoDetailDir);

  console.log(toPrettyJson(result));
  return result;
}

function getAddStarTop3NewRepo(
  previousRepoListPath,
  currentRepoListPath,
  repoDetailDir,
) {
  const previousRepoList = readJson(previousRepoListPath, []);
  const currentRepoList = readJson(currentRepoListPath, []);
  const previousRepoNames = previousRepoList
    .filter((repo) => repo.star_count > 10)
    .map((repo) => repo.name);
  const newRepoList = currentRepoList
    .filter((repo) => !previousRepoNames.includes(repo.name))
    .sort((a, b) => b.star_count - a.star_count);
  const top3NewRepo = joinRepoDetailByName(
    newRepoList,
    repoDetailDir,
    4,
  ).slice(0, 3);

  console.log(toPrettyJson(top3NewRepo));
  return top3NewRepo;
}

module.exports = {
  getAddStarTop3NewRepo,
  getAddStarTop5Repo,
  getRepoAddStarMoreThan1000,
  getRepoStarMoreThan1000,
  joinRepoDetailByName,
};
