import fs from 'fs-extra';
import path from 'path';
import { MODULE_NAME, MODULES_DIR, COMPONENTS_DIRNAME, VERSION_DELIMITER } from '../constants';

function writeFile(file, content) {
  return new Promise((resolve, reject) => {
    fs.outputFile(file, content, (err) => {
      if (err) return reject(err);
      resolve();
    })
  });
}

export function dependencies(targetComponentsDir, map) {
  return new Promise((resolve, reject) => {
    const promises = [];
    for (const component in map) {
      if (!map[component].dependencies) continue;
      const targetModuleDir = path.join(targetComponentsDir, map[component].loc, MODULES_DIR, MODULE_NAME);
      map[component].dependencies.forEach(dependency => {
        const [box, name] = map[dependency].loc.split(path.sep);
        const targetFile = path.join(box, name, 'index.js');
        const targetDir = path.join(targetModuleDir, targetFile);
        const relativeComponentsDir = path.join('..', '..', '..', '..', '..', '..', '..', '..');
        const dependencyDir = path.join(relativeComponentsDir, map[dependency].loc, map[dependency].file);
        const template = `module.exports = require('${dependencyDir}');`;
        promises.push(writeFile(targetDir, template));
      });
    }
    Promise.all(promises).then(() => resolve(map)).catch(reject);
  });
}

export function publicApi(targetModuleDir, map, projectBitJson) {
  return Promise.all(Object.keys(projectBitJson.dependencies).map(id => {
    const [, box, name] = id.split(path.sep);
    const targetDir = path.join(targetModuleDir, box, name, 'index.js');
    const mapId = id + VERSION_DELIMITER + projectBitJson.dependencies[id];
    const relativeComponentsDir = path.join('..', '..', '..', '..', COMPONENTS_DIRNAME);
    const dependencyDir = path.join(relativeComponentsDir, map[mapId].loc, map[mapId].file);
    const template = `module.exports = require('${dependencyDir}');`;
    return writeFile(targetDir, template);
  }));
}
