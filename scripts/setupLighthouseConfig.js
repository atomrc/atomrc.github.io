const parser = require("fast-xml-parser");
const fs = require("fs");
const lighthouseConfig = require("../.lighthouserc.json");

const data = fs.readFileSync("./_site/sitemap.xml", "utf-8");
const urls = parser.parse(data).urlset.url;

const urlsToTest = urls
  .sort((a, b) => {
    const dateA = new Date(a.lastmod);
    const dateB = new Date(b.lastmod);
    return dateA > dateB ? -1 : 1;
  })
  .slice(0, 5).map((url) => url.loc.replace("https://blog.atomrc.dev", ""));

lighthouseConfig.ci.collect.url = urlsToTest;
fs.writeFileSync('./.lighthouserc.json', JSON.stringify(lighthouseConfig));
console.log('ok');
