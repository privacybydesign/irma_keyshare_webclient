var strings = {"myirma":"MyIRMA","login_header":"MyIRMA login","login_par1":"This is the MyIRMA website of the Privacy by Design Foundation. Using this website you can view the activities of your IRMA app, and block or delete your account.","login_par2":"The foundation knows when your IRMA app is used, but does not know where or with which attributes. In this way a combination of security and privacy is pursued. The MyIRMA usage log allows you to check if your IRMA app is being abused. If so, you can block your IRMA app here.","login_list":"Below you can log in to MyIRMA in two ways:","login_list_1":"Using IRMA, in particular using the attribute you received during registration containing your username; this is the easiest way.","login_list_2":"Using the email address with which you registered. If you enter it below a link will be sent to it that will allow you to log in to MyIRMA. You can use this login method when you do not have your phone with you, or if your phone has been stolen and you want to prevent abuse of your IRMA app.","login_using":"Log in using","or":"or","login_email_address":"Email address","login_email_link":"Email link","login_check_email":"Check your email","login_check_email_text":"Log in by clicking on the link that has been sent to your email address.","enrollment_done":"MyIRMA registration finished","enrollment_done_text":"Congratulations! The MyIRMA registration is now finished.","enrollment_done_list1":"{URL=/issuance}Load attributes{/URL}","enrollment_done_list2":"Go to MyIRMA","main_logout":"Log out","main_logged_in_as":"You are logged in as ","main_log":"View usage of your IRMA app","main_log_refresh":"Refresh","main_log_previous":"Previous","main_log_next":"Next","main_when":"When","main_event":"Event","main_issuance":"Load or refresh attributes","main_issuance_text":"Go to {URL=/issuance}this page{/URL} to load more attributes in your IRMA app, or refresh existing attributes.","main_delete_title":"Block or delete MyIRMA","main_delete_par1":"If you delete your MyIRMA account, all your attributes become permanently unusable, and all events as well as your email address will be permanently deleted.","main_delete_par2":"{B}Warning{/B}: Blocking or deleting your MyIRMA account is permanent! If you want to use IRMA again afterwards you will have to re-register at MyIRMA and re-obtain all your attributes.","main_block":"Block MyIRMA","main_delete":"Delete MyIRMA","main_emailaddresses_title":"Email addresses","main_emailaddresses_text":"The following email addresses are associated to your account. You can login on MyIRMA using each of these addresses. If you have already {URL=/issuance/email}loaded your email address as IRMA attribute{/URL} you can associate it to your account using the button below.","main_emailaddresses_none_text":"There are no email addresses associated to your account. This means that you will not be able to log in on MyIRMA and block your attributes, in case you lose your phone.","main_emailaddresses_add":"Add email address","email_address":"Email address","keyshare_error_occured":"An error occured during login.","keyshare_session_expired":"Session has expired or is invalid, please login again.","keyshare_block_question":"Block MyIRMA?","keyshare_delete_question":"Delete MyIRMA?","keyshare_block_message":"If you proceed, all your attributes will become permanently unusable. Are you certain?","keyshare_delete_message":"If you proceed, all your attributes will become permanently unusable, and your logs and email address will be deleted from MyIRMA. Are you certain?","keyshare_cancel":"Cancel","keyshare_block":"Block","keyshare_delete":"Delete","keyshare_deleted":"MyIRMA account deleted.","keyshare_loggedout":"You are now logged out.","keyshare_event_error":"Received unexpected log entry type","keyshare_event_PIN_CHECK_REFUSED":"PIN verification blocked","keyshare_event_IRMA_APP_AUTH_REFUSED":"IRMA session blocked","keyshare_event_PIN_CHECK_SUCCESS":"PIN verified","keyshare_event_PIN_CHECK_FAILED":"PIN wrong, {0} attempts remaining","keyshare_event_PIN_CHECK_BLOCKED":"PIN wrong too often, blocked {0}} seconds","keyshare_event_IRMA_SESSION":"Performed IRMA session","keyshare_event_IRMA_ENABLED":"MyIRMA enabled","keyshare_event_IRMA_BLOCKED":"MyIRMA blocked","keyshare_verification_error":"An error occured during email verification.","keyshare_invalid_path":"Invalid path specified after #","keyshare_cookies":"MyIRMA uses cookies. Please enable cookies and retry.","delete_email_title":"Delete email address?","delete_email_message":"Are you certain you want to delete this email address? You will not be able to login with this email address anymore.","never":"Never","login":"Login","candidates_title":"Choose IRMA account","candidates_username":"Username","candidates_lastseen":"Last active","candidates_explanation":"The email address with which you are logging in is associated to multiple IRMA accounts, which are shown in the table below. The columns mean the following:","candidates_item_1":"Your IRMA username. You can find this in your IRMA app as the \"Username\"-attribute under \"MyIRMA login\".","candidates_item_2":"Time of the most recent attribute usage of this IRMA account."};

