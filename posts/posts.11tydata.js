module.exports = {
  layout: "layouts/post",
  type: "post",
  tags: ["posts"],
  permalink: "/p/{{page.fileSlug}}/",
  eleventyComputed: {
    meta: {
      language: (post) => post.lang,
      url: (post) => post.meta.site.url + post.page.url,
      title: (post) => post.title,
      description: (post) => post.description,
      published: (post) => post.date,
      author: "Thomas Belin",
    },
  },
};
