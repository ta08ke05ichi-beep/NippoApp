import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// ==============================
// ホーム画面ボタン
// ==============================

document.getElementById("reportBtn").addEventListener("click", () => {

    location.href = "pages/report.html";

});


document.getElementById("reportsBtn").addEventListener("click", () => {

    location.href = "pages/reports.html";

});


document.getElementById("customersBtn").addEventListener("click", () => {

    location.href = "pages/customers.html";

});


document.getElementById("summaryBtn").addEventListener("click", () => {

    location.href = "pages/summary.html";

});


// ==============================
// 今月の訪問 → 訪問一覧
// ==============================

const monthVisitBtn =
    document.getElementById("monthVisitBtn");


if (monthVisitBtn) {

    monthVisitBtn.addEventListener("click", () => {

        const today = new Date();

        const month =
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}`;

        location.href =
            `pages/visit-list.html?month=${month}&name=全員`;

    });

}


// ==============================
// 今日の日報
// ==============================

async function loadTodayReports() {

    try {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

        const todayText =
            `${year}-${month}-${day}`;


        const snapshot =
            await getDocs(
                collection(db, "reports")
            );


        let count = 0;


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            // 下書きは除外
            if (
                data.status === "draft"
            ) {

                return;

            }


            if (
                data.date === todayText
            ) {

                count++;

            }

        });


        const element =
            document.getElementById(
                "todayCount"
            );


        if (element) {

            element.textContent =
                `${count}件`;

        }

    }
    catch (error) {

        console.error(
            "今日の日報読み込みエラー",
            error
        );

    }

}


// ==============================
// 今月のデータ
// ==============================

async function loadMonthlyDashboard() {

    try {

        const today =
            new Date();


        const month =
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}`;


        const snapshot =
            await getDocs(
                collection(db, "reports")
            );


        let visitCount = 0;

        let workCount = 0;

        const visitedCustomers =
            new Set();


        const personCounts = {};


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            // 下書き除外
            if (
                data.status === "draft"
            ) {

                return;

            }


            // 今月だけ
            if (
                !data.date ||
                !data.date.startsWith(month)
            ) {

                return;

            }


            if (
                !Array.isArray(data.tasks)
            ) {

                return;

            }


            const person =
                data.name || "担当者不明";


            if (
                !personCounts[person]
            ) {

                personCounts[person] = 0;

            }


            data.tasks.forEach(task => {

                // ==========================
                // 🚗 訪問件数
                // ==========================

                visitCount++;

                personCounts[person]++;


                // ==========================
                // 🏢 訪問顧客
                // ==========================

                if (
                    task.customer
                ) {

                    visitedCustomers.add(
                        task.customer
                    );

                }


                // ==========================
                // 🔧 作業件数
                // ==========================

                if (
                    task.work ||
                    task.content
                ) {

                    workCount++;

                }

            });

        });


        // ==============================
        // 件数表示
        // ==============================

        const monthElement =
            document.getElementById(
                "monthCount"
            );


        if (monthElement) {

            monthElement.textContent =
                `${visitCount}件`;

        }


        const workElement =
            document.getElementById(
                "workCount"
            );


        if (workElement) {

            workElement.textContent =
                `${workCount}件`;

        }


        const customerElement =
            document.getElementById(
                "visitedCustomerCount"
            );


        if (customerElement) {

            customerElement.textContent =
                `${visitedCustomers.size}社`;

        }


        // ==============================
        // 👤 担当者別
        // ==============================

        showPersonSummary(
            personCounts
        );


        console.log(
            "今月訪問:",
            visitCount
        );

        console.log(
            "今月作業:",
            workCount
        );

        console.log(
            "今月訪問顧客:",
            visitedCustomers.size
        );

    }
    catch (error) {

        console.error(
            "月間ダッシュボード読み込みエラー",
            error
        );

    }

}


// ==============================
// 👤 担当者別表示
// ==============================

function showPersonSummary(
    personCounts
) {

    const element =
        document.getElementById(
            "personSummary"
        );


    if (!element) {

        return;

    }


    element.innerHTML = "";


    const people =
        Object.keys(
            personCounts
        ).sort((a, b) =>
            a.localeCompare(
                b,
                "ja"
            )
        );


    if (
        people.length === 0
    ) {

        element.innerHTML =
            "<p>今月の訪問はありません</p>";

        return;

    }


    people.forEach(name => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "person-summary-item";


        div.innerHTML = `

            <p>
                👤 ${name}
            </p>

            <strong>
                🚗 ${personCounts[name]}件
            </strong>

        `;


        element.appendChild(
            div
        );

    });

}


// ==============================
// 登録顧客数
// ==============================

async function loadCustomerTotal() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "customers")
            );


        const element =
            document.getElementById(
                "customerTotal"
            );


        if (element) {

            element.textContent =
                `${snapshot.size}社`;

        }

    }
    catch (error) {

        console.error(
            "顧客数読み込みエラー",
            error
        );

    }

}


// ==============================
// 最近の日報
// ==============================

async function loadRecentReports() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "reports")
            );


        const reports = [];


        snapshot.forEach(docSnap => {

            reports.push({

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        });


        reports.sort((a, b) => {

            return (b.date || "")
                .localeCompare(
                    a.date || ""
                );

        });


        const element =
            document.getElementById(
                "recentReports"
            );


        if (!element) {

            return;

        }


        element.innerHTML = "";


        if (
            reports.length === 0
        ) {

            element.innerHTML =
                "<p>最近の日報はありません</p>";

            return;

        }


        reports
            .slice(0, 5)
            .forEach(report => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "report-card";


                div.innerHTML = `

                    <p>
                        📅 ${report.date || ""}
                    </p>

                    <p>
                        👤 ${report.name || ""}
                    </p>

                    ${
                        report.status === "draft"
                            ? `<p>📝 下書き</p>`
                            : `<p>✅ 提出済み</p>`
                    }

                `;


                div.onclick = () => {

                    if (
                        report.status === "draft"
                    ) {

                        location.href =
                            `pages/report.html?draftId=${report.id}`;

                    }
                    else {

                        location.href =
                            `pages/report-detail.html?id=${report.id}`;

                    }

                };


                element.appendChild(
                    div
                );

            });

    }
    catch (error) {

        console.error(
            "最近の日報読み込みエラー",
            error
        );

    }

}


// ==============================
// ホーム画面読み込み
// ==============================

Promise.all([

    loadTodayReports(),

    loadMonthlyDashboard(),

    loadCustomerTotal(),

    loadRecentReports()

]);