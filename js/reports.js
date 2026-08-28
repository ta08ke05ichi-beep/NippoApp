import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("reports.js 起動");


// =====================================
// 要素取得
// =====================================

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


// =====================================
// データ
// =====================================

let reports = [];


// =====================================
// 日報読み込み
// =====================================

async function loadReports(){

    try{

        console.log("日報読み込み開始");


        const q =
            query(
                collection(db, "reports"),
                orderBy("date", "desc")
            );


        const snapshot =
            await getDocs(q);


        reports = [];


        snapshot.forEach(docSnap => {

            reports.push({

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        });


        console.log(
            "日報件数:",
            reports.length
        );


        // 担当者一覧
        createPersonFilter();


        // 日報表示
        filterReports();

    }
    catch(error){

        console.error(
            "日報読み込みエラー:",
            error
        );


        reportList.innerHTML = `

            <div class="error-message">

                <p>
                    ⚠️ 日報の読み込みに失敗しました。
                </p>

            </div>

        `;

    }

}


// =====================================
// 担当者フィルター
// =====================================

function createPersonFilter(){

    if(!personFilter){

        return;

    }


    personFilter.innerHTML = `

        <option value="">
            👤 担当者：全員
        </option>

    `;


    const people = [

        ...new Set(

            reports

                .map(
                    report =>
                        report.name
                )

                .filter(
                    name =>
                        name &&
                        name.trim() !== ""
                )

        )

    ];


    people.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "ja"
            )
    );


    people.forEach(name => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            name;


        option.textContent =
            `👤 ${name}`;


        personFilter.appendChild(
            option
        );

    });

}


// =====================================
// 絞り込み
// =====================================

function filterReports(){

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


            // =================================
            // 担当者
            // =================================

            if(
                person &&
                person !== "all" &&
                report.name !== person
            ){

                return false;

            }


            // =================================
            // 年月
            // =================================

            if(month){

                const reportDate =
                    report.date || "";


                if(
                    !reportDate.startsWith(
                        month
                    )
                ){

                    return false;

                }

            }


            // =================================
            // 状態
            // =================================

            // 「全て」は条件にしない
            if(
                status &&
                status !== "all"
            ){

                if(
                    report.status !== status
                ){

                    return false;

                }

            }


            // =================================
            // キーワード
            // =================================

            if(keyword){

                let target =

                    (report.name || "") +

                    (report.date || "");


                if(
                    Array.isArray(
                        report.tasks
                    )
                ){

                    report.tasks.forEach(
                        task => {

                            target +=

                                (task.customer || "") +

                                (task.content || "") +

                                (task.work || "");

                        }
                    );

                }


                if(
                    !target
                        .toLowerCase()
                        .includes(keyword)
                ){

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


// =====================================
// 日報表示
// =====================================

function showReports(data){

    reportList.innerHTML = "";


    // =================================
    // 0件
    // =================================

    if(data.length === 0){

        reportList.innerHTML = `

            <div class="no-reports">

                <div class="no-reports-icon">
                    📋
                </div>

                <p>
                    該当する日報がありません
                </p>

                <small>
                    検索条件を変更してください
                </small>

            </div>

        `;

        return;

    }


    // =================================
    // 件数
    // =================================

    const countBox =
        document.createElement("div");


    countBox.className =
        "report-count";


    countBox.textContent =
        `📋 ${data.length}件の日報`;


    reportList.appendChild(
        countBox
    );


    // =================================
    // カード
    // =================================

    data.forEach(report => {


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "report-card";


        // =================================
        // 状態
        // =================================

        const isDraft =
            report.status === "draft";


        const statusHtml =
            isDraft

                ? `

                    <span class="status-badge draft">
                        📝 下書き
                    </span>

                `

                : `

                    <span class="status-badge submitted">
                        ✅ 提出済み
                    </span>

                `;


        // =================================
        // 作業内容
        // =================================

        let taskHtml = "";


        if(
            !Array.isArray(report.tasks) ||
            report.tasks.length === 0
        ){

            taskHtml = `

                <div class="no-task">
                    訪問データなし
                </div>

            `;

        }
        else{

            report.tasks.forEach(
                (task, index) => {

                    taskHtml += `

                        <div class="task">

                            <div class="task-number">
                                訪問${index + 1}
                            </div>

                            <div class="task-row">
                                <span>🏢</span>
                                <span>
                                    ${task.customer || "顧客名なし"}
                                </span>
                            </div>

                            <div class="task-row">
                                <span>🔧</span>
                                <span>
                                    ${task.work || "作業分類なし"}
                                </span>
                            </div>

                            ${
                                task.content
                                    ?

                                    `

                                    <div class="task-row">
                                        <span>📝</span>
                                        <span>
                                            ${task.content}
                                        </span>
                                    </div>

                                    `

                                    :

                                    ""
                            }

                        </div>

                    `;

                }
            );

        }


        // =================================
        // カードHTML
        // =================================

        div.innerHTML = `

            <div class="report-header">

                <div class="report-date">
                    📅 ${report.date || ""}
                </div>

                ${statusHtml}

            </div>


            <div class="report-person">

                👤

                <span>
                    ${report.name || "担当者なし"}
                </span>

            </div>


            <div class="task-list">

                ${taskHtml}

            </div>


            <div class="detail-link">

                詳細を見る
                <span>→</span>

            </div>

        `;


        // =================================
        // クリック
        // =================================

        div.addEventListener(
            "click",
            () => {


                // 下書き
                if(isDraft){

                    location.href =
                        "report.html?draftId=" +
                        encodeURIComponent(
                            report.id
                        );

                    return;

                }


                // 提出済み
                location.href =
                    "report-detail.html?id=" +
                    encodeURIComponent(
                        report.id
                    );

            }
        );


        reportList.appendChild(
            div
        );

    });

}


// =====================================
// イベント
// =====================================

if(searchInput){

    searchInput.addEventListener(
        "input",
        filterReports
    );

}


if(personFilter){

    personFilter.addEventListener(
        "change",
        filterReports
    );

}


if(monthFilter){

    monthFilter.addEventListener(
        "change",
        filterReports
    );

}


if(statusFilter){

    statusFilter.addEventListener(
        "change",
        filterReports
    );

}


// =====================================
// 条件クリア
// =====================================

if(clearFilterBtn){

    clearFilterBtn.addEventListener(
        "click",
        () => {


            if(searchInput){

                searchInput.value = "";

            }


            if(personFilter){

                personFilter.value = "";

            }


            if(monthFilter){

                monthFilter.value = "";

            }


            if(statusFilter){

                statusFilter.value = "";

            }


            filterReports();

        }
    );

}


// =====================================
// 起動
// =====================================

loadReports();