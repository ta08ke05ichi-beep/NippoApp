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



// 日報読み込み

async function loadReports(){


    const q =
query(
    collection(db,"reports")
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



    showReports(reports);


}




// 表示

function showReports(data){


    reportList.innerHTML="";



    if(data.length === 0){

        reportList.innerHTML =
        "日報がありません";

        return;

    }



    data.forEach(report=>{


        const div =
        document.createElement("div");


        div.className =
        "card";



        let taskHtml="";

if(!report.tasks){
    return;
}

        report.tasks.forEach(task=>{


            taskHtml += `

            <div class="task">

            🏢 ${task.customer}<br>

            ⏰ ${task.startTime}
            〜
            ${task.endTime}<br>

            🔧 ${task.workContent}

            </div>

            `;


        });



        div.innerHTML = `

        <h3>
        📅 ${report.date}
        </h3>


        <p>
        👤 担当：${report.employee}
        </p>


        ${taskHtml}


        <button onclick="
        location.href='report-detail.html?id=${report.id}'
        ">
        詳細
        </button>


        `;



        reportList.appendChild(div);



    });


}




// 検索

searchInput.addEventListener(
"input",
()=>{


    const text =
    searchInput.value;



    const result =
    reports.filter(report=>{


        let target =

        report.employee
        +
        report.date;

if(!report.tasks){
    return false;
}

        report.tasks.forEach(task=>{


            target +=

            task.customer
            +
            task.workContent;


        });



        return target.includes(text);


    });



    showReports(result);



});





loadReports();