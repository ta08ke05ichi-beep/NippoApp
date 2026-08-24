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

        console.log("今日の日報読み込み開始");

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


        snapshot.forEach((doc) => {

            const data = doc.data();

            if (data.date === todayText) {

                count++;

            }

        });


        const element =
            document.getElementById("todayCount");


        if (element) {

            element.textContent =
                `${count}件`;

        }

        console.log(
            "今日の日報件数:",
            count
        );

    }
    catch (error) {

        console.error(
            "今日の日報読み込みエラー",
            error
        );

    }

}

// ==============================
// 今月の訪問
// ==============================

async function loadMonthReports() {

    try {

        const today = new Date();

        const month =
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}`;


        const snapshot =
            await getDocs(
                collection(db, "reports")
            );


        let count = 0;


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            // 今月の日報だけ
            if (
                !data.date ||
                !data.date.startsWith(month)
            ) {

                return;

            }


            // tasksがない日報は除外
            if (
                !Array.isArray(data.tasks)
            ) {

                return;

            }


            // tasksの数 = 訪問件数
            count += data.tasks.length;

        });


        const element =
            document.getElementById("monthCount");


        if (element) {

            element.textContent =
                `${count}件`;

        }


        console.log(
            "今月の訪問件数:",
            count
        );

    }
    catch (error) {

        console.error(
            "今月の訪問読み込みエラー",
            error
        );

    }

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
            document.getElementById("customerTotal");


        if (element) {

            element.textContent =
                `${snapshot.size}社`;

        }


        console.log(
            "登録顧客数:",
            snapshot.size
        );

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


        snapshot.forEach((doc) => {

            reports.push({

                id: doc.id,

                ...doc.data()

            });

        });


        // 日付の新しい順

        reports.sort((a, b) => {

            return (b.date || "")
                .localeCompare(a.date || "");

        });


        const element =
            document.getElementById("recentReports");


        if (!element) {

            return;

        }


        element.innerHTML = "";


        if (reports.length === 0) {

            element.innerHTML =
                "<p>最近の日報はありません</p>";

            return;

        }


        reports
            .slice(0, 5)
            .forEach((report) => {

                element.innerHTML += `

                    <div
                        class="report-card"
                        onclick="openReport('${report.id}')"
                    >

                        <p>
                            📅 ${report.date || ""}
                        </p>

                        <p>
                            👤 ${report.name || ""}
                        </p>

                    </div>

                `;

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
// 日報詳細
// ==============================

window.openReport = function(id) {

    location.href =
        `pages/report-detail.html?id=${id}`;

};


// ==============================
// ホーム画面読み込み
// ==============================

Promise.all([
    loadTodayReports(),
    loadMonthReports(),
    loadCustomerTotal(),
    loadRecentReports()
]);