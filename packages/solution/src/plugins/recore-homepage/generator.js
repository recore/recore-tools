const fs = require('fs');
const hbs = require('handlebars');

function generator(templatePath, {
  appjs, appcss, recorejs,
}) {
  const templateContent = fs.readFileSync(templatePath);
  const template = hbs.compile(templateContent.toString());
  const result = template({
    recorejs,
    appjs,
    appcss,
  });

  return result;
}

module.exports = generator;
