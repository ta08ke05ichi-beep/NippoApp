import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("reports.js 起動");


const reportList =
    document.getElementById("reportList");


const searchInput =
    document.getElementById("searchInput");


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

                id:doc.id,

                ...doc.data()

            });

        });


        console.log(
            "日報データ確認",
            reports[0]
        );


        showReports(reports);

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
// 日報表示
// ==============================

function showReports(data){

    reportList.innerHTML = "";


    if(data.length === 0){

        reportList.innerHTML =
            "<p>日報がありません</p>";

        return;

    }


    data.forEach(report=>{


        const div =
            document.createElement("div");


        // ★ここが重要
        // card → report-card に変更
        div.className =
            "report-card";


        let taskHtml = "";


        // ==============================
        // 作業データ
        // ==============================

        if(!Array.isArray(report.tasks) ||
           report.tasks.length === 0){

            taskHtml = `
                <p>訪問データなし</p>
            `;

        }
        else{

            report.tasks.forEach(task=>{

                taskHtml += `

                    <div class="task">

                        🏢 ${task.customer || ""}<br>

                        ⏰ ${task.start || ""}
                        ～ 
                        ${task.end || ""}<br>

                        🔧 ${task.content || ""}

                    </div>

                `;

            });

        }


        // ==============================
        // 日報カード
        // ==============================

        div.innerHTML = `

            <h3>
                📅 ${report.date || ""}
            </h3>


            <p>
                👤 担当：${report.name || ""}
            </p>


            ${taskHtml}

        `;


        // ==============================
        // 詳細画面
        // ==============================

        div.addEventListener(
            "click",
            ()=>{

                location.href =
                    "report-detail.html?id=" +
                    encodeURIComponent(report.id);

            }
        );


        reportList.appendChild(div);


    });

}


// ==============================
// 検索
// ==============================

searchInput.addEventListener(
    "input",
    ()=>{


        const text =
            searchInput.value
                .toLowerCase()
                .trim();


        const result =
            reports.filter(report=>{


                let target =

                    (report.name || "") +

                    (report.date || "");


                if(
                    Array.isArray(report.tasks)
                ){

                    report.tasks.forEach(task=>{

                        target +=

                            (task.customer || "") +

                            (task.content || "") +

                            (task.start || "") +

                            (task.end || "");

                    });

                }


                return target
                    .toLowerCase()
                    .includes(text);


            });


        showReports(result);


    }
);


// ==============================
// 起動
// ==============================

loadReports();