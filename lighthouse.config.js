const parser = require("fast-xml-parser");
const fs = require("fs");

const data = fs.readFileSync("./_site/sitemap.xml", "utf-8");
const urls = parser.parse(data).urlset.url;

const urlsToTest = urls
  .sort((a, b) => {
    const dateA = new Date(a.lastmod);
    const dateB = new Date(b.lastmod);
    return dateA > dateB ? -1 : 1;
  })
  .slice(0, 3)
  .map((url) => url.loc.replace("https://blog.atomrc.dev", ""));

const config = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      url: urlsToTest,
      serverBaseUrl: "https://blog.atomrc.dev",
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        canonical: "off",
        "max-potential-fid": "off",
        "uses-long-cache-ttl": "off",
        "csp-xss": "off",
        "color-contrast ": "warn",
      },
    },
  },
};

console.log("generated config", JSON.stringify(config, null, 4));
module.exports = config;
