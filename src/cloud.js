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
            if(meta_name === "irma-cloud-server") {
                server = metas[i].getAttribute("value");
                console.log("Cloud Server set to", server);
            }
        }
    }
    getSetupFromMetas();

    function loginSuccess(data, status, jqXHR) {
        console.log("Login success");
        console.log(data, status, jqXHR);
        $("#loginContainer").hide();
        processLogin(data);
    }

    function loginError(jqXHR, status, error) {
        console.log(jqXHR, status, error);
        $("#login_alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>Username or password incorrect!</strong> '
                             + '</div>');
    }

    $("#register_link").on("click", function() {
        console.log("Register link clicked");
        $("#loginContainer").hide();
        $("#registerContainer").show();
        return false;
    });

    $("#login_form").on("submit", function() {
        console.log("Signin button pressed");
        var email = $("#inputEmail").prop("value");
        var password = $("#inputPassword").prop("value");

        $("#login_alert_box").empty();

        var loginObject = {
            "username": email,
            "password": password
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

    function registerSuccess(data, status, jqXHR) {
        console.log("Register success");
        console.log(data, status, jqXHR);
        $("#registerContainer").hide();
        processLogin(data);
    }

    function registerError(jqXHR, status, error) {
        console.log("Register error");
        console.log(jqXHR, status, error);
        $("#register_alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>Failed to register, try again!</strong> '
                             + '</div>');
    }

    $("#register_form").on("submit", function() {
        console.log("Register form pressed pressed");
        var email = $("#registerEmail").prop("value");
        var password = $("#registerPassword").prop("value");
        var passwordConf = $("#registerPasswordConf").prop("value");
        var pin = $("#registerPin").prop("value");
        var pinConf = $("#registerPinConf").prop("value");

        $("#register_alert_box").empty();

        if(password !== passwordConf) {
            console.log("Passwords not equal!");
            $("#register_alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>Passwords not equal!</strong> '
                             + '</div>');
            return false;
        }

        if(pin !== pinConf) {
            console.log("PIN codes not equal!");
            $("#register_alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>PIN codes not equal!</strong> '
                             + '</div>');
            return false;
        }

        var registerObject = {
            "username": email,
            "pin": pin,
            "password": password
        };

        console.log(registerObject);

        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users",
            data: JSON.stringify(registerObject),
            success: registerSuccess,
            error: registerError
        });

        return false;
    });

    function processLogin(data) {
        console.log("Checking if user complete enrolment!", data);

        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + data.userID,
            success: processUserEnrolmentCheck,
            error: console.log
        });
    }

    function processUserEnrolmentCheck(data) {
        console.log("Retrieved user data", data);

        if(!data.enrolled) {
            doEnroll(data);
        } else {
            showUserPortal(data);
        }
    }

    var enrolmentTimer;

    function doEnroll(data) {
        console.log("Showing enrolment now");

        var qr_data = {
            a: "cloud_enroll",
            url: server,
            username: data.username,
            userID: data.ID
        }

        console.log(qr_data);

        $("#enrolmentContainer").show();
        $("#enroll_qr").qrcode({
            text: JSON.stringify(qr_data),
            size: 256,
        });

        // Starting time to check if enrolment has completed
        var requestUserStatus = function () {
            $.ajax({
                type: "GET",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                url: server + "/web/users/" + data.ID,
                success: processEnrolmentPoll,
                error: console.log
            });
        }

        enrolmentTimer = setInterval(requestUserStatus, 1000);
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
    });

    $("#disableBtn").on("click", function() {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID + "/disable",
            success: processEnableDisable,
        });
    });

    $("#refreshBtn").on("click", function() {
        updateUserContainer();
    });

    function processEnrolmentPoll(data) {
        if(data.enrolled) {
            console.log("User enrolled, continuing!");
            clearTimeout(enrolmentTimer);
            $("#enrolmentContainer").hide();

            showUserPortal(data);
        }
    }

    function showUserPortal(data) {
        console.log("Showing user Portal now");
        user = data;

        updateUserContainer();
        $("#userContainer").show();
    }

    function updateUserContainer() {
        updateUserEnablement();
        updateUserLogs();
    }

    function updateUserEnablement() {
        console.log("Updating enable status");
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/users/" + user.ID,
            success: processEnableDisable,
            error: console.log
        });
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

    function processEnableDisable(data) {
        user = data;
        console.log("New user object", user);

        if(user.enabled) {
            $("#enableBtn").hide();
            $("#disableBtn").show();
        } else {
            $("#enableBtn").show();
            $("#disableBtn").hide();
        }
        updateUserLogs();
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
});
