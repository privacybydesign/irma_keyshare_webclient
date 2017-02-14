$(function() {
    var server;

    function getSetupFromMetas() {
        console.log("Running getSetupFromMetas");
        var metas = document.getElementsByTagName("meta");
        for(var i = 0; i < metas.length; i++) {
            var meta_name = metas[i].getAttribute("name");
            if (meta_name == null) {
                continue;
            }

            meta_name = meta_name.toLowerCase();
            console.log("Examining meta: ", meta_name);
            if(meta_name === "keyshare-server-url") {
                server = metas[i].getAttribute("value");
                console.log("Keyshare Server set to", server);
            }
            if(meta_name === "scheme-mananger-url") {
                var val = metas[i].getAttribute("value");
                if (val !== "undefined") {
                    schememanager = metas[i].getAttribute("value");
                    console.log("Scheme manager set to", server);
                }
            }
        }
    }

    $("#register_link").on("click", function() {
        console.log("Register link clicked");
        $("#loginContainer").hide();
        $("#enrolmentContainer").show();

        var qr_data = {
            irmaqr: "schememanager",
            url: schememanager,
        }

        console.log(qr_data);
        $("#enroll_qr").qrcode({
            text: JSON.stringify(qr_data),
            size: 256,
        });

        return false;
    });

    function loginSuccess() {
        console.log("Login success");
        $("#loginContainer").hide();
        $("#loginDone").show();
    }

    function loginError(jqXHR, status, error) {
        console.log(jqXHR, status, error);
        showError("Error submitting email address.");
    }

    function showError(message) {
      $("#alert_box").html('<div class="alert alert-danger" role="alert">'
                               + '<strong>' + message + '</strong></div>');
    }

    var showWarning = function(msg) {
        $("#alert_box").html('<div class="alert alert-warning" role="alert">'
                             + '<strong>Warning:</strong> ' + msg + '</div>');
    };

    var showSuccess = function(msg) {
        $("#alert_box").html('<div class="alert alert-success" role="alert">'
                             + '<strong>Success:</strong> ' + msg +  '</div>');
    };

    $("#login_form").on("submit", function() {
        console.log("Signin button pressed");
        var email = $("#inputEmail").prop("value");

        $("#alert_box").empty();

        var loginObject = {
            "username": email
        };

        console.log(loginObject);

        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/login",
            data: JSON.stringify(loginObject),
            success: loginSuccess,
            error: loginError
        });

        return false;
    });

    $("#signin_irma_button").on("click", function() {
      // Clear errors
      $(".form-group").removeClass("has-error");
      $("#alert_box").empty();

      $.ajax({
          type: "GET",
          url: server + "/web/login-irma",
          success: function(data) {
              IRMA.verify(data, discloseSuccess, showWarning, showError);
          },
          error: showError
      });
    });

    function discloseSuccess(jwt) {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "text/plain",
            url: server + "/web/login-irma/proof",
            data: jwt,
            success: tryLoginFromCookie,
            error: loginError
        });
    }

    function getUserObject(userId) {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + userId,
            success: showUserPortal,
            error: function() {
                showError("Expired or invalid session, please login again");
                Cookies.remove('sessionid', { path: '/' });
                showLogin();
            }
        });
    }

    var user;

    $("#enableBtn").on("click", function() {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID + "/enable",
            success: processEnableDisable,
        });
        $("#refreshBtn").click();
    });

    $("#disableBtn").on("click", function() {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID + "/disable",
            success: processEnableDisable,
        });
        $("#refreshBtn").click();
    });

    $("#refreshBtn").on("click", function() {
        updateUserContainer();
    });

    $("#logoutBtn").on("click", function() {
        $.ajax({
            type: "GET",
            url: server + "/web/logout",
            success: function() {
                window.location = "/irma_keyshare_server";
            },
        });
        return false;
    });

    function showUserPortal(data) {
        console.log("Showing user Portal now");
        user = data;

        updateUserContainer();
        $("#loginContainer").hide();
        $("#userContainer").show();
    }

    function updateUserContainer() {
        $("#username").html("Logged in as " + user.username)
        processEnableDisable();
        updateUserLogs();
    }

    function updateUserLogs() {
        console.log("Adding logs to user container");
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID + "/logs",
            success: processUserLogs,
        });
    }

    function processEnableDisable() {
        if(user.enabled) {
            $("#enableBtn").hide();
            $("#disableBtn").show();
        } else {
            $("#enableBtn").show();
            $("#disableBtn").hide();
        }
    }

    function processUserLogs(data) {
        console.log("Got logs", data);

        var tableContent = $("#userLogsBody");

        tableContent.empty();
        for(i = 0; i < data.length; i++) {
            var entry = data[i];
            console.log("Processing entry: ", entry);
            tableContent.append("<tr><td>" + moment(entry.time).fromNow() + "</td><td>" + entry.event + "</td></tr>");
        }
    }

    function tryLoginFromCookie() {
        var sessionId = Cookies.get('sessionid');
        var userId = Cookies.get('userid');

        if (sessionId !== undefined) {
            getUserObject(userId);
        } else {
            showLogin();
        }
    }

    function tryLoginFromUrl() {
        if(!window.location.hash)
            return false;

        var hash = window.location.hash.substring(1);
        var parts = hash.split('/');
        if (parts.length != 2)
            return false;

        var path = parts[0];
        var token = parts[1];

        console.log("Path: ", path);
        console.log("Token: ", token);

        if (path !== "enroll" && path !== "login")
            return false;

        switch (path) {
            case "enroll":
            case "login":
                $.ajax({
                    type: "GET",
                    url: server + "/web/" + path + "/" + token,
                    success: function(data) {
                        processUrlLogin(data, path);
                    },
                    error: function() {
                        showError("Invalid request.");
                    }
                });
                break;

            default:
                showError("Invalid path specified after #");
                return false;
        }

        removeHashFromUrl();
        return true;
    }

    function removeHashFromUrl() {
        var loc = window.location;
        if ("pushState" in history)
            history.pushState("", document.title, loc.pathname + loc.search);
        else // For IE9 and below. May cause the page to scroll up
            loc.hash = "";
    }

    function processUrlLogin(data, path) {
        if (path === "enroll")
            $("#enrollmentFinished").show();
        else
            showUserPortal(data);
    }

    function showLogin() {
        $("#loginContainer").show();
        if (typeof(schememanager) === 'undefined')
            $("#register").hide();
    }

    $(".issueEmail").on("click", function() {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        $.ajax({
            type: "GET",
            url: server + "/web/users/" + user.ID + "/issue_email",
            success: processIssueEmail,
            error: showError
        });
    });

    var processIssueEmail = function(data) {
        IRMA.issue(data, function() {
            showSuccess("Email address successfully issued");
        }, showWarning, showError);
    }

    $("a.frontpage").attr("href", window.location.href.replace(window.location.hash,""))

    getSetupFromMetas();

    if (!tryLoginFromUrl())
        tryLoginFromCookie();
});
