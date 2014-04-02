/*global module */
module.exports = function (grunt) {
    'use strict';

    grunt.config.init({
        clean: ['thomasbelin4.github.io/*'],

        assemble: {
            options: {
                layout: ['post.hbs'],
                layoutdir: 'layout',
                flatten: true,
                marked: {
                    breaks: false,
                    gfm: true
                }
            },
            pages: {
                files: {
                    '../p/': ['pages/posts/*.hbs'],
                    '../': ['pages/index.hbs']
                }
            }
        },

        sass: {
            compile: {
                files: { '../css/application.css': 'assets/sass/application.scss' }
            }
        },

        watch: {
            templates: {
                files: "**/*.hbs",
                tasks: ["assemble"]
            },

            css: {
                files: "**/*.scss",
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
