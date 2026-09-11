const axios = require("axios");
const dayjs = require("dayjs");
const { CONFIG } = require("./fetchOrganizationConfig.js");

function parseMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return dayjs(new Date(year, month - 1, 1));
}

async function getGithubRepoByOrganizationName(
  organizationName = CONFIG.DATAWHALE_ORGANIZATION_NAME,
  token = CONFIG.GITHUB_TOKEN,
  ignoreRepoNameList = CONFIG.IGNORED_REPO_NAMES,
) {
  const output = [];
  let needNextPage = true;
  let page = 1;
  const pageSize = 100;

  while (needNextPage) {
    try {
      console.log(`fetch organization: ${organizationName}, page: ${page}`);
      const headers = {
        accept: "application/vnd.github+json",
      };

      if (token) {
        headers.authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `https://api.github.com/orgs/${organizationName}/repos`,
        {
          headers,
          params: {
            per_page: pageSize,
            page,
          },
        },
      );
      const data = response.data;

      for (const item of data) {
        if (ignoreRepoNameList.includes(item.name)) {
          continue;
        }
        output.push({
          name: item.full_name,
          star_count: item.stargazers_count,
        });
      }

      needNextPage = data.length === pageSize;
      page += 1;
    } catch (error) {
      throw new Error(
        `fetch organization error: ${organizationName}, page: ${page}, ${formatAxiosError(error)}`,
      );
    }
  }

  return output.sort((a, b) => b.star_count - a.star_count);
}

async function getGithubStarCount(
  organizationName = CONFIG.DATAWHALE_ORGANIZATION_NAME,
  repo,
  token = CONFIG.GITHUB_TOKEN,
  monthlyStars = {},
  monthlyTotalStars = {},
  starCount = 0,
) {
  if (token) {
    return fetchGithubStarCountByHistory(organizationName, repo, token);
  }

  const output = {
    repo_name: repo,
    monthly_stars: { ...monthlyStars },
    monthly_total_stars: { ...monthlyTotalStars },
    star_count: starCount,
  };

  let startUpdateDate = parseMonthKey("2010-1");
  const monthlyTotalKeys = Object.keys(output.monthly_total_stars);

  if (monthlyTotalKeys.length > 1) {
    const needDeleteKey = monthlyTotalKeys[monthlyTotalKeys.length - 1];
    output.star_count =
      output.monthly_total_stars[monthlyTotalKeys[monthlyTotalKeys.length - 2]];
    startUpdateDate = parseMonthKey(needDeleteKey);
    delete output.monthly_total_stars[needDeleteKey];
    delete output.monthly_stars[needDeleteKey];
  } else {
    output.star_count = 0;
    output.monthly_stars = {};
    output.monthly_total_stars = {};
  }

  let needNextPage = true;
  const pageSize = 100;
  let page = Math.floor(output.star_count / pageSize) + 1;
  let totalStars = output.star_count;

  while (needNextPage) {
    try {
      console.log(`fetch repo: ${repo}, page: ${page}`);
      const headers = {
        accept: "application/vnd.github.v3.star+json",
      };

      if (token) {
        headers.authorization = `token ${token}`;
      }

      const response = await axios.get(
        `https://api.github.com/repos/${organizationName}/${repo}/stargazers`,
        {
          headers,
          params: {
            per_page: pageSize,
            page,
          },
        },
      );
      const data = response.data;

      for (const item of data) {
        const date = dayjs(item.starred_at);
        if (date.isBefore(startUpdateDate)) {
          continue;
        }

        totalStars += 1;
        const monthKey = `${date.year()}-${date.month() + 1}`;
        output.monthly_stars[monthKey] =
          (output.monthly_stars[monthKey] || 0) + 1;
        output.monthly_total_stars[monthKey] = totalStars;
      }

      needNextPage = data.length === pageSize;
      page += 1;
    } catch (error) {
      throw new Error(
        `fetch repo error: ${repo}, page: ${page}, ${formatAxiosError(error)}`,
      );
    }
  }

  output.star_count = totalStars;
  return output;
}

