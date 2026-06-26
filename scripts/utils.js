const fs = require("fs-extra");
const dayjs = require("dayjs");

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`文件未找到: ${filePath}`);
      return null;
    }
    throw error;
  }
}

function readJson(filePath, fallback = null) {
  const content = readFile(filePath);
  if (content === null) {
    return fallback;
  }
  return JSON.parse(content);
}

function ensureDirAndWriteFile(filePath, data) {
  console.log(`写入文件: ${filePath}`);
  fs.ensureDirSync(require("path").dirname(filePath));
  fs.writeFileSync(filePath, data, "utf8");
}

function ensureDirAndWriteFiles(filePathList, data) {
  for (const filePath of filePathList) {
    ensureDirAndWriteFile(filePath, data);
  }
}

function getObjectByMonthKey(monthObject, monthCount = 12) {
  const result = {};
  const monthKeys = [];
  let cursor = dayjs();

  for (let index = 0; index < monthCount; index += 1) {
    monthKeys.push(`${cursor.year()}-${cursor.month() + 1}`);
    cursor = cursor.subtract(1, "month");
  }

  monthKeys.reverse();

  for (const month of monthKeys) {
    result[month] = monthObject[month] || 0;
  }

  return result;
}

function toPrettyJson(data) {
  return JSON.stringify(data, null, 2);
}

module.exports = {
  ensureDirAndWriteFile,
  ensureDirAndWriteFiles,
  getObjectByMonthKey,
  readFile,
  readJson,
  toPrettyJson,
};
