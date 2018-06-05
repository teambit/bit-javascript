/**
* this file had been forked from https://github.com/dependents/node-detective-es6
*/

var Walker = require('node-source-walk');

/**
 * Extracts the dependencies of the supplied es6 module
 *
 * @param  {String|Object} src - File's content or AST
 * @return {String[]}
 */
module.exports = function(src, options) {
  var walker = new Walker();

  var dependencies = [];

  if (typeof src === 'undefined') { throw new Error('src not given'); }

  if (src === '') {
    return dependencies;
  }

  var importSpecifiers = {};
  walker.walk(src, function(node) {
    switch (node.type) {
      case 'ImportDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
          node.specifiers.forEach((specifier) => {
            var specifierValue = {
              isDefault: specifier.type === 'ImportDefaultSpecifier',
              name: specifier.local.name
            };
            importSpecifiers[node.source.value]
              ? importSpecifiers[node.source.value].push(specifierValue)
              : importSpecifiers[node.source.value] = [specifierValue];
          });
        }
        break;
      case 'ExportNamedDeclaration':
      case 'ExportAllDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
          node.specifiers.forEach((specifier) => {
            var specifierValue = {
              isDefault: !specifier.local || specifier.local.name === 'default', // e.g. export { default as isArray } from './is-array';
              name: specifier.exported.name
            };
            importSpecifiers[node.source.value]
              ? importSpecifiers[node.source.value].push(specifierValue)
              : importSpecifiers[node.source.value] = [specifierValue];
          });
        }
        break;
      case 'CallExpression':
        if (node.callee.type === 'Import' && node.arguments.length) {
          dependencies.push(node.arguments[0].value);
        }
        if (node.callee.type === 'Identifier' // taken from detective-cjs
        && node.callee.name === 'require'
        && node.arguments
        && node.arguments.length
        && (node.arguments[0].type === 'Literal' || node.arguments[0].type === 'StringLiteral')) {
          dependencies.push(node.arguments[0].value);
        }
        break;
      case 'MemberExpression':
        if (node.object.type === 'CallExpression'
         && node.object.callee.type === 'Identifier'
         && node.object.callee.name === 'require'
         && node.object.arguments
         && node.object.arguments.length
         && (node.object.arguments[0].type === 'Literal' || node.object.arguments[0].type === 'StringLiteral')
        ) {
          const depValue = node.object.arguments[0].value;
          dependencies.push(depValue);
          if (node.property && node.property.type === 'Identifier' && node.parent.type === 'VariableDeclarator') {
            const specifierValue = {
              isDefault: node.property.name === 'default', // e.g. const isString = require('../utils').default
              name: node.parent.id.name
            };
            importSpecifiers[depValue]
              ? importSpecifiers[depValue].push(specifierValue)
              : importSpecifiers[depValue] = [specifierValue];
          }
          if (node.property && node.property.type === 'Identifier'
            && node.parent.type === 'AssignmentExpression'
            && node.parent.left === 'MemberExpression'
            && node.parent.left.object === 'MemberExpression'
            && node.parent.left.object.object.type === 'Identifier'
            && node.parent.left.object.object.name === 'module'
            && node.parent.left.property.type === 'Identifier'
           ) {
            const specifierValue = {
              isDefault: node.property.name === 'default', // e.g. module.exports.DraggableCore = require('./lib/DraggableCore').default;
              name: node.parent.left.property.name
            };
            importSpecifiers[depValue]
              ? importSpecifiers[depValue].push(specifierValue)
              : importSpecifiers[depValue] = [specifierValue];

          }
        }
        break;
      default:
        break;
    }
  });

  options.importSpecifiers = importSpecifiers;
  return dependencies;
};
