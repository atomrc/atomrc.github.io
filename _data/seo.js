const config = require("./config.json");

module.exports = {
  title: config.name,
  author: "Thomas Belin",
  twitter: "atomrc",
  image: `${config.avatar}?s=300`,
  url: config.url,
  description:
    "Senior Front-End Architect @deezer in Paris. I leave code cleaner than I found it. Seriously into Functional and Reactive Programming.",
};
