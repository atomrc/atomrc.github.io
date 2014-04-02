/*global module */
module.exports = function (grunt) {
    'use strict';

    grunt.config.init({
        clean: ['thomasbelin4.github.io/*'],

        assemble: {
            options: {
                assets: 'src/assets',
                layout: ['post.hbs'],
                layoutdir: 'src/layout',
                flatten: true,
                marked: {
                    breaks: false,
                    gfm: true
                },
                collections: [
                    {
                        // the name of the collection 
                        title: 'pages',
                        // the order in which to sort 
                        sortorder: 'asc',
                        sortby: 'pubdate'
                    }
                ]
            },
            pages: {
                files: {
                    './thomasbelin4.github.io/p/': ['src/pages/posts/*.hbs'],
                    './thomasbelin4.github.io/': ['src/pages/index.hbs']
                }
            }
        },

        sass: {
            compile: {
                files: { 'thomasbelin4.github.io/css/application.css': 'src/assets/sass/application.scss' }
            }
        },

        watch: {
            templates: {
                files: "src/**/*.hbs",
                tasks: ["assemble"]
            },

            css: {
                files: "src/**/*.scss",
                tasks: ["sass"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('assemble');

    grunt.registerTask('default', ['clean', 'assemble', 'sass']);
};
