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
            if(meta_name === "irma-keyshare-server") {
                server = metas[i].getAttribute("value");
                console.log("Keyshare Server set to", server);
            }
            if(meta_name === "scheme-mananger-url") {
                schememanager = metas[i].getAttribute("value");
                console.log("Scheme manager set to", server);
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
        $("#login_alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>Error submitting email address.</strong> '
                             + '</div>');
    }

    $("#login_form").on("submit", function() {
        console.log("Signin button pressed");
        var email = $("#inputEmail").prop("value");

        $("#login_alert_box").empty();

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

    function getUserObject(userId) {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + userId,
            success: showUserPortal,
            error: function() {
                $("#login_alert_box").html('<div class="alert alert-danger" role="alert">'
                                   + '<strong>Invalid session, please login again</strong> '
                                   + '</div>');
                console.log($.removeCookie('sessionid', { path: '/' }));
                $("#loginContainer").show();
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
    });

    function showUserPortal(data) {
        console.log("Showing user Portal now");
        user = data;

        updateUserContainer();
        $("#loginContainer").hide();
        $("#userContainer").show();
    }

    function updateUserContainer() {
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
        var sessionId = $.cookie('sessionid');
        var userId = $.cookie('userid');

        if (sessionId !== undefined) {
            getUserObject(userId);
        } else {
            $("#loginContainer").show();
        }
    }

    function tryLoginFromUrl() {
        if(!window.location.hash)
            return false;

        var token = window.location.hash.substring(1);
        $.ajax({
            type: "GET",
            url: server + "/web/users/finishenroll/" + token,
            complete: function() {
                window.location = "/irma_keyshare_server";
            }
        });

        return true;
    }

    getSetupFromMetas();

    if (!tryLoginFromUrl())
        tryLoginFromCookie();
});
