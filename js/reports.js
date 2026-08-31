import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("reports.js 起動");


// ==============================
// 要素取得
// ==============================

const reportList =
    document.getElementById("reportList");

const searchInput =
    document.getElementById("searchInput");

const personFilter =
    document.getElementById("personFilter");

const monthFilter =
    document.getElementById("monthFilter");

const statusFilter =
    document.getElementById("statusFilter");

const clearFilterBtn =
    document.getElementById("clearFilterBtn");


let reports = [];


// ==============================
// 日報読み込み
// ==============================

async function loadReports() {

    try {

        const q = query(
            collection(db, "reports"),
            orderBy("date", "desc")
        );

        const snapshot =
            await getDocs(q);

        reports = [];

        snapshot.forEach(docSnap => {

            reports.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        console.log(
            "日報読み込み完了:",
            reports.length
        );


        // 担当者
        createPersonFilter();


        // 年月
        createMonthFilter();


        // 初期表示
        filterReports();

    }
    catch (error) {

        console.error(
            "日報読み込みエラー",
            error
        );

        reportList.innerHTML = `
            <div class="no-reports">
                <p>日報の読み込みに失敗しました。</p>
            </div>
        `;

    }

}


// ==============================
// 👤 担当者フィルター
// ==============================

function createPersonFilter() {

    if (!personFilter) {
        return;
    }


    // いったん空にする
    personFilter.innerHTML = "";


    // ==========================
    // 全員
    // ==========================

    const allOption =
        document.createElement("option");

    allOption.value = "";

    allOption.textContent =
        "全員";

    personFilter.appendChild(
        allOption
    );


    // ==========================
    // 日報に入っている担当者
    // ==========================

    const people = [
        ...new Set(
            reports
                .map(report => report.name)
                .filter(name =>
                    name &&
                    name.trim() !== ""
                )
        )
    ];


    // 名前順
    people.sort((a, b) =>
        a.localeCompare(b, "ja")
    );


    // ==========================
    // 担当者を追加
    // ==========================

    people.forEach(name => {

        const option =
            document.createElement("option");

        option.value =
            name;

        option.textContent =
            name;

        personFilter.appendChild(
            option
        );

    });


    console.log(
        "担当者一覧:",
        people
    );

}


// ==============================
// 年月フィルター
// ==============================

function createMonthFilter(){

    if(!monthFilter){
        return;
    }

    monthFilter.innerHTML = "";

    const months = [
        ...new Set(
            reports
                .map(report => {

                    if(!report.date){
                        return "";
                    }

                    return report.date.substring(0, 7);

                })
                .filter(month => month)
        )
    ];

    months.sort((a, b) =>
        b.localeCompare(a)
    );

    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;

        const [year, mon] =
            month.split("-");

        option.textContent =
            `${year}年${Number(mon)}月`;

        monthFilter.appendChild(option);

    });

    // 最新の年月を最初に選択
    if(months.length > 0){

        monthFilter.value = months[0];

    }

}


// ==============================
// フィルター
// ==============================

function filterReports() {

    const keyword =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const person =
        personFilter
            ? personFilter.value
            : "";


    const month =
        monthFilter
            ? monthFilter.value
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const result =
        reports.filter(report => {


            // ==========================
            // 担当者
            // ==========================

            if (
                person &&
                person !== "all" &&
                report.name !== person
            ) {

                return false;

            }


            // ==========================
            // 年月
            // ==========================

            if (
                month &&
                month !== "all"
            ) {

                const reportDate =
                    report.date || "";


                if (
                    !reportDate.startsWith(month)
                ) {

                    return false;

                }

            }


            // ==========================
            // 状態
            // ==========================

            if (
                status &&
                status !== "all"
            ) {

                // 下書き
                if (
                    status === "draft" &&
                    report.status !== "draft"
                ) {

                    return false;

                }


                // 提出済み
                if (
                    status === "submitted" &&
                    report.status === "draft"
                ) {

                    return false;

                }

            }


            // ==========================
            // キーワード
            // ==========================

            if (keyword) {

                let target = "";

                target +=
                    report.name || "";

                target +=
                    report.date || "";


                if (
                    Array.isArray(report.tasks)
                ) {

                    report.tasks.forEach(task => {

                        target +=
                            task.customer || "";

                        target +=
                            task.content || "";

                        target +=
                            task.work || "";

                        target +=
                            task.address || "";

                        target +=
                            task.tel || "";

                    });

                }


                if (
                    !target
                        .toLowerCase()
                        .includes(keyword)
                ) {

                    return false;

                }

            }


            return true;

        });


    console.log(
        "絞り込み結果:",
        result.length
    );


    showReports(result);

}


