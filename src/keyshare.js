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

    function loginSuccess() {
        console.log("Login success");
        $("#login-container").hide();
        $("#login-done").show();
    }

    function loginError(jqXHR, status, error) {
        console.log(jqXHR, status, error);
        showError("An error occured during login.");
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
                              + msg + "</div>");
    };

    $("#login-form-irma").on("submit", function() {
        console.log("IRMA signin button pressed");
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        $.ajax({
            type: "GET",
            url: server + "/web/login-irma",
            success: function(data) {
                IRMA.verify(data, discloseSuccess, showWarning, showError);
            },
            error: showError,
        });

        return false;
    });

    $("#login-form-email").on("submit", function() {
        console.log("Email signin button pressed");
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

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
                showError("Session has expired or is invalid, please login again.");
                Cookies.remove("sessionid", { path: "/" });
                showLogin();
            },
        });
    }

    var user;

    $("#disable-btn").on("click", function() {
        BootstrapDialog.show({
            title: "Block MyIRMA?",
            message: "If you proceed, all your attributes will become permanently unusable. Are you certain?",
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
                label: "Block",
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

    $("#delete-btn").on("click", function() {
        BootstrapDialog.show({
            title: "Delete MyIRMA?",
            message: "If you proceed, all your attributes will become permanently unusable, "
                   + "and your logs and email address will be deleted from MyIRMA. Are you certain?",
            type: BootstrapDialog.TYPE_DANGER,
            buttons: [{
                id: "delete-cancel",
                label: "Cancel",
                cssClass: "btn-secondary",
                action: function(dialogRef) {
                    dialogRef.close();
                },
            }, {
                id: "delete-confirm",
                label: "Delete",
                cssClass: "btn-danger",
                action: function(dialogRef) {
                    $.ajax({
                        type: "POST",
                        url: server + "/web/users/" + user.ID + "/delete",
                        success: function() {
                            showLoginContainer("MyIRMA account deleted.");
                        },
                    });
                    dialogRef.close();
                },
            }],
        });
    });

    $("#refresh-btn").on("click", function() {
        logStart = 0; // Ensures we fetch the most recent events
        updateUserContainer();
    });

    function showLoginContainer(message) {
        $("#user-container").hide();
        $("#login-container").show();
        if (typeof message !== "undefined")
            showSuccess(message);
    }

    $("#logout-btn").on("click", function() {
        $.ajax({
            type: "GET",
            url: server + "/web/logout",
            success: function() {
                showLoginContainer("You are now logged out.");
            },
        });
    });

    function showUserPortal(data) {
        console.log("Showing user Portal now");
        user = data;

        updateUserContainer();
        $("#login-container").hide();
        $("#user-container").show();
    }

    function updateUserContainer() {
        $("#username").html(user.username);
        $("#disable-btn").prop("disabled", !user.enabled);
        if (user.emailIssued)
            $("#issue-email-later").hide();
        else
            $("#issue-email-later").show();
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
                    + getEventString(entry) + "</td></tr>");
        }
    }

    function getEventString(entry) {
        switch (entry.event) {
            case "PIN_CHECK_REFUSED":
                return "PIN verification blocked";
            case "IRMA_APP_AUTH_REFUSED":
                return "IRMA session blocked";
            case "PIN_CHECK_SUCCESS":
                return "PIN verified";
            case "PIN_CHECK_FAILED":
                return "PIN wrong, " + entry.param + " attempts remaining";
            case "PIN_CHECK_BLOCKED":
                return "PIN wrong too often, blocked " + entry.param + " seconds";
            case "IRMA_SESSION":
                return "Performed IRMA session";
            case "IRMA_ENABLED":
                return "MyIRMA enabled";
            case "IRMA_BLOCKED":
                return "MyIRMA blocked";

            default:
                showError("Received unexpected log entry type");
                return "";
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

    function cookiesEnabled() {
        return ("cookie" in document && (document.cookie.length > 0
            || (document.cookie = "test").indexOf.call(document.cookie, "test") > -1));
    }

    function tryLoginFromUrl() {
        if (!window.location.hash)
            return false;

        var hash = window.location.hash.substring(1);
        var parts = hash.split("/");
        var path = parts[0];
        var token = parts[1];

        console.log("Path: ", path);
        console.log("Token: ", token);

        if (path !== "enroll" && path !== "login" && path !== "qr")
            return false;

        switch (path) {
            case "enroll":
            case "login":
                if (!cookiesEnabled()) // Can't do anything in this case
                    return false;
                if (parts.length !== 2)
                    return false;

                $.ajax({
                    type: "GET",
                    url: server + "/web/" + path + "/" + token,
                    success: function(data) {
                        processUrlLogin(data, path);
                    },
                    error: function() {
                        showError("An error occured during email verification.");
                    },
                });
                removeHashFromUrl();
                break;

            case "qr":
                var url = schememanager;
                if (typeof token !== "undefined" && token.length > 0)
                    url = decodeURIComponent(token);
                if ( /Android/i.test(navigator.userAgent) ) {
                    window.location.href = "intent://#Intent;package=org.irmacard.cardemu;scheme=schememanager;"
                        + "S.url=" + encodeURIComponent(url) + ";"
                        + "S.browser_fallback_url=http%3A%2F%2Fapp.irmacard.org%2Fschememanager;end";
                }

                else {
                    $("#login-container").hide();
                    $("#enrolment-container").show();
                    var qr_data = {
                        irmaqr: "schememanager",
                        url: url,
                    };
                    console.log(qr_data);
                    $("#enroll_qr").qrcode({
                        text: JSON.stringify(qr_data),
                        size: 256,
                    });
                }
                break;

            default:
                showError("Invalid path specified after #");
                return false;
        }

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
        if (path === "enroll") {
            $("#enrollment-email-issue").show();
            $("span#enrollment-email-address").html(user.username);
        }
        else
            showUserPortal(data);
    }

    function showLogin() {
        $("#login-container").show();
        if (typeof(schememanager) === "undefined")
            $("#register").hide();
    }

    function issueEmail(successCallback) {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        $.ajax({
            type: "GET",
            url: server + "/web/users/" + user.ID + "/issue_email",
            success: function(data) {
                IRMA.issue(data, function() {
                    $.ajax({ // Notify server of email issuance success
                        type: "POST",
                        url: server + "/web/users/" + user.ID + "/email_issued",
                        success: function(data) {
                            user = data;
                        },
                    });
                    successCallback();
                }, showWarning, showError);
            },
            error: showError,
        });
    }

    $("#issue-email-btn").on("click", function() {
        $("#email-issue-help").show();

        issueEmail(function() {
            $("#enrollment-email-issue").hide();
            $("#enrollment-finished").show();
        });
    });

    $("#issue-email-later-btn").on("click", function() {
        issueEmail(function() {
            $("#issue-email-later").hide();
        });
    });

    $("#enrollment-test-email-button").on("click", function() {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + user.ID + "/test_email",
            success: function(verify_jwt) {
                IRMA.verify(verify_jwt, function(result_jwt) {
                    var email = jwt_decode(result_jwt).attributes["pbdf.pbdf.mijnirma.email"];
                    $("#enrollment-test-email").html(email);
                    $("#email-issue-test").show();
                }, showWarning, showError);
            },
            error: showError,
        });
        return false;
    });

    $("#show-main").on("click", function() {
        updateUserContainer();
        $("#enrollment-finished").hide();
        $("#user-container").show();
        return false;
    });

    $("a.frontpage").attr("href", window.location.href.replace(window.location.hash, ""));

    getSetupFromMetas();

    moment().locale("nl");

    if (!tryLoginFromUrl())
        tryLoginFromCookie();

    if (!cookiesEnabled())
        showError("MyIRMA uses cookiues. Please enable cookies and retry.");
});
