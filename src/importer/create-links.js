import fs from 'fs-extra';
import path from 'path';
import { MODULE_NAME, MODULES_DIR, COMPONENTS_DIRNAME, VERSION_DELIMITER, ID_DELIMITER } from '../constants';

const linkTemplate = (link) => `module.exports = require('${link}');`;
const componentToString = (component) => {
  return component.scope + ID_DELIMITER + component.box + ID_DELIMITER + component.name
    + VERSION_DELIMITER + component.version;
};

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
        const template = linkTemplate(dependencyDir);
        promises.push(writeFile(targetDir, template));
      });
    }
    Promise.all(promises).then(() => resolve(map)).catch(reject);
  });
}

export function publicApi(targetModuleDir, map, components) {
  return Promise.all(components.map(({ component }) => {
    const targetDir = path.join(targetModuleDir, component.box, component.name, 'index.js');
    const mapId = componentToString(component);
    const relativeComponentsDir = path.join('..', '..', '..', '..', COMPONENTS_DIRNAME);
    const dependencyDir = path.join(relativeComponentsDir, map[mapId].loc, map[mapId].file);
    const template = linkTemplate(dependencyDir);
    return writeFile(targetDir, template);
  }));
}
