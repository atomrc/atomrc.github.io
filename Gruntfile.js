/*global module */
module.exports = function (grunt) {
    'use strict';

    grunt.config.init({

        sass: {
            compile: {
                files: { 'css/application.css': '_assets/sass/application.scss' }
            }
        },

        watch: {
            css: {
                files: "_assets/**/*.scss",
                tasks: ["sass"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['sass']);
};
