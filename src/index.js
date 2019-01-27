import 'regenerator-runtime/runtime';
import {
  getDependencyTree,
  resolveNodePackage,
  resolveModulePath,
  getDependenciesFromSource
} from './dependency-builder';
import { npmLogin } from './registry';
import PackageJson from './package-json/package-json';

module.exports = {
  getDependencyTree,
  resolveNodePackage,
  resolveModulePath,
  PackageJson,
  npmLogin,
  getDependenciesFromSource
};
