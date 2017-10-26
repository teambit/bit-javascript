const fs = require('fs');
const path = require('path');

const postInstallScriptName = 'bitBindings.js';

const scriptTemplate = (data) => `const fs = require('fs');
const path = require('path');
const arr = ${data}
function mkdirp(filepath) {
    var dirname = path.dirname(filepath);
    if (!fs.existsSync(dirname)) {
        mkdirp(dirname);
    }
    fs.mkdirSync(filepath);
} 
arr.forEach(stringObj => {
    const link = JSON.parse(stringObj)    
    mkdirp(path.join(__dirname,'node_modules', link.packagePath));
    const filePath = path.join(__dirname,'node_modules', link.packagePath, link.indexName);
        fs.writeFileSync(filePath, link.fileContent)
})`;

export default  function generatePostInstallScript (writeDir: string, linkArrays: Array<Object>) {
  const linkArray = linkArrays.map(linkObj => JSON.stringify(linkObj))
  fs.writeFileSync(path.join(writeDir, postInstallScriptName), scriptTemplate(JSON.stringify(linkArray)));
  return { postinstall : `node ${postInstallScriptName}` } ;
}
