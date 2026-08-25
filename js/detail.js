import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const params = new URLSearchParams(location.search);

const id = params.get("id");

const detail =
document.getElementById("detail");

async function loadDetail(){

    const snap =
    await getDoc(
        doc(db,"reports",id)
    );

    if(!snap.exists()){

        detail.innerHTML =
        "<h2>日報が見つかりません</h2>";

        return;

    }

    const data = snap.data();

    let taskHtml = "";

    if(Array.isArray(data.tasks)){

        data.tasks.forEach(task=>{

            taskHtml += `

            <div class="task-detail">

                <h3>🏢 ${task.customer || ""}</h3>

                <p>
                📍 ${task.address || ""}
                </p>

                <p>
                ☎ ${task.tel || ""}
                </p>

                <p>
                🕒 ${task.start || ""} ～ ${task.end || ""}
                </p>

                <p>
                🔧 ${task.work || ""}
                </p>

                <p>
                📝 ${task.content || ""}
                </p>

            </div>

            `;

        });

    }

    detail.innerHTML = `

    <div class="detail-card">

        <h2>
        👤 ${data.name}さんの日報
        </h2>

        <p>
        📅 ${data.date}
        </p>

        <hr>

        ${taskHtml}

    </div>

    `;

}

loadDetail();

// 戻るボタン

document.getElementById("backBtn")
.addEventListener("click",()=>{

    location.href = "reports.html";

});


// 編集ボタン

document.getElementById("editBtn")
.addEventListener("click",()=>{

    location.href =
    `edit.html?id=${id}`;

});


// 削除ボタン

document.getElementById("deleteBtn")
.addEventListener("click",async()=>{

    const ok =
    confirm("この日報を削除しますか？");

    if(!ok){

        return;

    }

    try{

        await deleteDoc(
            doc(db,"reports",id)
        );

        alert("削除しました");

        location.href =
        "reports.html";

    }
    catch(error){

        console.error(error);

        alert("削除に失敗しました");

    }

});

// ==============================
// 📋 日報コピー
// ==============================

document.getElementById("copyBtn")
.addEventListener("click", async () => {

    try {

        const snap =
            await getDoc(
                doc(db, "reports", id)
            );

        if(!snap.exists()){

            alert("日報が見つかりません");

            return;

        }

        const data =
            snap.data();


        // コピーする内容
        const copyData = {

            tasks:
                Array.isArray(data.tasks)
                    ? data.tasks
                    : []

        };


        // 一時保存
        sessionStorage.setItem(
            "nippo_copy_data",
            JSON.stringify(copyData)
        );


        // 日報入力画面へ
        location.href =
            "report.html?copy=true";

    }
    catch(error){

        console.error(
            "コピーエラー",
            error
        );

        alert(
            "日報のコピーに失敗しました"
        );

    }

});