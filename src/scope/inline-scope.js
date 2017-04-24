// @flow
import path from 'path';
import { BIT_HIDDEN_DIR } from '../constants';
import { readFileP } from '../utils';

const projectRoot = process.cwd();

export default class InlineScope {
  constructor(scopeJson: Object) {
    this.scopeJson = scopeJson;
  }

  static loadScopeJson(): Promise<Object> {
    const scopeJsonPath = path.join(projectRoot, BIT_HIDDEN_DIR, 'scope.json');
    return readFileP(scopeJsonPath).then(data => JSON.parse(data));
  }

  getScopeName(): string {
    return this.scopeJson.name;
  }

  static load(): Promise<InlineScope> {
    return new Promise((resolve, reject) => {
      this.loadScopeJson()
        .then(scopeJson => resolve(new InlineScope(scopeJson)))
        .catch(err => reject(err));
    });
  }
}
