// ==UserScript==
// @name            Coursera Grades
// @description     Shows on the home page the grades for all current graded assignments for those who are getting their degree on Coursera
// @namespace       https://github.com/SergiusGit
// @homepageURL     https://github.com/SergiusGit/Coursera-userscripts/
// @supportURL      https://github.com/SergiusGit/Coursera-userscripts/issues
// @updateURL       https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-grades.user.js
// @downloadURL     https://raw.githubusercontent.com/SergiusGit/Coursera-userscripts/master/src/coursera-grades.user.js
// @match           https://www.coursera.org/degrees/*/home*
// @icon            https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-194x194.png
// @grant           none
// @version         1.8
// @author          Sergius
// @license         MIT
// @run-at          document-end
// ==/UserScript==

(() => {
    const modulesBlocklist = ["5Xzmk6wnEei80xI77XeCqA"];

    const css = `
        .grades-table {
            width: 100%;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-collapse: collapse;
            box-shadow: rgba(31, 31, 31, 0.12) 0px 1px 6px, rgba(31, 31, 31, 0.12) 0px 1px 4px;
            color: rgb(31, 31, 31);
            background-color: rgb(255, 255, 255);
        }

        .grades-table > table {
            width: 100%;
        }

        .grades-table th {
            padding: 0.5rem;
            border-bottom: 1px solid rgb(229, 231, 232);
        }

        .grades-table td {
            padding: 0.5rem;
            vertical-align: top;
        }

        .grades-table tr.passed-modules-table:hover:not(.passed-header) {
            background-color: rgba(255, 0, 0, 0.1);
        }

        .grades-table .passed-modules-table.hidden {
            display: none;
        }

        .grades-table .passed-header {
            font-weight: bold;
            padding-top: 1rem;
        }

        .grades-table .dotted {
            text-decoration: underline dotted;
        }
    `;

    const verbose = false;

    const styleBlock = document.createElement("style");
    styleBlock.innerText = css;
    document.head.appendChild(styleBlock);

    let isLoadingPassed = false;
    let isPassedHidden = true;

    let userID = null;
    let degreeID = null;

    fetch("https://www.coursera.org/api/adminUserPermissions.v1?q=my")
        .then((res) => res.json())
        .then((user) => {
            userID = user.elements[0].id;
        });

    XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (value) {
        this.addEventListener(
            "progress",
            () => {
                if (value) {
                    const valueJSON = JSON.parse(value);
                    if ("degreeId" in valueJSON) {
                        degreeID = valueJSON["degreeId"];
                        XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.realSend;
                        const idWatcherInterval = setInterval(() => {
                            if (userID) {
                                clearInterval(idWatcherInterval);
                                getDegreeHomeCalendar(userID, degreeID);
                            }
                        }, 250);
                    }
                }
            },
            false
        );
        this.realSend(value);
    };

    function getDegreeHomeCalendar(userID, degreeID) {
        verbose && console.log("Coursera Grades: Credentials retrieved. Requesting grades...");
        verbose && console.log(`Coursera Grades: User ID = ${userID}, Degree ID = ${degreeID}`);
        const credentials = {
            userId: userID,
            degreeId: degreeID,
        };

        const url =
            "https://www.coursera.org/api/grpc/degreehome/v1beta1/DegreeHomeCalendarAPI/GetDegreeHomeCalendar";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(credentials),
        })
            .then((res) => res.json())
            .then((calendarItems) => checkDOM(calendarItems["calendarItems"]));
    }

    function checkDOM(calendarItems) {
        verbose && console.log("Coursera Grades: Grades retrieved. Preparing DOM...");
        const intervalID = setInterval(() => {
            const homePanel = document.querySelector("div#cds-react-aria-1-panel-home").firstChild
                .firstChild;

            if (homePanel) {
                verbose && console.log("Coursera Grades: Drawing table...");
                clearInterval(intervalID);
                appendTableTo(homePanel, calendarItems);
            }
        }, 100);
    }

    function appendTableTo(homePanel, calendarItems) {
        let tableData = [];

        for (let i = 0; i < calendarItems.length; ++i) {
            const assignment = calendarItems[i]["assignment"];
            if (
                assignment &&
                (assignment["gradingWeight"] !== 0 ||
                    assignment["assignmentType"] === "staffGraded") &&
                !modulesBlocklist.includes(assignment["courseId"])
            ) {
                tableData.push({
                    module: assignment["courseName"],
                    assignment: assignment["assignmentName"],
                    grade: (assignment["grade"] * 100).toFixed(2),
                    time: assignment["dueAtTime"],
                    gradedAt: assignment["gradedAtTime"],
                    weight: assignment["gradingWeight"],
                    courseUrl: assignment["courseUrl"],
                    url: assignment["assignmentUrl"],
                });
            }
        }

        tableData.sort((a, b) => {
            if (a["module"] < b["module"]) return -1;
            if (a["module"] > b["module"]) return 1;
            if (a["time"] < b["time"]) return -1;
            if (a["time"] > b["time"]) return 1;
            return 0;
        });

        let moduleTotal = {};

        let grades = document.createElement("table");

        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        let thCells = ["Module", "Assignment", "Grade", "Deadline"];
        thCells.forEach((text) => {
            let th = document.createElement("th");
            th["scope"] = "col";
            th.innerText = text;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        grades.appendChild(thead);

        let tbody = document.createElement("tbody");

        tableData.forEach((entry, i, data) => {
            let row = document.createElement("tr");
            let module = null;
            if (i === 0 || data[i]["module"] !== data[i - 1]["module"]) {
                let moduleA = document.createElement("a");
                moduleA.href = "https://www.coursera.org" + entry["courseUrl"];
                moduleA.innerText = entry["module"];
                module = document.createElement("td");
                module.appendChild(moduleA);
                module.rowSpan = 1;
            } else {
                for (r = tbody.rows.length - 1; r >= 0; --r) {
                    if (tbody.rows[r].cells[0].hasAttribute("rowSpan")) {
                        ++tbody.rows[r].cells[0].rowSpan;
                        break;
                    }
                }
            }
            let assignmentA = document.createElement("a");
            assignmentA.href = "https://www.coursera.org" + entry["url"];
            assignmentA.innerText = entry["assignment"];
            let assignment = document.createElement("td");
            assignment.appendChild(assignmentA);
            if (entry["weight"] == 0) {
                let zeroWeightLable = document.createElement("span");
                zeroWeightLable.innerText = " (0 weight)";
                assignment.appendChild(zeroWeightLable);
            }
            let grade = document.createElement("td");
            grade.innerText = isNaN(entry["grade"]) ? "—" : entry["grade"] + "%";
            moduleTotal[entry["module"]] =
                (moduleTotal[entry["module"]] || 0) +
                (isNaN(entry["grade"]) ? 0 : entry["grade"]) * entry["weight"];
            if (entry["gradedAt"]) {
                grade.title = `Graded at ${new Date(entry["gradedAt"]).toLocaleString()}`;
                grade.classList.add("dotted");
            }
            let time = document.createElement("td");
            time.innerText = new Date(entry["time"]).toLocaleDateString();

            if (module) row.appendChild(module);
            row.appendChild(assignment);
            row.appendChild(grade);
            row.appendChild(time);

            tbody.appendChild(row);

            if (i === data.length - 1 || data[i]["module"] !== data[i + 1]["module"]) {
                let row = document.createElement("tr");

                for (r = tbody.rows.length - 1; r >= 0; --r) {
                    if (tbody.rows[r].cells[0].hasAttribute("rowSpan")) {
                        ++tbody.rows[r].cells[0].rowSpan;
                        break;
                    }
                }
                let assignment = document.createElement("td");
                assignment.innerText = "Module grade";
                let grade = document.createElement("td");
                grade.innerText = moduleTotal[entry["module"]].toFixed(2) + "%";
                row.appendChild(assignment);
                row.appendChild(grade);

                tbody.appendChild(row);
            }
        });

        const changeExperienceBtn = document
            .evaluate(
                "//button[contains(., 'experience')]",
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            )
            .iterateNext();
        let togglePassedModulesBtn = document.createElement("button");
        togglePassedModulesBtn.innerText = "Load ended modules";
        togglePassedModulesBtn.classList.add(...changeExperienceBtn.classList);
        togglePassedModulesBtn.addEventListener("click", () => {
            togglePassedModules(tbody, togglePassedModulesBtn);
        });
        changeExperienceBtn.parentNode.insertBefore(togglePassedModulesBtn, changeExperienceBtn);

        grades.appendChild(tbody);

        let container = document.createElement("div");
        container.classList.add("grades-table");
        container.appendChild(grades);

        homePanel.parentNode.insertBefore(container, homePanel);

        verbose && console.log("Coursera Grades: Done");
    }

    function togglePassedModules(tbody, btn) {
        if (isLoadingPassed) return;
        const passedModulesRows = document.querySelectorAll(".passed-modules-table");
        if (passedModulesRows.length == 0) {
            isLoadingPassed = true;
            loadPassedModules(tbody, btn);
        } else {
            if (isPassedHidden) {
                btn.innerText = "Show ended modules";
            } else {
                btn.innerText = "Hide ended modules";
            }
            passedModulesRows.forEach((el) => el.classList.toggle("hidden"));
            isPassedHidden = !isPassedHidden;
        }
    }

    function loadPassedModules(tbody, btn) {
        fetch(
            `https://www.coursera.org/api/degreeLearnerCourseStates.v1/${userID}~${degreeID.replace(
                "base",
                "base!"
            )}`
        )
            .then((res) => res.json())
            .then((jsonPassed) => {
                verbose && console.log("Coursera Grades: Loading past modules...");
                const passedModules = jsonPassed.elements[0].passed;

                let sectionHeader = document.createElement("tr");
                let sectionHeaderCell = document.createElement("td");
                sectionHeaderCell.innerText = "Passed Modules";
                sectionHeaderCell.classList.add("passed-header");
                sectionHeader.classList.add("passed-modules-table", "passed-header");
                sectionHeader.appendChild(sectionHeaderCell);
                tbody.appendChild(sectionHeader);

                let fetches = [];

                passedModules.forEach((module) => {
                    if (!modulesBlocklist.includes(module.id)) {
                        let f = fetch(
                            `https://www.coursera.org/api/onDemandCoursePresentGrades.v1/${userID}~${module.id}?fields=grade`
                        )
                            .then((res) => res.json())
                            .then((jsonGrade) => {
                                const grade = jsonGrade.elements[0].grade;
                                let tr = document.createElement("tr");
                                let tdName = document.createElement("td");
                                let anchor = document.createElement("a");
                                anchor.innerText = module.name;
                                anchor.href = `https://www.coursera.org/learn/${module.slug}/home/welcome`;
                                tdName.colSpan = 2;
                                tdName.appendChild(anchor);
                                let tdGrade = document.createElement("td");
                                tdGrade.innerText = (grade * 100).toFixed(2) + "%";
                                tr.appendChild(tdName);
                                tr.appendChild(tdGrade);
                                tr.classList.add("passed-modules-table");
                                tbody.appendChild(tr);
                            });
                        fetches.push(f);
                    }
                });
                Promise.all(fetches).then(() => {
                    verbose && console.log("Coursera Grades: Past modules loaded");
                    isLoadingPassed = false;
                    btn.innerText = "Hide ended modules";
                });
            });
    }
})();
