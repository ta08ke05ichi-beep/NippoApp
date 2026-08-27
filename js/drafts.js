import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("drafts.js 起動");


const draftList =
    document.getElementById("draftList");


// ======================
// 📝 下書き読み込み
// ======================

async function loadDrafts() {

    try {

        const q = query(
            collection(db, "reports"),
            where("status", "==", "draft"),
            orderBy("createdAt", "desc")
        );


        const snapshot =
            await getDocs(q);


        draftList.innerHTML = "";


        // 下書きがない場合
        if (snapshot.empty) {

            draftList.innerHTML = `
                <div class="task-card">
                    <h2>📝 下書きはありません</h2>
                </div>
            `;

            return;

        }


        snapshot.forEach(doc => {

            const data =
                doc.data();


            const div =
                document.createElement("div");


            div.className =
                "task-card";


            div.innerHTML = `

                <h2>
                    📝 ${data.date || "日付なし"}
                </h2>

                <p>
                    👤 ${data.name || "名前なし"}
                </p>

                <p>
                    🚗 訪問 ${data.tasks?.length || 0}件
                </p>

                <button
                    type="button"
                    class="draft-open-btn">

                    ▶ この下書きを開く

                </button>

            `;


            div.querySelector(
                ".draft-open-btn"
            ).onclick = () => {

                location.href =
                    `report.html?draftId=${doc.id}`;

            };


            draftList.appendChild(div);

        });


    }
    catch(error) {

        console.error(
            "下書き読み込みエラー",
            error
        );


        draftList.innerHTML = `
            <div class="task-card">
                <p>
                    下書きの読み込みに失敗しました。
                </p>
            </div>
        `;

    }

}


loadDrafts();