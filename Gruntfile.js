module.exports = function (grunt) {
    if ( typeof(grunt.option("keyshare_server_url")) === "undefined") {
        console.log("INFO: set keyshare_server_url to create a working setup");
    }
    if ( typeof(grunt.option("scheme_manager_url")) === "undefined") {
        console.log("INFO: set scheme_manager_url to enable scheme manager QR");
    }
    if ( (typeof(grunt.option("api_server_url")) === "undefined") ) {
        console.log("INFO: set api_server_url (possibly also irma_js_url) to enable email issuing");
    }
    if ( (typeof(grunt.option("language")) === "undefined") ) {
        console.log("INFO: No language chosen, assuming nl");
    }

    var conf = {
        keyshare_server_url: grunt.option("keyshare_server_url"),
        scheme_manager_url: grunt.option("scheme_manager_url"),
        api_server_url: grunt.option("api_server_url") + "/api/v2/",
        api_web_url: grunt.option("api_web_url") || grunt.option("api_server_url"),
        irma_js_url: grunt.option("irma_js_url") || grunt.option("api_server_url"),
        language: grunt.option("language") || "nl",
    };

    conf.api_web_url += "/server/";
    conf.irma_js_url += "/client/";

    console.log("Configuration: ", conf);

    grunt.initConfig({
        copy: {
            // Copying the bower bundles is a bit of a hack
            bower_bundle: {
                cwd: "bower_components",
                src: ["**/*"],
                dest: "build/bower_components",
                expand: "true",
            },
            non_html: {
                cwd: "src",
                src: ["**/*", "!**/*.html"],
                dest: "build/",
                expand: "true",
            },
            translated: {
                cwd: "translated/" + conf.language,
                src: ["**/*"],
                dest: "build/",
                expand: "true",
            },
        },
        "string-replace": {
            examples: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.html"],
                    dest: "translated/",
                    expand: "true",
                }],
                options: {
                    replacements: [{
                        pattern: /\[KEYSHARE_SERVER_URL\]/g,
                        replacement: conf.keyshare_server_url,
                    }, {
                        pattern: /\[SCHEME_MANAGER_URL\]/g,
                        replacement: conf.scheme_manager_url,
                    }, {
                        pattern: /\[API_SERVER_URL\]/g,
                        replacement: conf.api_server_url,
                    }, {
                        pattern: /\[API_WEB_URL\]/g,
                        replacement: conf.api_web_url,
                    }, {
                        pattern: /\[IRMA_JS_URL\]/g,
                        replacement: conf.irma_js_url,
                    }, {
                        pattern: /\[LANGUAGE\]/g,
                        replacement: conf.language,
                    }],
                },
            },
        },
        watch: {
            webfiles: {
                files: [
                    "./src/**/*",
                    "!./src/**/*.html",
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
        "copy:bower_bundle",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
        "watch",
    ]);
    grunt.registerTask("build", [
        "copy:non_html",
        "json_generator",
        "copy:bower_bundle",
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
