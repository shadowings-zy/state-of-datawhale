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
  let output = [];
  for (let i = 1; i <= 2; i++) {
    const result = await getOrganizationList(i);
    output = [...output, ...result];
  }
  output = output
    .sort((a, b) => b.starCount - a.starCount)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  fs.writeFileSync(
    path.join(__dirname, `./data/allOrganization.json`),
    JSON.stringify(output)
  );
  console.log(output);
};

main();