async function fetchGithubStarCountByHistory(
  organizationName,
  repo,
  token,
) {
  if (!token) {
    throw new Error(
      `fetch repo error: ${repo}, star history requires GitHub token`,
    );
  }

  const weeksByTimestamp = new Map();
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      console.log(`fetch repo history: ${repo}, page: ${page}`);
      const response = await axios.get(
        `https://api.github.com/repos/${organizationName}/${repo}/stargazers/history`,
        {
          headers: {
            accept: "application/vnd.github+json",
            authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2026-03-10",
          },
          params: {
            per_page: 100,
            page,
          },
        },
      );

      for (const week of response.data) {
        weeksByTimestamp.set(week.week, week);
      }

      hasNextPage = /rel="next"/.test(response.headers.link || "");
      page += 1;
    } catch (error) {
      throw new Error(
        `fetch repo history error: ${repo}, page: ${page}, ${formatAxiosError(error)}`,
      );
    }
  }

  const output = {
    repo_name: repo,
    monthly_stars: {},
    monthly_total_stars: {},
    star_count: 0,
  };
  const weeks = [...weeksByTimestamp.values()].sort(
    (left, right) => left.week - right.week,
  );

  for (const week of weeks) {
    const days = Array.isArray(week.days) ? week.days : [];
    const calculatedWeekTotal = days.reduce((sum, count) => sum + count, 0);
    if (calculatedWeekTotal !== week.total) {
      throw new Error(
        `fetch repo history error: ${repo}, week ${week.week} total mismatch`,
      );
    }

    for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
      const count = days[dayIndex];
      if (count === 0) {
        continue;
      }

      const date = new Date((week.week + dayIndex * 24 * 60 * 60) * 1000);
      const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      output.star_count += count;
      output.monthly_stars[monthKey] =
        (output.monthly_stars[monthKey] || 0) + count;
      output.monthly_total_stars[monthKey] = output.star_count;
    }
  }

  return output;
}

function fillMissingMonths(input, key) {
  const endDate = parseMonthKey(key);
  const starDateList = Object.keys(input.monthly_stars);

  if (starDateList.length === 0) {
    return input;
  }

  const startDate = parseMonthKey(starDateList[0]);
  const output = {
    repo_name: input.repo_name,
    monthly_stars: {},
    monthly_total_stars: {},
    star_count: input.star_count,
  };
  let previousKey = `${startDate.year()}-${startDate.month() + 1}`;

  for (let year = startDate.year(); year <= endDate.year(); year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      if (year === startDate.year() && month < startDate.month() + 1) {
        continue;
      }
      if (year === endDate.year() && month > endDate.month() + 1) {
        break;
      }

      const dateStr = `${year}-${month}`;
      if (!(dateStr in input.monthly_stars)) {
        input.monthly_stars[dateStr] = 0;
      }
      if (!(dateStr in input.monthly_total_stars)) {
        input.monthly_total_stars[dateStr] =
          input.monthly_total_stars[previousKey];
      }

      output.monthly_stars[dateStr] = input.monthly_stars[dateStr];
      output.monthly_total_stars[dateStr] =
        input.monthly_total_stars[dateStr];
      previousKey = dateStr;
    }
  }

  return output;
}

async function fetchOrganizationRepoDetail(
  originRepoDetailList = [],
  monthKey = CONFIG.CURRENT_KEY,
) {
  const organizationName = CONFIG.DATAWHALE_ORGANIZATION_NAME;
  const token = CONFIG.GITHUB_TOKEN;
  const ignoreRepoNameList = CONFIG.IGNORED_REPO_NAMES;
  const repoList = await getGithubRepoByOrganizationName(
    organizationName,
    token,
    ignoreRepoNameList,
  );
  console.log(`${organizationName} repo_list:`, repoList);
  if (repoList.length === 0) {
    throw new Error(`fetch organization repo list is empty: ${organizationName}`);
  }

  const repoDetailList = [];
  for (const repo of repoList) {
    const repoName = repo.name.split("/")[1];
    if (ignoreRepoNameList.includes(repoName)) {
      continue;
    }

    const originDetail = originRepoDetailList.find(
      (detail) => detail.repo_name === repoName,
    );
    const output = await getGithubStarCount(
      organizationName,
      repoName,
      token,
      originDetail ? originDetail.monthly_stars : {},
      originDetail ? originDetail.monthly_total_stars : {},
      originDetail ? originDetail.star_count : 0,
    );
    const filledOutput = fillMissingMonths(output, monthKey);
    repoDetailList.push(filledOutput);
    console.log(`${organizationName} ${repoName} repo_detail:`, filledOutput);
  }

  repoDetailList.sort((a, b) => b.star_count - a.star_count);

  return {
    repo_list: repoList,
    repo_detail_list: repoDetailList,
  };
}

function formatAxiosError(error) {
  if (!error.response) {
    return error.message;
  }

  const payload =
    typeof error.response.data === "string"
      ? error.response.data
      : JSON.stringify(error.response.data);

  return `status: ${error.response.status}, body: ${payload}`;
}

module.exports = {
  fetchOrganizationRepoDetail,
  fetchGithubStarCountByHistory,
  fillMissingMonths,
  formatAxiosError,
  getGithubRepoByOrganizationName,
  getGithubStarCount,
  parseMonthKey,
};
