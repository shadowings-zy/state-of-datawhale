const organizationList = require("./data/organization.json");
const fs = require("fs");
const path = require("path");

const main = async () => {
  const targetName = [
    "freeCodeCamp",
    "TheAlgorithms",
    "EbookFoundation",
    "ossu",
    "doocs",
    "h5bp",
    "datawhalechina",
    "dair-ai",
    "jobbole",
    "papers-we-love",
  ];

  const output = organizationList.filter((item) =>
    targetName.includes(item.name)
  );
  fs.writeFileSync(
    path.join(__dirname, `./data/targetOrganization.json`),
    JSON.stringify(output)
  );
  console.log(output);
};

main();
