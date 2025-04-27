const ensureDirAndWriteFile = (filePath, data) => {
    fse.ensureDirSync(path.dirname(filePath));
    fse.writeFileSync(filePath, data);
}

module.exports = {
    ensureDirAndWriteFile
}