$.getScript("./config.js", function() {
    const irma_server_conf = {
        lang: conf.language,
        server: conf.irma_server_url,
        legacyResultJwt: true,
    };

    var server = conf.keyshare_server_url;
    moment.locale(conf.language);

    function loginSuccess() {
        console.log("Login success");
        $("#login-container").hide();
        $("#login-done").show();
        updateHeader();
    }

    function loginError(jqXHR, status, error) {
        console.log(jqXHR, status, error);
        showError(strings.keyshare_error_occured);
    }

    function showError(message) {
        $("#alert_box").html("<div class=\"alert alert-danger\" role=\"alert\">"
          + "<strong>" + message + "</strong></div>");
    }

    function updateHeader() {
        var headers = [
            '#main-header',
            '#login-header',
            '#enrollment-done-header',
            '#login-done-header',
        ];
        var headerElement = $('#header');
        // First undo potential hide from earlier run of updateHeader
        headers.forEach(id => $(id).show());
        for (let id of headers) {
            let h = $(id);
            if (h.is(':visible')) {
                h.hide();
                headerElement.html(h.html());
                return;
            }
        }
        headerElement.html($(headers[0]).html());
    }

    var showWarning = function(msg) {
        $("#alert_box").html("<div class=\"alert alert-warning\" role=\"alert\">"
          + "<strong>Warning:</strong> " + msg + "</div>");
    };

    var showSuccess = function(msg) {
        $("#alert_box").html("<div class=\"alert alert-success\" role=\"alert\">"
          + msg + "</div>");
    };

    let irmaSessionFailed = function(msg) {
        if(msg === 'CANCELLED') {
            showWarning(msg);
        } else {
            showError(msg);
        }
    };

    $("#login-form-irma").on("submit", function() {
        console.log("IRMA signin button pressed");
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        $.ajax({
            type: "GET",
            url: server + "/web/login-irma",
            success: function(data) {
                irma.startSession(conf.irma_server_url, data, "publickey")
                  .then(({ sessionPtr, token }) => irma.handleSession(sessionPtr, {...irma_server_conf, token}))
                  .then(discloseSuccess, irmaSessionFailed);
            },
            error: showError,
            xhrFields: {
                withCredentials: true,
            },
        });

        return false;
    });

    $("#login-form-email").on("submit", function() {
        console.log("Email signin button pressed");
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        var email = $("#input-email").prop("value");
        var loginObject = { "email": email, "language": conf.language };

        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            url: server + "/web/login",
            data: JSON.stringify(loginObject),
            success: loginSuccess,
            error: loginError,
            xhrFields: {
                withCredentials: true,
            },
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
            xhrFields: {
                withCredentials: true,
            },
        });
    }

    function getUserObject(userId, onDone) {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + userId,
            success: onDone,
            error: function() {
                showError(strings.keyshare_session_expired);
                Cookies.remove("sessionid", { path: "/", domain: conf.cookie_domain });
                showLogin();
            },
            xhrFields: {
                withCredentials: true,
            },
        });
    }

    var user;

    $("#disable-btn").on("click", function() {
        BootstrapDialog.show({
            title: strings.keyshare_block_question,
            message: strings.keyshare_block_message,
            type: BootstrapDialog.TYPE_DANGER,
            buttons: [{
                id: "disable-cancel",
                label: strings.keyshare_cancel,
                cssClass: "btn-secondary",
                action: function(dialogRef) {
                    dialogRef.close();
                },
            }, {
                id: "disable-confirm",
                label: strings.keyshare_block,
                cssClass: "btn-danger",
                action: function(dialogRef) {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json;charset=utf-8",
                        url: server + "/web/users/" + user.ID + "/disable",
                        success: showUserPortal,
                        xhrFields: {
                            withCredentials: true,
                        },
                    });
                    dialogRef.close();
                },
            }],
        });
    });

    $("#delete-btn").on("click", function() {
        BootstrapDialog.show({
            title: strings.keyshare_delete_question,
            message: strings.keyshare_delete_message,
            type: BootstrapDialog.TYPE_DANGER,
            buttons: [{
                id: "delete-cancel",
                label: strings.keyshare_cancel,
                cssClass: "btn-secondary",
                action: function(dialogRef) {
                    dialogRef.close();
                },
            }, {
                id: "delete-confirm",
                label: strings.keyshare_delete,
                cssClass: "btn-danger",
                action: function(dialogRef) {
                    $.ajax({
                        type: "POST",
                        url: server + "/web/users/" + user.ID + "/delete",
                        success: function() {
                            showLoginContainer(strings.keyshare_deleted);
                        },
                        xhrFields: {
                            withCredentials: true,
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
        updateHeader();
        if (typeof message !== "undefined")
            showSuccess(message);
    }

    $("#logout-btn").on("click", function() {
        $.ajax({
            type: "GET",
            url: server + "/web/logout",
            success: function() {
                showLoginContainer(strings.keyshare_loggedout);
            },
            xhrFields: {
                withCredentials: true,
            },
        });
    });

    function showEnrolled(data) {
        user = data;
        Cookies.remove("enroll", { path: "/", domain: conf.cookie_domain });
        $("#enrollment-finished").show();
        updateHeader();
        $("span#enrollment-email-address").html(user.username); // TODO: check with sietse if this does anything
    }

    function showUserPortal(data) {
        console.log("Showing user Portal now");
        user = data;

        updateUserContainer();
        $("#user-candidates-container").hide();
        $("#login-container").hide();
        $("#user-container").show();
        updateHeader();
    }

    function updateUserContainer() {
        $("#username").html(user.username);
        $("#disable-btn").prop("disabled", !user.enabled);
        updateEmailAddresses();
        updateUserLogs();
    }

    function updateEmailAddresses() {
        if (user.emailAddresses.length > 0) {
            $("#no-known-email-addresses-text").hide();
            $("#email-addresses-table").show();
            $("#known-email-addresses-text").show();
        } else {
            $("#known-email-addresses-text").hide();
            $("#email-addresses-table").hide();
            $("#no-known-email-addresses-text").show();
        }
        updateHeader();

        var tableContent = $("#email-addresses-body");
        tableContent.empty();
        for (var i = 0; i < user.emailAddresses.length; i++) {
            var tr = $("<tr>").appendTo(tableContent);
            tr.append($("<td>", { text: user.emailAddresses[i] }));
            tr.append($("<button>", {
                class: "btn btn-primary btn-sm",
                text: strings.keyshare_delete,
                // Ugly voodoo to capture the current email address into the callback
                click: (function (email) { return function() {
                    confirmDeleteEmail(email);
                };})(user.emailAddresses[i]),
            }).wrap("<td>").parent());

        }
    }

    function confirmDeleteEmail(email) {
        BootstrapDialog.show({
            title: strings.delete_email_title,
            message: strings.delete_email_message,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [{
                id: "delete-cancel",
                label: strings.keyshare_cancel,
                cssClass: "btn-secondary",
                action: function(dialogRef) {
                    dialogRef.close();
                },
            }, {
                id: "delete-confirm",
                label: strings.keyshare_delete,
                cssClass: "btn-primary",
                action: function(dialogRef) {
                    $.ajax({
                        type: "POST",
                        url: server + "/web/users/" + user.ID + "/remove_email/" + email,
                        success: showUserPortal,
                        // TODO error
                        xhrFields: {
                            withCredentials: true,
                        },
                    });
                    dialogRef.close();
                },
            }],
        });
    }

    $("#add-email-btn").on("click", function() {
        $.ajax({
            type: "GET",
            url: server + "/web/users/" + user.ID + "/add_email",
            success: function(data) {
                irma.startSession(conf.irma_server_url, data, "publickey")
                  .then(({ sessionPtr, token }) => irma.handleSession(sessionPtr, {...irma_server_conf, token}))
                  .then(showEmailSuccess, irmaSessionFailed)
            },
            error: showError,
            xhrFields: {
                withCredentials: true,
            },
        });
    });

    function showEmailSuccess(jwt) {
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "text/plain",
            url: server + "/web/users/" + user.ID + "/add_email",
            data: jwt,
            success: showUserPortal,
            error: showError,
            xhrFields: {
                withCredentials: true,
            },
        });
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
            xhrFields: {
                withCredentials: true,
            },
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
        if (typeof strings === "undefined") {
            // If strings are not yet loaded, fail silently
            return "";
        }
        if (!("keyshare_event_" + entry.event in strings)) {
            showError(strings.keyshare_event_error);
            return "";
        }
        return strings["keyshare_event_" + entry.event].replace("{0}", entry.param);
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
        var token = Cookies.get("token");
        if (token !== undefined) {
            // Multiple user candidates were found, and we are not yet logged in
            // Fetch the candidates and render them in a table, allowing the user to choose one
            $.ajax({
                type: "GET",
                dataType: "json",
                url: server + "/web/candidates/" + token,
                success: function(candidates) {
                    Cookies.remove("token", { path: "/", domain: conf.cookie_domain });
                    showUserCandidates(token, candidates);
                },
                error: function() {
                    showError(strings.keyshare_session_expired);
                    Cookies.remove("token", { path: "/", domain: conf.cookie_domain });
                    showLogin();
                },
                xhrFields: {
                    withCredentials: true,
                },
            });
            return;
        }

        var sessionId = Cookies.get("sessionid");
        var userId = Cookies.get("userid");
        if (sessionId !== undefined) {
            if (Cookies.get("enroll") === "true") {
                getUserObject(userId, showEnrolled);
            } else {
                getUserObject(userId, showUserPortal);
            }
        } else {
            showLogin();
        }
    }

    function cookiesEnabled() {
        return ("cookie" in document && (document.cookie.length > 0
          || (document.cookie = "test").indexOf.call(document.cookie, "test") > -1));
    }

    function showUserCandidates(token, candidates) {
        $("#user-candidates-container").show();
        updateHeader();
        var tableContent = $("#user-candidates-body");
        var candidate;
        var relTime, absTime = "";
        for (var i = 0; i < candidates.length; i++) {
            candidate = candidates[i];
            if (!Number.isInteger(candidate.lastActive) || candidate.lastActive === 0) {
                relTime = strings.never;
            } else {
                absTime = moment.unix(candidate.lastActive).format("dddd, D MMM YYYY, H:mm:ss");
                relTime = moment.unix(candidate.lastActive).fromNow();
            }
            tableContent.append("<tr><td>" + candidate.username
              + "</td><td title='" + absTime + "'>" + relTime
              + "</td><td id=login-" + i + "></td></tr>");
            $("#login-" + i).append($("<button>", {
                class: "btn btn-primary btn-sm",
                text: strings.login,
                // Ugly voodoo to capture the current value of candidate.username into the callback
                click: (function (token, username) { return function() {
                    $.ajax({
                        type: "GET",
                        url: server + "/web/login/" + token + "/" + username,
                        success: tryLoginFromCookie,
                        error: function() {
                            showError(strings.keyshare_verification_error);
                        },
                        xhrFields: {
                            withCredentials: true,
                        },
                    });
                };})(token, candidate.username),
            }));
        }
    }

    function showLogin() {
        $("#login-container").show();
        updateHeader();
    }

    $("#show-main").on("click", function() {
        updateUserContainer();
        $("#enrollment-finished").hide();
        $("#user-container").show();
        updateHeader();
        return false;
    });

    $("a.frontpage").attr("href", window.location.href.replace(window.location.hash, ""));
    if (!cookiesEnabled())
        showError(strings.keyshare_cookies);
    else
        tryLoginFromCookie();
});
