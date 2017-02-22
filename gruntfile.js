// Generated on 2014-07-10 using generator-jhipster 0.17.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest,

    // usemin custom step
    useminAutoprefixer = {
        name: 'autoprefixer',
        createConfig: function(context, block) {
            if (block.src.length === 0) {
                return {};
            } else {
                return require('grunt-usemin/lib/config/cssmin').createConfig(context, block); // Reuse cssmins createConfig
            }
        }
    };

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);


    grunt.initConfig({
        app: {
            // Application variables
            scripts: [
                // JS files to be included by includeSource task into index.html
                'application/*.js',
                'application/**/*.js',
                'scripts/app.js',
                'scripts/**/*.js'
            ]
        },
        yeoman: {
            // configurable paths
            app: 'app',
            dist: 'dist'
        },
        watch: {
            compass: {
                files: ['src/main/scss/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['styles/{,*/}*.css'],
            },
            includeSource: {
                // Watch for added and deleted scripts to update index.html
                files: ['scripts/**/*.js', 'application/**/*.js'],
                tasks: ['includeSource'],
                options: {
                    event: ['added', 'deleted']
                }
            },
            livereload: {
                options: {
                    livereload: 35729
                },
                files: [
                    '**/*.html',
                    '.tmp/styles/**/*.css',
                    '{.tmp/,}scripts/**/*.js',
                    'images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            proxies: [{
                context: '/app',
                host: 'localhost',
                port: 8080,
                https: false,
                changeOrigin: false
            }],
            options: {
                port: 9000,
                // Change this to 'localhost' to deny access to the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        ''
                    ]
                }
            }
        },
        clean: {
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'scripts/app.js',
                'scripts/**/*.js',
            ]
        },
        coffee: {
            options: {
                sourceMap: true,
                sourceRoot: ''
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        wiredep: {
            app: {
                src: ['index.html'],
                exclude: [
                    'angular-i18n', // localizations are loaded dynamically
                    'swagger-ui',
                    'bootstrap-sass'
                ]
            }
        },
        includeSource: {
            // Task to include files into index.html
            options: {
                basePath: '',
                baseUrl: '',
                ordering: 'top-down',
                templates: {
                    html: {
                        js: '<script src="{filePath}" charset="UTF-8"></script>',
                        css: '<link rel="stylesheet" type="text/css" href="{filePath}" charset="UTF-8"/>',
                    }
                }
            },
            app: {
                files: {
                    'index.html': 'index.html'
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/fonts/*',
                        '<%= yeoman.dist %>/application/libs/**/*.{png,jpg,jpeg,gif,webp,svg}'
                    ]
                }
            }
        },
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: ['dist/index.html']
        },
        // not used since Uglify task does concat,
        // but still available if needed
        //    dist: {}
        concat: {},
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'images',
                    src: '{,*/}*.{jpg,jpeg}', // we don't optimize PNG files as it doesn't work on Linux. If you are not on Linux, feel free to use '{,*/}*.{png,jpg,jpeg}'
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            html: {
                src: './index.html',
                dest: 'dist/index.html'
            },
            dist: {
                files: [{
                        expand: true,
                        dot: true,
                        cwd: '',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'i18n/*',
                            'images/{,*/}*.{png,gif,webp}',
                            'fonts/*',
                            'application/libs/**/*.{png,jpg,jpeg,gif}'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= yeoman.dist %>/images',
                        src: ['generated/*']
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: 'styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },
        replace: {
            dist: {
                src: ['<%= yeoman.dist %>/index.html'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: '<div class="development"></div>',
                    to: ''
                }]
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:mm") %> */'
            }
        }
    });


    var serverTask = function() {

        console.log('starting server');
        grunt.task.run([
            'clean:server',
            'configureProxies',
            'connect:livereload',
            'watch'
        ]);
    };

    grunt.registerTask('server', serverTask);
};