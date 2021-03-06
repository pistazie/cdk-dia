tsc --declarationDir ./dist --outDir ./dist
cp package.json dist
cp -r icons dist
cp src/diagram/aws/awsResouceIconMatches.json dist/src/diagram/aws/awsResouceIconMatches.json
cd README.md dist