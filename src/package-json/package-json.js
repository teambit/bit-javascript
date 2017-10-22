/** @flow */
import fs from 'fs-extra';
import R from 'ramda';
import path from 'path';
import { PackageJsonAlreadyExists, PackageJsonNotFound } from '../exceptions';
import { PACKAGE_JSON } from '../constants';

function composePath(componentRootFolder: string) {
  return path.join(componentRootFolder, PACKAGE_JSON);
}

function ConvertComponenstsToValidPackageNames(registryPrefix: string, bitDependencies: Object): Object {
  const obj = {};
  if (R.isEmpty(bitDependencies) || R.isNil(bitDependencies)) return obj;
  Object.keys(bitDependencies).forEach(key => {
    var name = key.replace(/\//g, '.');
    obj[name] = `${registryPrefix}/${name}/-/${name}-${bitDependencies[key]}.tgz`;
  });
  return obj;
}
function hasExisting(componentRootFolder: string, throws?: boolean = false): boolean {
  const packageJsonPath = composePath(componentRootFolder);
  const exists = fs.pathExistsSync(packageJsonPath);
  if (!exists && throws) {
    throw (new PackageJsonNotFound(packageJsonPath));
  }
  return exists;
}

const PackageJsonPropsNames = ['name', 'version', 'homepage', 'main', 'dependencies', 'devDependencies', 'peerDependencies', 'license'];

export type PackageJsonProps = {
  name?: string,
  version?: string,
  homepage?: string,
  main?: string,
  dependencies?: Object,
  devDependencies?: Object,
  peerDependencies?: Object,
  license?:string,
  bitDependencies?: Object,
};

export default class PackageJson {
  name: string;
  version: string;
  homepage: string;
  main: string;
  dependencies: Object;
  devDependencies: Object;
  peerDependencies: Object;
  componentRootFolder: string; // path where to write the package.json
  license: string;



  constructor(componentRootFolder: string, { name, version, homepage, main, dependencies, devDependencies, peerDependencies, license, registryPrefix, bitDependencies }: PackageJsonProps) {
    this.name = name;
    this.version = version;
    this.homepage = homepage;
    this.main = main;
    this.dependencies = Object.assign({}, dependencies, ConvertComponenstsToValidPackageNames(registryPrefix, bitDependencies));
    this.devDependencies = devDependencies;
    this.peerDependencies = peerDependencies;
    this.componentRootFolder = componentRootFolder;
    this.license = license;
  }

  toPlainObject(): Object {
    const self = this;
    const result = {};
    const addToResult = (propName) => {
      result[propName] = self[propName];
    };

    R.forEach(addToResult, PackageJsonPropsNames);
    return result;
  }

  toJson(readable: boolean = true) {
    if (!readable) return JSON.stringify(this.toPlainObject());
    return JSON.stringify(this.toPlainObject(), null, 4);
  }

  async write({ override = true }: { override?: boolean }): Promise<boolean> {
    if (!override && hasExisting(this.componentRootFolder)) {
      return Promise.reject(new PackageJsonAlreadyExists(this.componentRootFolder));
    }

    const plain = this.toPlainObject();

    return fs.outputJSON(composePath(this.componentRootFolder), plain, { spaces: '\t' });
  }

  static create(componentRootFolder: string): PackageJson {
    return new PackageJson(componentRootFolder, {});
  }

  static ensure(componentRootFolder): Promise<PackageJson> {
    return this.load(componentRootFolder);
  }

  static fromPlainObject(componentRootFolder: string, object: Object) {
    return new PackageJson(componentRootFolder, object);
  }

  static load(componentRootFolder: string): Promise<PackageJson> {
    const THROWS = true;
    const composedPath = composePath(componentRootFolder);
    hasExisting(composedPath, THROWS);
    return fs.readJson(composePath(composedPath));
  }
}
