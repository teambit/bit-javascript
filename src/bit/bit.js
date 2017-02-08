const fs = require('fs');
const path = require('path');
const requireFromString = require('require-from-string');
const { NO_PLUGIN_TYPE } = require('../constants');
const BitJson = require('../bit-json');
const resolveFromFullId = require('../bit-resolver/resolve-from-full-id');

class Bit {
  constructor(bitPath, consumer) {
    this.bitJson = null;
    this.bitPath = bitPath;
    this.consumer = consumer;
  }

  getPath() {
    return this.bitPath;
  }

  getBitJson() {
    if (!this.bitJson) { return this.populateAndGetBitJson(); }

    return this.bitJson;
  }

  populateAndGetBitJson() {
    this.bitJson = BitJson.load(this.bitPath);
    return this.bitJson;
  }

  getImpl() {
    let implBasename;
    let compilerId;

    try {
      implBasename = this.getBitJson().getImpl();
    } catch (e) {
      implBasename = this.consumer.getBitJson().getImpl();
    }

    const implFilePath = path.join(this.getPath(), implBasename);

    try {
      compilerId = this.getBitJson().getCompiler();
    } catch (e) {
      try {
        compilerId = this.consumer.getBitJson().getCompiler();
      } catch (err) {
        compilerId = NO_PLUGIN_TYPE;
      }
    }

    if (compilerId === NO_PLUGIN_TYPE) return require(implFilePath); // eslint-disable-line

    const compiler = resolveFromFullId(compilerId, { dir: this.consumer.getPath() });
    const rawImpl = fs.readFileSync(implFilePath, 'utf8');
    return requireFromString(compiler.compile(rawImpl).code, implFilePath);
  }
}

module.exports = Bit;
