import path from 'path';
import fs from 'fs-extra';
import childProcessP from 'child-process-promise';

const exec = childProcessP.exec

export default async function pack(cwd: string, outputPath: string): string {
  const pjson = require(path.join(cwd,'package.json'));
  const tgzName = `${pjson.name}-${pjson.version}.tgz`;
  const tgzOriginPath = path.join(cwd, tgzName)
  const tgzDestinationPath = path.join(outputPath, tgzName);

  await exec('npm pack', { cwd })
  await fs.move(tgzOriginPath, tgzDestinationPath)
  return tgzDestinationPath;
}
