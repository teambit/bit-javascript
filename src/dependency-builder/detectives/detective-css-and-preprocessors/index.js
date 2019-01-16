// forked and changed from https://github.com/dependents/node-detective-sass
const csstree = require('css-tree');

/**
 * Extract the @import statements from a given file's content
 *
 * @param  {String} fileContent
 * @param  {String} syntax, can be one of the following: css, less, sass, scss.
 * @return {String[]}
 */
module.exports = function detective(fileContent, syntax) {
  const debug = require('debug')(`detective-${syntax}`);
  debug(`parsing ${syntax} syntax`);
  if (typeof fileContent === 'undefined') {
    throw new Error('content not given');
  }
  if (typeof fileContent !== 'string') {
    throw new Error('content is not a string');
  }

  let dependencies = [];

  const ast = csstree.parse(fileContent, {
    onParseError(error) {
      handleError(error);
    }
  });

  detective.ast = ast;

  csstree.walk(ast, function (node) {
    if (!isImportStatement(node)) {
      return;
    }

    dependencies = dependencies.concat(extractDependencies(node));
  });
  return dependencies;
};

function isImportStatement(node) {
  if (node.type === 'Atrule' && node.name === 'import') {
    return true;
  }
  return false;
}

function extractDependencies(importStatementNode) {
  // handle URL import @import url("baz.css");
  if (
    importStatementNode.prelude.type === 'AtrulePrelude' &&
    importStatementNode.prelude.children.tail.data.type === 'Url'
  ) {
    return importStatementNode.prelude.children.tail.data.value.value.replace(/["']/g, '');
  }

  // simple @import
  if (
    importStatementNode.prelude.type === 'AtrulePrelude' &&
    importStatementNode.prelude.children &&
    importStatementNode.prelude.children.tail.data.type !== 'Url'
  ) {
    return importStatementNode.prelude.children.tail.data.value.replace(/["']/g, '');
  }

  // allows imports with no semicolon
  if (importStatementNode.prelude.type === 'Raw' && importStatementNode.prelude.value.includes('@import')) {
    let imports = importStatementNode.prelude.value.split('@import');
    imports = imports.map((imp) => {
      return imp
        .replace(/["']/g, '')
        .replace(/\n/g, '')
        .replace(/\s/g, '');
    });

    return imports;
  }

  // handles comma-separated imports
  if (importStatementNode.prelude.type === 'Raw' && importStatementNode.prelude.value.includes(',')) {
    let imports = importStatementNode.prelude.value.split(',');
    imports = imports.map((imp) => {
      return imp
        .replace(/["']/g, '')
        .replace(/\n/g, '')
        .replace(/\s/g, '');
    });

    return imports;
  }

  // returns the dependencies of the given .sass file content
  if (importStatementNode.prelude.type === 'Raw') {
    return importStatementNode.prelude.value;
  }
  return [];
}

function handleError(error) {
  // allows imports with no semicolon
  if (error.message === 'Semicolon or block is expected') {
    return false;
  }
  // ignore Colon is expected error
  if (error.message === 'Colon is expected') {
    return false;
  }

  // String or url() is expected error
  if (error.message === 'String or url() is expected') {
    return false;
  }

  throw new Error(error.message);
}
