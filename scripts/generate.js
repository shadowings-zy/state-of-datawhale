const m1 = require("./data/organizationDetail/2024-1.json");
const m5 = require("./data/organizationDetail/2024-5.json");
const m9 = require("./data/organizationDetail/2024-9.json");
const m12 = require("./data/organizationDetail/2024-12.json");
const repoDetail = require("./data/repo.json");
const fs = require("fs");
const path = require("path");

const organizationName = [
  "freeCodeCamp",
  "TheAlgorithms",
  "EbookFoundation",
  "ossu",
  "h5bp",
  "doocs",
  "jobbole",
  "dair-ai",
  "papers-we-love",
  "datawhalechina",
];

const key2024 = ["2024-1", "2024-2", "2024-3", "2024-4", "2024-5", "2024-6", "2024-7", "2024-8", "2024-9", "2024-10", "2024-11", "2024-12"];

// 生成组织在知识分享类组织的内部排名
const generateOrganizationInnerRank = () => {
  const output = organizationName.map((item) => {
    return {
      key: item,
      value: [],
    };
  });
  for (const month of [m1, m5, m9, m12]) {
    const sortedMonth = month.sort((a, b) => a.rank - b.rank);
    for (let a = 0; a < sortedMonth.length; a++) {
      const organization = sortedMonth[a];
      const target = output.find((item) => item.key === organization.name);
      target.value.push(a + 1);
    }
  }
  return output;
};

// 生成组织的所有排名
const generateOrganizationRank = () => {
  const output = organizationName.map((item) => {
    return {
      key: item,
      value: [],
    };
  });
  for (const month of [m1, m5, m9, m12]) {
    const sortedMonth = month.sort((a, b) => a.rank - b.rank);
    for (let a = 0; a < sortedMonth.length; a++) {
      const organization = sortedMonth[a];
      const target = output.find((item) => item.key === organization.name);
      target.value.push(organization.rank);
    }
  }
  return output;
};

const generateRepoDetailData = () => {
  const repoNameList = repoDetail.map((item) => {
    return item.name.replace("datawhalechina/", "");
  });
  // 根据repoNameList读取对应的json
  const repoDetailData = repoNameList.map((item) => {
    const jsonPath = path.join(__dirname, `./data/repoDetail/${item}.json`);
    const jsonData = require(jsonPath);
    const monthlyStars = Object.keys(jsonData.monthlyStars).reduce((acc, month) => {
      if (key2024.includes(month)) {
        acc[month] = jsonData.monthlyStars[month];
      }
      return acc;
    }, {});
    const monthlyTotalStars = Object.keys(jsonData.monthlyTotalStars).reduce((acc, month) => {
      if (key2024.includes(month)) {
        acc[month] = jsonData.monthlyTotalStars[month];
      }
      return acc;
    }, {});

    return {
      name: item,
      monthlyStars: monthlyStars,
      monthlyTotalStars: monthlyTotalStars,
    };
  });

  return repoDetailData;
};

const main = async () => {
  const innerRank = generateOrganizationInnerRank();
  const rank = generateOrganizationRank();
  const repoDetailData = generateRepoDetailData();
  console.log(innerRank);
  console.log(rank);
  console.log(repoDetailData);
};

main();
