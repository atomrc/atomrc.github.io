const seo = require("./seo");

module.exports = {
  site: {
    name: seo.title,
    description: seo.description,
    url: seo.url,
    logo: {
      src: seo.image,
      width: 300,
      height: 300,
    },
  },
  language: "en",
  url: seo.url,
  title: seo.title,
  description: seo.description,
  image: {
    src: seo.image,
    height: 300,
    width: 300,
  },
};