// ==============================
// 日報表示
// ==============================

function showReports(data) {

    reportList.innerHTML = "";


    if (data.length === 0) {

        reportList.innerHTML = `
            <div class="no-reports">

                <div class="no-reports-icon">
                    📋
                </div>

                <h3>
                    該当する日報がありません
                </h3>

                <p>
                    検索条件を変更してください
                </p>

            </div>
        `;

        return;

    }


    data.forEach(report => {


        const div =
            document.createElement("div");


        div.className =
            "report-card";


        // ==========================
        // 作業内容
        // ==========================

        let taskHtml = "";


        if (
            !Array.isArray(report.tasks) ||
            report.tasks.length === 0
        ) {

            taskHtml = `
                <div class="task empty-task">
                    訪問データなし
                </div>
            `;

        }
        else {

            report.tasks.forEach(task => {

                taskHtml += `

                    <div class="task">

                        <div class="task-customer">
                            🏢
                            ${escapeHtml(
                                task.customer || "顧客名なし"
                            )}
                        </div>

                        <div class="task-work">
                            🔧
                            ${escapeHtml(
                                task.work || ""
                            )}
                        </div>

                        <div class="task-content">
                            📝
                            ${escapeHtml(
                                task.content || ""
                            )}
                        </div>

                    </div>

                `;

            });

        }


        // ==========================
        // 状態
        // ==========================

        let statusHtml;


        if (report.status === "draft") {

            statusHtml = `
                <span class="status-badge draft">
                    📝 下書き
                </span>
            `;

        }
        else {

            statusHtml = `
                <span class="status-badge submitted">
                    ✅ 提出済み
                </span>
            `;

        }


        // ==========================
        // カード
        // ==========================

        div.innerHTML = `

            <div class="report-header">

                <div class="report-date">

                    📅
                    ${escapeHtml(
                        report.date || ""
                    )}

                </div>

                ${statusHtml}

            </div>


            <div class="report-person">

                👤
                担当：
                ${escapeHtml(
                    report.name || ""
                )}

            </div>


            <div class="task-list">

                ${taskHtml}

            </div>


            <div class="report-open">

                ${report.status === "draft"
                    ? "📝 下書きを編集 →"
                    : "📋 詳細を見る →"
                }

            </div>

        `;


        // ==========================
        // クリック
        // ==========================

        div.addEventListener(
            "click",
            () => {

                if (
                    report.status === "draft"
                ) {

                    location.href =
                        "report.html?draftId=" +
                        encodeURIComponent(
                            report.id
                        );

                    return;

                }


                location.href =
                    "report-detail.html?id=" +
                    encodeURIComponent(
                        report.id
                    );

            }
        );


        reportList.appendChild(div);

    });

}


// ==============================
// HTMLエスケープ
// ==============================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==============================
// 検索
// ==============================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterReports
    );

}


// ==============================
// 担当者変更
// ==============================

if (personFilter) {

    personFilter.addEventListener(
        "change",
        filterReports
    );

}


// ==============================
// 年月変更
// ==============================

if (monthFilter) {

    monthFilter.addEventListener(
        "change",
        filterReports
    );

}


// ==============================
// 状態変更
// ==============================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterReports
    );

}


// ==============================
// 条件クリア
// ==============================

if (clearFilterBtn) {

    clearFilterBtn.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (personFilter) {
                personFilter.value = "";
            }

            if (monthFilter) {
                monthFilter.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }

            filterReports();

        }
    );

}


// ==============================
// 開始
// ==============================

loadReports();