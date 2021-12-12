import fs from 'fs';
import rimraf from 'rimraf';

module.exports = async () => {
    const basePath = `${process.cwd()}/test-generated`
    rimraf.sync(basePath)
    fs.mkdirSync(basePath)
};

