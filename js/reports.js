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

async function loadReports(){

    try{

        const q =
            query(
                collection(db,"reports"),
                orderBy("date","desc")
            );


        const snapshot =
            await getDocs(q);


        reports = [];


        snapshot.forEach((doc)=>{

            reports.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        console.log(
            "日報データ確認",
            reports[0]
        );


        // ==========================
        // 担当者一覧作成
        // ==========================

        createPersonFilter();


        // ==========================
        // 日報表示
        // ==========================

        filterReports();

    }
    catch(error){

        console.error(
            "日報読み込みエラー",
            error
        );


        reportList.innerHTML =
            "<p>日報の読み込みに失敗しました。</p>";

    }

}


// ==============================
// 担当者フィルター作成
// ==============================

function createPersonFilter(){

    personFilter.innerHTML = `

        <option value="">
            👤 担当者：全員
        </option>

    `;


    const people =
        [...new Set(

            reports
                .map(report =>
                    report.name
                )
                .filter(name =>
                    name
                )

        )];


    people.sort((a,b)=>
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
            "👤 " + name;


        personFilter.appendChild(
            option
        );

    });

}


// ==============================
// 絞り込み
// ==============================

function filterReports(){

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();


    const person =
        personFilter.value;


    const month =
        monthFilter.value;


    const status =
        statusFilter.value;


    const result =
        reports.filter(report => {


            // ==========================
            // 👤 担当者
            // ==========================

            if(
                person &&
                report.name !== person
            ){

                return false;

            }


            // ==========================
            // 📅 年月
            // ==========================

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


            // ==========================
            // 📝 状態
            // ==========================

            if(status){

                if(
                    report.status !== status
                ){

                    return false;

                }

            }


            // ==========================
            // 🔍 キーワード
            // ==========================

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


    showReports(result);

}


// ==============================
// 日報表示
// ==============================

function showReports(data){

    reportList.innerHTML = "";


    if(data.length === 0){

        reportList.innerHTML = `

            <p class="no-reports">
                該当する日報がありません
            </p>

        `;

        return;

    }


    data.forEach(report => {


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "report-card";


        let taskHtml = "";


        // ==============================
        // 作業データ
        // ==============================

        if(
            !Array.isArray(report.tasks) ||
            report.tasks.length === 0
        ){

            taskHtml = `

                <p>
                    訪問データなし
                </p>

            `;

        }
        else{

            report.tasks.forEach(
                task => {

                    taskHtml += `

                        <div class="task">

                            🏢
                            ${task.customer || ""}

                            <br>

                            🔧
                            ${task.work || ""}

                            <br>

                            📝
                            ${task.content || ""}

                        </div>

                    `;

                }
            );

        }


        // ==============================
        // 状態
        // ==============================

        const statusHtml =

            report.status === "draft"

                ?

                `
                    <p class="draft-label">
                        📝 下書き
                    </p>
                `

                :

                `
                    <p class="submitted-label">
                        ✅ 提出済み
                    </p>
                `;


        // ==============================
        // カード
        // ==============================

        div.innerHTML = `

            <h3>
                📅
                ${report.date || ""}
            </h3>


            <p>
                👤
                担当：
                ${report.name || ""}
            </p>


            ${statusHtml}


            ${taskHtml}

        `;


        // ==============================
        // 詳細
        // ==============================

        div.addEventListener(
            "click",
            () => {


                // 下書き
                if(
                    report.status === "draft"
                ){

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


// ==============================
// 🔍 イベント
// ==============================

searchInput.addEventListener(
    "input",
    filterReports
);


personFilter.addEventListener(
    "change",
    filterReports
);


monthFilter.addEventListener(
    "change",
    filterReports
);


statusFilter.addEventListener(
    "change",
    filterReports
);


// ==============================
// 🔄 条件クリア
// ==============================

clearFilterBtn.addEventListener(
    "click",
    () => {

        searchInput.value =
            "";

        personFilter.value =
            "";

        monthFilter.value =
            "";

        statusFilter.value =
            "";

        filterReports();

    }
);


// ==============================
// 起動
// ==============================

loadReports();