// @flow
import R from 'ramda';
import importComponents from 'bit-scope-client';
import path from 'path';
import responseMock from './response-mock';
import modelOnFs from './model-on-fs';
// import locateConsumer from '../consumer/locate-consumer';
import BitJson from '../bit-json';
import { MODULE_NAME, MODULES_DIR, COMPONENTS_DIRNAME } from '../constants';
import * as componentsMap from './components-map';
import fs from 'fs-extra';

 // TODO - inject bitJson instead of load it
export const readIdsFromBitJson = (consumerPath: string) =>
  new Promise((resolve, reject) => {
    try {
      const bitJson = BitJson.load(consumerPath);
      const dependencies = bitJson.getDependenciesArray();
      resolve(dependencies);
    } catch (e) { reject(e); }
  });

// TODO - inject bitJson instead of load it
export function getIdsFromBitJsonIfNeeded(componentIds: string[], consumerPath: string):
Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!componentIds || R.isEmpty(componentIds)) {
      return readIdsFromBitJson(consumerPath)
      .then((ids) => {
        if (!ids || R.isEmpty(ids)) return resolve([]);
        return resolve(ids);
      }).catch(reject);
    }

    return resolve(componentIds);
  });
}

function writeFile(file, content) {
  return new Promise((resolve, reject) => {
    fs.outputFile(file, content, (err) => {
      if (err) return reject(err);
      resolve();
    })
  });
}

export const createDependencyLinks = (targetComponentsDir, map) => {
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
};

export const createPublicApi = (targetModuleDir, map, projectBitJson) => {
  // TODO - implement
  return Promise.resolve();
};

export default (componentIds: string[]) => {
  // TODO - replace with cwd this is mock
  // const projectRoot = '/Users/ran/bit-playground/consumers/test-bit-js' || process.cwd();
  const projectRoot = process.cwd();
  const targetModuleDir = path.join(projectRoot, MODULES_DIR, MODULE_NAME);
  const targetComponentsDir = path.join(projectRoot, COMPONENTS_DIRNAME);
  const projectBitJson = BitJson.load(projectRoot);

  return getIdsFromBitJsonIfNeeded(componentIds, projectRoot)
  .then((ids) => { // eslint-disable-line
    // return importComponents(ids);
    return Promise.resolve(responseMock); // mock - replace to the real importer
  })
  .then((responses) => {
    const componentDependenciesArr = R.unnest(responses.map(R.prop('payload')));
    return modelOnFs(componentDependenciesArr, targetComponentsDir);
  })
  .then(() => componentsMap.build(targetComponentsDir))
  .then(map => createDependencyLinks(targetComponentsDir, map))
  .then(map => createPublicApi(targetModuleDir, map, projectBitJson));
};
