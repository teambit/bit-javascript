// @flow
import glob from 'glob';
import path from 'path';
import BitJson from 'bit-scope-client/bit-json';
import { INLINE_COMPONENTS_DIRNAME } from '../constants';

export default class InlineComponentsMap {
  targetDir: string;
  projectBitJson: BitJson;

  constructor(targetDir: string, projectBitJson: BitJson) {
    this.targetDir = targetDir;
    this.projectBitJson = projectBitJson;
  }

  build(): Promise<InlineComponentsMap> {
    return new Promise((resolve, reject) => {
      glob('*/*', { cwd: this.targetDir }, (err, files) => {
        if (err) return reject(err);
        files.forEach((loc) => {
          const componentPath = path.join(this.targetDir, loc);
          const bitJson = BitJson.load(componentPath, this.projectBitJson);
          const requiredFile = bitJson.getRequiredFile();
          const compiler = bitJson.compiler;
          const dependencies = bitJson.getDependenciesArray();

          // validate Id
          // seperate version and Id
          // componentsMap[loc] = {
          //   { loc, file: requiredFile, compiler, dependencies }
          // };
        });
      });

      return resolve(this);
    });
  }

  static async create(projectRoot, projectBitJson): Promise<InlineComponentsMap> {
    const inlineComponentsDir = path.join(projectRoot, INLINE_COMPONENTS_DIRNAME);
    const map = new InlineComponentsMap(inlineComponentsDir, projectBitJson);
    return map.build();
  }
}
