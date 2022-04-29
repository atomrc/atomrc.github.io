const schema = require("@quasibit/eleventy-plugin-schema");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const config = require("./_data/config");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const CleanCSS = require("clean-css");

const favicon = require("eleventy-favicon");

module.exports = function (eleventyConfig) {
  const markdownLib = markdownIt({ html: true }).use(markdownItAnchor);
  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.setLiquidOptions({ dynamicPartials: false });
  eleventyConfig.addPassthroughCopy({ "_root/*": "/" });
  eleventyConfig.addPassthroughCopy("css/**/*.css");
  eleventyConfig.addPassthroughCopy("js/**/*.js");
  eleventyConfig.addPlugin(schema);
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPlugin(favicon);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: config.url,
    },
  });

  eleventyConfig.addFilter("markdownify", (text) => markdownIt(text));
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter("sitemapCleanup", function (elements) {
    return elements.filter((element) => !element.data.nositemap);
  });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });
};
