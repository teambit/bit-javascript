const compiler = require('vue-template-compiler');

const finalDependencies = {};
const addDependencies = (dependencies, isScript) => {
  let objDependencies = {};
  if (Array.isArray(dependencies)) {
    dependencies.forEach((dependency) => {
      objDependencies[dependency] = {};
    });
  } else {
    objDependencies = dependencies;
  }
  Object.keys(objDependencies).forEach((dependency) => {
    finalDependencies[dependency] = objDependencies[dependency];
    finalDependencies[dependency].isScript = isScript;
  });
};

module.exports = function(src, options = {}) {
  const precinct = require('../../precinct');
  options.useContent = true;
  const { script, styles } = compiler.parseComponent(src, { pad: 'line' });
  if (script) addDependencies(precinct(script.content, options), true);
  if (styles) {
    styles.map(style => addDependencies(precinct(style.content, { type: style.lang || 'scss' }), false ));
  }

  return finalDependencies;
};
