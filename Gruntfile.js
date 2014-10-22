module.exports = function(grunt) {
    'use strict';

    // -- Plugins --------------------------------------------------------------

    // Intelligently autoloads `grunt-*` plugins from the package dependencies.
    require('load-grunt-tasks')(grunt);

    // -- Configuration --------------------------------------------------------

    grunt.initConfig({

        watch: {
            options: {
                event: 'all',
                livereload: true,
                interrupt: true
            },
            scripts: {
                files: [
                    'src/**/*'
                ],
                tasks: ['build']
            }
        },

        umd: {
            main: {
                src: 'src/base.js',
                dest: 'build/base.js',
                objectToExport: 'Base',
                globalAlias: 'Base',
                indent: '    '
            }
        },

        uglify: {
            main: {
                files: {
                    'build/base.min.js': ['build/base.js']
                }
            }
        }

    });

    // -- Tasks ----------------------------------------------------------------

    grunt.registerTask('build', ['umd:main', 'uglify:main']);
    grunt.registerTask('default', ['build']);

};
