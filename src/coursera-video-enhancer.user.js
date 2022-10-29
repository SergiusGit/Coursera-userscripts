// ==UserScript==
// @name            Coursera video enhancer
// @description     Adds subtitles directly under the video and adds buttons to regulate video speed, and removes the top bar while watching videos on Coursera
// @namespace       https://github.com/SergiusGit
// @homepageURL     https://github.com/SergiusGit/Coursera-userscripts/
// @supportURL      https://github.com/SergiusGit/Coursera-userscripts/issues
// @updateURL       https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-video-enhancer.user.js
// @downloadURL     https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-video-enhancer.user.js
// @include         *://www.coursera.org/learn/*
// @icon            https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-194x194.png
// @grant           none
// @version         1.2.1
// @author          Sergius
// @license         MIT
// @run-at          document-end
// ==/UserScript==

(() => {
    /**
     * Subtitles' style.
     *
     * @type       {string}
     */
    const subsStyle = `
        font-size: 18px;
        text-align: center;
        margin: 16px;
    `;

    const playbackDelta = 0.25;

    /**
     * Number of seconds between checks.
     *
     * @type       {number}
     */
    const intervalSize = 3;

    const hideTopBar = false;
    const regex = /coursera.org\/learn\/.*\/lecture/i;

    /**
     * Takes highlighted subtitles and places them in the div block under the
     * video player.
     *
     * @param      {Element}  transcript        The transcript element
     * @param      {Element}  highlightManager  The block under the video
     */
    function addSubtitles(transcript, highlightManager) {
        const subs = document.createElement("div");
        subs.style.cssText = subsStyle;
        subs.classList.add("outer-subtitles");
        highlightManager.insertBefore(subs, highlightManager.childNodes[0]);

        new MutationObserver(() => {
            const active = transcript.querySelector(".active span");
            subs.innerHTML = active.innerHTML;
        }).observe(transcript, {
            subtree: true,
            attributeFilter: ["class"],
        });
    }

    setInterval(() => {
        // Subtitles
        const highlightManager = document.querySelector(".rc-VideoHighlightingManager");
        if (highlightManager) {
            const transcript = highlightManager.querySelector(".rc-Transcript");
            const subs = highlightManager.querySelector(".outer-subtitles");
            if (transcript && highlightManager && !subs) {
                addSubtitles(transcript, highlightManager);
            }
        }

        // Playback speed controls + top bar

        const banner = document.querySelector(".ItemPageLayout_banner");
        const container = document.querySelector(".ItemPageLayout_container");

        const videoNav = document.querySelector(".ItemLecture_Video_Notes_Navigation");

        if (regex.test(window.location.href)) {
            const video = document.querySelector("video");

            if (hideTopBar) {
                banner.style.display = "none";
                container.style.top = "0px";
            }

            if (!videoNav.querySelector(".speed-nav")) {
                const speedDownBtnX2 = document.createElement("button");
                speedDownBtnX2.classList.add("speed-nav");
                speedDownBtnX2.innerHTML = "◄◄";
                speedDownBtnX2.addEventListener("click", () => {
                    video.playbackRate -= playbackDelta * 2;
                });
                videoNav.appendChild(speedDownBtnX2);

                const speedDownBtn = document.createElement("button");
                speedDownBtn.classList.add("speed-nav");
                speedDownBtn.innerHTML = "◄";
                speedDownBtn.addEventListener("click", () => {
                    video.playbackRate -= playbackDelta;
                });
                videoNav.appendChild(speedDownBtn);

                const speedInput = document.createElement("input");
                speedInput.type = "number";
                speedInput.value = document.querySelector("video").playbackRate;
                speedInput.step = playbackDelta;
                speedInput.min = 0;
                speedInput.max = 8;
                speedInput.setAttribute("required", "");
                speedInput.style.width = "4em";
                speedInput.addEventListener("input", () => {
                    video.playbackRate = speedInput.value;
                });
                video.addEventListener("ratechange", () => {
                    speedInput.value = video.playbackRate;
                });
                videoNav.appendChild(speedInput);

                const speedUpBtn = document.createElement("button");
                speedUpBtn.classList.add("speed-nav");
                speedUpBtn.innerHTML = "►";
                speedUpBtn.addEventListener("click", () => {
                    video.playbackRate += playbackDelta;
                });
                videoNav.appendChild(speedUpBtn);

                const speedUpBtnX2 = document.createElement("button");
                speedUpBtnX2.classList.add("speed-nav");
                speedUpBtnX2.innerHTML = "►►";
                speedUpBtnX2.addEventListener("click", () => {
                    video.playbackRate += playbackDelta * 2;
                });
                videoNav.appendChild(speedUpBtnX2);
            }
        }
    }, intervalSize * 1000);
})();
