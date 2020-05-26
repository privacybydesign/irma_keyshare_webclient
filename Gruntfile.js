module.exports = function (grunt) {
    if ( (typeof(grunt.option("language")) === "undefined") ) {
        console.log("INFO: No language chosen, assuming nl");
    }

    const language = grunt.option("language") || "nl";

    var strings = grunt.file.readJSON("src/languages/" + language + ".json");

    grunt.initConfig({
        copy: {
            // Copying the bower bundles is a bit of a hack
            node_modules: {
                cwd: "node_modules",
                src: [
                    "bootstrap/dist/**",
                    "bootstrap3-dialog/src/css/bootstrap-dialog.css",
                    "jquery/dist/jquery.min.js",
                    "js-cookie/src/js.cookie.js",
                    "moment/moment.js",
                    "moment/locale/nl.js",
                    "moment/locale/en-gb.js",
                    "bootstrap/js/modal.js",
                    "bootstrap3-dialog/src/js/bootstrap-dialog.js",
                    "jwt-decode/build/jwt-decode.js",
                    "@privacybydesign/irmajs/dist/irma.js",
                ],
                dest: "build/assets/",
                expand: "true",
            },
            fonts: {
                cwd: "fonts",
                src: ["*"],
                dest: "build/assets/fonts/",
                expand: "true",
            },
            non_html: {
                cwd: "src",
                src: ["**/*", "!**/*.html", "!**/*.js"],
                dest: "build/",
                expand: "true",
            },
            translated: {
                cwd: "translated/" + language,
                src: ["**/*.html"],
                dest: "build/",
                expand: "true",
            },
        },
        "string-replace": {
            html: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.html"],
                    dest: "translated/",
                    expand: "true",
                }],
                options: {
                    replacements: [{
                        pattern: /\[LANGUAGE\]/g,
                        replacement: language,
                    }],
                },
            },
            javascript: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.js"],
                    dest: "build/",
                    expand: "true",
                }],
                options: {
                    replacements: [{
                        pattern: /var strings = \{\};/,
                        replacement: "var strings = " + JSON.stringify(strings) + ";",
                    }],
                },
            },
            config: {
                files: {
                    "build/" : "config.js",
                },
                options: {
                    replacements: [{
                        pattern: /}/,
                        replacement: "    language: \"" + language + "\",\n}",
                    }],
                },
            },
        },
        watch: {
            webfiles: {
                files: [
                    "./src/**/*",
                    "!./src/**/*.html",
                    "!./src/**/*.js",
                ],
                tasks: ["copy:non_html"],
            },
            htmlfiles: {
                files: [
                    "./src/**/*.html",
                ],
                tasks: ["translate"],
            },
            translationfiles: {
                files: [
                    "./src/languages/*",
                ],
                tasks: ["translate"],
            },
            javascriptfiles: {
                files: [
                    "./src/**/*.js",
                ],
                tasks: ["string-replace:javascript"],
            },
        },
        multi_lang_site_generator: {
            default: {
                options: {
                    vocabs: ["en", "nl"],
                    vocab_directory: "src/languages",
                    output_directory: "translated",
                },
                files: {
                    "index.html": ["translated/index.html"],
                },
            },
        },
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");
    grunt.loadNpmTasks("grunt-multi-lang-site-generator");

    grunt.registerTask("default", [
        "copy:non_html",
        "copy:node_modules",
        "copy:fonts",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
        "watch",
    ]);
    grunt.registerTask("build", [
        "copy:non_html",
        "copy:node_modules",
        "copy:fonts",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
    ]);
    grunt.registerTask("translate", [
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
    ]);
};
