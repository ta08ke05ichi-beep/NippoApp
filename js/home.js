import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// ==============================
// ホーム画面ボタン
// ==============================

document.getElementById("reportBtn")
.addEventListener("click", () => {

    location.href = "pages/report.html";

});


document.getElementById("reportsBtn")
.addEventListener("click", () => {

    location.href = "pages/reports.html";

});


document.getElementById("customersBtn")
.addEventListener("click", () => {

    location.href = "pages/customers.html";

});


document.getElementById("summaryBtn")
.addEventListener("click", () => {

    location.href = "pages/summary.html";

});


// ==============================
// 今月の訪問 → 訪問一覧
// ==============================

const monthVisitBtn =
document.getElementById("monthVisitBtn");

if(monthVisitBtn){

    monthVisitBtn.addEventListener("click", () => {

        location.href = "pages/visit-list.html";

    });

}


// ==============================
// 今日の日報
// ==============================

async function loadTodayReports(){

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


    snapshot.forEach(doc => {

        const data = doc.data();

        if(data.date === todayText){

            count++;

        }

    });


    const element =
    document.getElementById("todayCount");


    if(element){

        element.textContent =
        `${count}件`;

    }

}


// ==============================
// 今月の訪問
// ==============================

async function loadMonthReports(){

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


    snapshot.forEach(doc => {

        const data = doc.data();


        if(
            data.date &&
            data.date.startsWith(month)
        ){

            count++;

        }

    });


    const element =
    document.getElementById("monthCount");


    if(element){

        element.textContent =
        `${count}件`;

    }

}


// ==============================
// 登録顧客数
// ==============================

async function loadCustomerTotal(){

    const snapshot =
    await getDocs(
        collection(db, "customers")
    );


    const element =
    document.getElementById("customerTotal");


    if(element){

        element.textContent =
        `${snapshot.size}社`;

    }

}


// ==============================
// 最近の日報
// ==============================

async function loadRecentReports(){

    const snapshot =
    await getDocs(
        collection(db, "reports")
    );


    const reports = [];


    snapshot.forEach(doc => {

        reports.push({

            id: doc.id,

            ...doc.data()

        });

    });


    // 日付の新しい順

    reports.sort((a, b) => {

        return b.date.localeCompare(a.date);

    });


    const element =
    document.getElementById("recentReports");


    if(!element){

        return;

    }


    element.innerHTML = "";


    reports
    .slice(0, 5)
    .forEach(report => {


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


// ==============================
// 日報詳細へ
// ==============================

window.openReport = function(id){

    location.href =
    `pages/report-detail.html?id=${id}`;

};


// ==============================
// 読み込み開始
// ==============================

loadTodayReports();

loadMonthReports();

loadCustomerTotal();

loadRecentReports();