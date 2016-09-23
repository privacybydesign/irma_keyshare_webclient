module.exports = function (grunt) {
    // Setup default urls for the irma web server, and irma api server urls
    // these are used to configure the server pages (so it can find
    // the API) and the examples (so they can find the authentication server)
    var authentication_server_url, authentication_api_url, server_url;
    if( typeof(grunt.option("cloud_server_url")) === "undefined") {
        console.log("INFO: set cloud_server_url to create a working setup");
    }
    // cloud_server_url = grunt.option("cloud_server_url") || "https://demo.irmacard.org/tomcat/irma_api_server/";
    cloud_server_url = grunt.option("cloud_server_url");

    console.log("Cloud server url:", cloud_server_url);

    grunt.initConfig({
        copy: {
            // Copying the bower bundles is a bit of a hack
            bower_bundle: {
                cwd: "bower_components",
                src: ["**/*"],
                dest: "build/bower_components",
                expand: "true"
            },
            examples: {
                cwd: "src",
                src: ["**/*", "!**/*.html"],
                dest: "build/",
                expand: "true"
            },
        },
        'string-replace': {
            examples: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.html"],
                    dest: "build/",
                    expand: "true"
                }],
                options: {
                    replacements: [{
                        pattern: '<IRMA_CLOUD_SERVER>',
                        replacement: cloud_server_url
                    }]
                }
            }
        },
        watch: {
            webfiles: {
                files: [
                    "./src/**/*",
                    "!./src/**/*.html",
                ],
                tasks: ["copy"]
            },
            htmlfiles: {
                files: [
                    "./src/**/*.html"
                ],
                tasks: ["string-replace"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");

    grunt.registerTask("default", ["copy", "string-replace", "watch"]);
    grunt.registerTask("build", ["copy", "string-replace"]);
};
