# Coursera Enhancement Userscripts

This repo contains a pack of userscripts aimed at improving the UX of the [Coursera](https://www.coursera.org) website.

## Installation instruction

1. Install userscript manager ([Violentmonkey](https://violentmonkey.github.io/), [Firemonkey](https://addons.mozilla.org/en-US/firefox/addon/firemonkey/), etc.)
2. Click on the "Download" button in the table below
3. Confirm installation in the userscript manager

## List of scripts

| Userscript        | Link                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Video Enhancer    | [Download](https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-video-enhancer.user.js)    |
| Clean discussions | [Download](https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-clean-discussions.user.js) |
| Degree grades     | [Download](https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-grades.user.js)            |

### Video enhancer

[Video enhancer](src/coursera-video-enhancer.user.js) adds subtitles directly under the video player and video speed controls above it. Additionally, it allows the hiding of the top bar on pages with video by modifying `hideTopBar` variable.

### Coursera clean discussions

[Coursera clean discussions](src/coursera-clean-discussions.user.js) userscript removes responses from discussion prompts that consist only of spaces, dots, or a single character.

### Coursera degree assignments and grades

[Coursera degree grades](src/coursera-grades.user.js) userscript creates a table on the degree [home page](https://www.coursera.org/degrees/bachelor-of-science-computer-science-london/home/) with all graded assignments for current modules taken by students who study for a degree via Coursera.
