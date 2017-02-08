const path = require('path');
const Consumer = require('../consumer/consumer');
const locateConsumer = require('../consumer/locate-consumer');
const parseBitFullId = require('../bit-id/parse-bit-full-id');
const resolveBit = require('./bit-resolver');
const { LATEST_VERSION } = require('../constants');
const findLatestVersion = require('../bit-id/find-latest-version');

module.exports = (fullId, opts) => {
  const callerDirectory = opts && opts.dir ? opts.dir : process.cwd();
  const consumerPath = locateConsumer(callerDirectory);
  const consumer = new Consumer(consumerPath);
  const { scope, box, name, version } =
  parseBitFullId({ id: fullId });

  let realVersion = version;
  if (!version || version === LATEST_VERSION) {
    realVersion = findLatestVersion({ scope, box, name, consumerPath });
  }

  const bitPath = path.join(consumer.getBitsDir(), box, name, scope, realVersion);
  return resolveBit(bitPath, opts);
};
