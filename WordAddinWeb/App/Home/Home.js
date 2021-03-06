﻿/// <reference path="../App.js" />

(function () {
    "use strict";

    // remove this object to completely stop logging in ADAL
    window.Logging = {
        level: 3,
        log: function (message) {
            $('#adal-log').append('<div>' + message + '</div>');
        }
    };

    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            $('#admin-consent').click(adminConsent);
            $('#use-graph-api').click(useGraphAPI);
            if (!(new AuthenticationContext()).getCachedUser()) {
                $('#admin-consent').hide();
                $('#use-graph-api').hide();
            }
        });
    };

    // Request admin to consent for necessary permissions
    function adminConsent() {
        var adal = new AuthenticationContext();
        adal.config.displayCall = function adminFlowDisplayCall(urlNavigate) {
            urlNavigate += '&prompt=admin_consent';
            adal.promptUser(urlNavigate);
        };
        adal.login();
        adal.config.displayCall = null;
    }

    // Reads and displays user information from Graph API
    function useGraphAPI() {
        var baseEndpoint = 'https://graph.microsoft.com';
        var authContext = new AuthenticationContext();
        var result = $("#results");
        
        authContext.acquireToken(baseEndpoint, function (error, token) {
            if (error || !token) {
                authContext.config.displayCall = function adminFlowDisplayCall(urlNavigate) {
                    urlNavigate = _addHintParameters(urlNavigate);
                };
                authContext.login();
                adal.config.displayCall = null;
                return;
            }
            var email = authContext._user.userName;
            var url = "https://graph.microsoft.com/v1.0/me/";
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("Accept", "application/json");
                },
                type: "GET",
                url: url,
                dataType: "json",
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            }).done(function (response) {
                var html = "<ul>";
                html += getPropertyHtml("Display name", response.displayName);
                html += getPropertyHtml("userPrincipalName", response.userPrincipalName);
                html += getPropertyHtml("Mail", response.mail);
                $("#results").html(html);
            }).fail(function (response) {
                app.showNotification(response.responseText);
            });
        });
    }

    function getPropertyHtml(key, value) {
        return "<li><strong>" + key + "</strong> : " + value + "</li>";
    }

})();
