module.exports = function (grunt) {
    if ( typeof(grunt.option("keyshare_server_url")) === "undefined") {
        console.log("INFO: set keyshare_server_url to create a working setup");
    }
    if ( (typeof(grunt.option("irma_server_url")) === "undefined") ) {
        console.log("INFO: set irma_server_url to enable email manipulation");
    }
    if ( (typeof(grunt.option("language")) === "undefined") ) {
        console.log("INFO: No language chosen, assuming nl");
    }
    if ( (typeof(grunt.option("cookie_domain")) === "undefined") ) {
        console.log("INFO: No cookie domain given, setup will not work cross-origin");
    }

    var conf = {
        keyshare_server_url: grunt.option("keyshare_server_url"),
        irma_server_url: grunt.option("irma_server_url"),
        language: grunt.option("language") || "nl",
        cookie_domain: grunt.option("cookie_domain")
    };

    console.log("Configuration: ", conf);

    var strings = grunt.file.readJSON("src/languages/" + conf.language + ".json");

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
            non_html: {
                cwd: "src",
                src: ["**/*", "!**/*.html", "!**/*.js"],
                dest: "build/",
                expand: "true",
            },
            translated: {
                cwd: "translated/" + conf.language,
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
                        pattern: /\[IRMA_JS_URL\]/g,
                        replacement: conf.irma_js_url,
                    }, {
                        pattern: /\[LANGUAGE\]/g,
                        replacement: conf.language,
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
                        pattern: /var conf = \{\};/,
                        replacement: "var conf = " + JSON.stringify(conf) + ";",
                    }, {
                        pattern: /var strings = \{\};/,
                        replacement: "var strings = " + JSON.stringify(strings) + ";",
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
        json_generator: {
            configuration: {
                dest: "build/conf.json",
                options: conf,
            },
        },
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");
    grunt.loadNpmTasks("grunt-multi-lang-site-generator");
    grunt.loadNpmTasks("grunt-json-generator");

    grunt.registerTask("default", [
        "copy:non_html",
        "json_generator",
        "copy:node_modules",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
        "watch",
    ]);
    grunt.registerTask("build", [
        "copy:non_html",
        "json_generator",
        "copy:node_modules",
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
