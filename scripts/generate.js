const m1 = require("./data/organizationDetail/2024-1.json");
const m5 = require("./data/organizationDetail/2024-5.json");
const m9 = require("./data/organizationDetail/2024-9.json");
const m12 = require("./data/organizationDetail/2024-12.json");

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

const main = async () => {
  const innerRank = generateOrganizationInnerRank();
  const rank = generateOrganizationRank();
  console.log(innerRank);
  console.log(rank);
};

main();
