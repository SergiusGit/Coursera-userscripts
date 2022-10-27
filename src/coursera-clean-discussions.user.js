// ==UserScript==
// @name            Clean Coursera discussions
// @description     Removes messages in Coursera discussions that consist of only dots or a single symbol
// @namespace       https://github.com/SergiusGit
// @homepageURL     https://github.com/SergiusGit/Coursera-userscripts/
// @supportURL      https://github.com/SergiusGit/Coursera-userscripts/issues
// @updateURL       https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-clean-discussions.user.js
// @downloadURL     https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-clean-discussions.user.js
// @match           https://www.coursera.org/learn/*
// @icon            https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-194x194.png
// @grant           none
// @version         1.0
// @author          Sergius
// @license         MIT
// @run-at          document-start
// ==/UserScript==

(() => {
    let oldXMLHttpRequest = XMLHttpRequest;

    XMLHttpRequest = function () {
        let actual = new oldXMLHttpRequest();
        let self = this;

        this.onreadystatechange = null;

        actual.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.responseURL.includes("/api/onDemandCourseForumAnswers.v1")) {
                    let forumAnswers = JSON.parse(this.responseText);
                    forumAnswers.elements = forumAnswers.elements.filter((answer) => {
                        return !/<co-content><text>([\.\s\u200B]*|.[\s\u200B]*)<\/text>(<text \/>)*<\/co-content>/.test(
                            answer.content.definition.value
                        );
                    });
                    const res = JSON.stringify(forumAnswers);
                    self.response = res;
                    self.responseText = res;
                } else {
                    self.responseText = this.responseText;
                }
            }
            if (self.onreadystatechange) {
                return self.onreadystatechange();
            }
        };

        [
            "status",
            "statusText",
            "responseType",
            "response",
            "readyState",
            "responseXML",
            "upload",
        ].forEach(function (item) {
            Object.defineProperty(self, item, {
                get: function () {
                    return actual[item];
                },
            });
        });

        ["ontimeout, timeout", "withCredentials", "onload", "onerror", "onprogress"].forEach(
            function (item) {
                Object.defineProperty(self, item, {
                    get: function () {
                        return actual[item];
                    },
                    set: function (val) {
                        actual[item] = val;
                    },
                });
            }
        );

        [
            "addEventListener",
            "send",
            "abort",
            "open",
            "getAllResponseHeaders",
            "getResponseHeader",
            "overrideMimeType",
            "setRequestHeader",
        ].forEach(function (item) {
            Object.defineProperty(self, item, {
                value: function () {
                    return actual[item].apply(actual, arguments);
                },
            });
        });
    };
})();
