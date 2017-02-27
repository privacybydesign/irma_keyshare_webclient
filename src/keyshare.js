$(function() {
    var server, schememanager;

    function getSetupFromMetas() {
        console.log("Running getSetupFromMetas");
        var metas = document.getElementsByTagName("meta");
        for (var i = 0; i < metas.length; i++) {
            var meta_name = metas[i].getAttribute("name");
            if (meta_name === null) {
                continue;
            }

            meta_name = meta_name.toLowerCase();
            console.log("Examining meta: ", meta_name);
            if (meta_name === "keyshare-server-url") {
                server = metas[i].getAttribute("value");
                console.log("Keyshare Server set to", server);
            }
            if (meta_name === "scheme-mananger-url") {
                var val = metas[i].getAttribute("value");
                if (val !== "undefined") {
                    schememanager = metas[i].getAttribute("value");
                    console.log("Scheme manager set to", server);
                }
            }
        }
    }

    $("#register-link").on("click", function() {
        console.log("Register link clicked");

        if ( /Android/i.test(navigator.userAgent) ) {
            window.location.href = "intent://#Intent;package=org.irmacard.cardemu;scheme=schememanager;"
                + "S.url=" + encodeURIComponent(schememanager) + ";"
                + "S.browser_fallback_url=http%3A%2F%2Fapp.irmacard.org%2Fschememanager;end";
        }

        else {
            $("#login-container").hide();
            $("#enrolment-container").show();
            var qr_data = {
                irmaqr: "schememanager",
                url: schememanager,
            };
            console.log(qr_data);
            $("#enroll_qr").qrcode({
                text: JSON.stringify(qr_data),
                size: 256,
            });
        }

        return false;
    });

    function loginSuccess() {
        console.log("Login success");
        $("#login-container").hide();
        $("#login-done").show();
    }

    function loginError(jqXHR, status, error) {
        console.log(jqXHR, status, error);
        showError("Error submitting email address.");
    }

    function showError(message) {
      $("#alert_box").html("<div class=\"alert alert-danger\" role=\"alert\">"
                               + "<strong>" + message + "</strong></div>");
    }

    var showWarning = function(msg) {
        $("#alert_box").html("<div class=\"alert alert-warning\" role=\"alert\">"
                             + "<strong>Warning:</strong> " + msg + "</div>");
    };

    var showSuccess = function(msg) {
        $("#alert_box").html("<div class=\"alert alert-success\" role=\"alert\">"
                             + "<strong>Success:</strong> " + msg + "</div>");
    };

    $("#login-form").on("submit", function() {
        console.log("Signin button pressed");

        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        var logintype = $("input[name=login-type]:checked").val();

        if (logintype === "email") {
            var email = $("#input-email").prop("value");
            var loginObject = { "username": email };

            $.ajax({
                type: "POST",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                url: server + "/web/login",
                data: JSON.stringify(loginObject),
                success: loginSuccess,
                error: loginError,
            });
        }

        if (logintype === "irma") {
            $.ajax({
                type: "GET",
                url: server + "/web/login-irma",
                success: function(data) {
                    IRMA.verify(data, discloseSuccess, showWarning, showError);
                },
                error: showError,
            });
        }

        return false;
    });

    function discloseSuccess(jwt) {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "text/plain",
            url: server + "/web/login-irma/proof",
            data: jwt,
            success: tryLoginFromCookie,
            error: loginError,
        });
    }

    function getUserObject(userId) {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + userId,
            success: showUserPortal,
            error: function() {
                showError("Expired or invalid session, please login again");
                Cookies.remove("sessionid", { path: "/" });
                showLogin();
            },
        });
    }

    var user;

    $("#disable-btn").on("click", function() {
        BootstrapDialog.show({
            title: "Disable all attributes?",
            message: "This will permanently disable your IRMA app. If you do this, your attributes will become unusable. Are you certain?",
            type: BootstrapDialog.TYPE_DANGER,
            buttons: [{
                id: "disable-cancel",
                label: "Cancel",
                cssClass: "btn-secondary",
                action: function(dialogRef) {
                    dialogRef.close();
                },
            }, {
                id: "disable-confirm",
                label: "Disable",
                cssClass: "btn-danger",
                action: function(dialogRef) {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json;charset=utf-8",
                        url: server + "/web/users/" + user.ID + "/disable",
                        success: showUserPortal,
                    });
                    dialogRef.close();
                },
            }],
        });
    });

    $("#refresh-btn").on("click", function() {
        logStart = 0;
        updateUserContainer();
    });

    $("#logout-btn").on("click", function() {
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
        $("#login-container").hide();
        $("#user-container").show();
    }

    function updateUserContainer() {
        $("#username").html("Logged in as " + user.username);
        $("#disable-btn").prop("disabled", !user.enabled);
        updateUserLogs();
    }

    var logStart = 0, logNext = 0, logPrev = 0;

    function updateUserLogs() {
        console.log("Querying logs earlier than " + logStart);
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID + "/logs/" + logStart,
            success: processUserLogs,
        });
    }

    function processUserLogs(data) {
        // Update state and buttons
        logNext = data.next;
        logPrev = data.previous;
        $("#next-btn").prop("disabled", typeof logNext === "undefined");
        $("#prev-btn").prop("disabled", typeof logPrev === "undefined");
        $("#refresh-btn").prop("disabled", typeof logPrev !== "undefined");

        if (logPrev === "undefined")
            logStart = 0; // Make sure the Refresh button retrieves previously unseen events

        if (data.entries.length === 0)
            return;

        // Repopulate table
        var tableContent = $("#user-logs-body");
        tableContent.empty();
        for (var i = 0; i < data.entries.length; i++) {
            var entry = data.entries[i];
            tableContent.append("<tr><td title=\""
                    + moment(entry.time).format("dddd, D MMM YYYY, H:mm:ss")
                    + "\">"
                    + moment(entry.time).fromNow()
                    + "</td><td>"
                    + entry.event + "</td></tr>");
        }
    }

    $("#prev-btn").on("click", function() {
        if (logPrev === 0)
            return;

        logStart = logPrev;
        updateUserLogs();
    });

    $("#next-btn").on("click", function() {
        if (logNext === 0)
            return;

        logStart = logNext;
        updateUserLogs();
    });

    function tryLoginFromCookie() {
        var sessionId = Cookies.get("sessionid");
        var userId = Cookies.get("userid");

        if (sessionId !== undefined) {
            getUserObject(userId);
        } else {
            showLogin();
        }
    }

    function tryLoginFromUrl() {
        if (!window.location.hash)
            return false;

        var hash = window.location.hash.substring(1);
        var parts = hash.split("/");
        if (parts.length !== 2)
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
                    },
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
        user = data;
        if (path === "enroll")
            $("#enrollment-finished").show();
        else
            showUserPortal(data);
    }

    function showLogin() {
        $("#login-container").show();
        if (typeof(schememanager) === "undefined")
            $("#register").hide();
    }

    $("#login-email-button").on("click", function() {
        $("#input-email").prop("disabled", false);
    });

    $("#login-irma-button").on("click", function() {
        $("#input-email").prop("disabled", true);
    });

    $(".issue-email-btn").on("click", function() {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        $.ajax({
            type: "GET",
            url: server + "/web/users/" + user.ID + "/issue_email",
            success: processIssueEmail,
            error: showError,
        });
    });

    var processIssueEmail = function(data) {
        IRMA.issue(data, function() {
            showSuccess("Email address successfully issued");
        }, showWarning, showError);
    };

    $("a.frontpage").attr("href", window.location.href.replace(window.location.hash, ""));

    getSetupFromMetas();

    if (!tryLoginFromUrl())
        tryLoginFromCookie();
});
