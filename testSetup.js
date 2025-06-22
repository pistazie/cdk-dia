import fs from 'fs';

module.exports = async () => {
    const basePath = `${process.cwd()}/test-generated`
    fs.rmSync(basePath,{ recursive: true, force: true });
    fs.mkdirSync(basePath)
};

