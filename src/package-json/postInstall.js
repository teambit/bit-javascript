const fs = require('fs');
const path = require('path');
const postInstallScriptName = 'bitBindings.js';

type LinkProps = {
  packagePath: string,
  indexName: string,
  fileContent: string
};
class LinkData {
  packagePath: string;
  indexName: string;
  fileContent: string;

  constructor( { packagePath, indexName, fileContent }: LinkProps) {
    this.packagePath = packagePath;
    this.indexName = indexName;
    this.fileContent = fileContent;
  }

  toString() {
    return JSON.stringify(this);
  }
}
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
arr.forEach(linkMetaData => { 
    mkdirp(path.join(__dirname,'node_modules', linkMetaData.packagePath));
    const filePath = path.join(__dirname,'node_modules', linkMetaData.packagePath, linkMetaData.indexName);
        fs.writeFileSync(filePath, linkMetaData.fileContent)
})`;

export default  function generatePostInstallScript (writeDir: string, linkMeta: Array<Object>) {
  const LinkArr = linkMeta.map(linkObj => new LinkData(linkObj));
  fs.writeFileSync(path.join(writeDir, postInstallScriptName), scriptTemplate(JSON.stringify(LinkArr)));
  return { postinstall : `node ${postInstallScriptName}` };
}
