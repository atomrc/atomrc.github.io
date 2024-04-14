const schema = require("@quasibit/eleventy-plugin-schema");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const Image = require("@11ty/eleventy-img");
const config = require("./_data/config");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const CleanCSS = require("clean-css");

const favicon = require("eleventy-favicon");

async function imageShortcode(src, alt) {
  let metadata = await Image(src, {
    widths: [300, 600, 900],
    formats: ["avif", "jpeg"],
    outputDir: "_site/img",
    concurrency: 0,
  });

  let imageAttributes = {
    alt,
    sizes: "(max-width:300px) 300px, (max-width:600px) 600px, 900px",
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

const md = markdownIt({ html: true }).use(markdownItAnchor);

module.exports = function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.setLiquidOptions({ dynamicPartials: false });
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
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

  eleventyConfig.addFilter("markdownify", (text) => md.render(text));
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
