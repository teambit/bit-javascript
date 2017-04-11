// @flow
import glob from 'glob';
import path from 'path';
import BitJson from '../bit-json';
import {
  VERSION_DELIMITER,
  ID_DELIMITER,
  DEFAULT_BUNDLE_FILENAME,
  DEFAULT_DIST_DIRNAME
}  from '../constants';

export function build(targetComponentsDir: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    const componentsMap = {};
    glob('*/*/*/*', { cwd: targetComponentsDir }, (err, files) => {
      if (err) return reject(err);
      files.forEach(dir => {
        const [box, name, scope, version] = dir.split(path.sep);
        const id = scope + ID_DELIMITER + box + ID_DELIMITER + name + VERSION_DELIMITER + version;
        const bitJson = BitJson.load(path.join(targetComponentsDir, dir));
        const dependencies = [];
        for (const dependency in bitJson.dependencies) {
          dependencies.push(dependency + VERSION_DELIMITER + bitJson.dependencies[dependency]);
        }
        componentsMap[id] = {
          loc: dir,
          file: bitJson.compiler ? path.join(DEFAULT_DIST_DIRNAME, DEFAULT_BUNDLE_FILENAME) : bitJson.impl,
          dependencies
        }
      });
      return resolve(componentsMap);
    });
  });
}
