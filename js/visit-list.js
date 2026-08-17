import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("visit-list.js 起動");


// ==============================
// HTML要素
// ==============================

const visitList =
    document.getElementById("visitList");

const backBtn =
    document.getElementById("backBtn");

const monthTitle =
    document.getElementById("monthTitle");


// ==============================
// 今月を取得
// ==============================

const today =
    new Date();


const year =
    today.getFullYear();


const monthNumber =
    String(today.getMonth() + 1)
    .padStart(2, "0");


const month =
    `${year}-${monthNumber}`;


console.log(
    "対象月:",
    month
);


// ==============================
// 月表示
// ==============================

monthTitle.textContent =
    `${year}年${Number(monthNumber)}月`;


// ==============================
// 戻るボタン
// ==============================

backBtn.addEventListener(
    "click",
    () => {

        location.href =
            "../index.html";

    }
);


// ==============================
// 訪問一覧読み込み
// ==============================

async function loadVisits() {

    try {

        console.log(
            "訪問一覧読み込み開始"
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "reports"
                )
            );


        const visits = [];


        // ==========================
        // 日報を確認
        // ==========================

        snapshot.forEach(
            (docSnap) => {

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


                // ======================
                // 訪問データ
                // ======================

                data.tasks.forEach(
                    (task) => {

                        visits.push({

                            date:
                                data.date,

                            name:
                                data.name || "",

                            customer:
                                task.customer || "顧客名なし",

                            start:
                                task.start || "",

                            end:
                                task.end || "",

                            work:
                                task.work || "",

                            content:
                                task.content || ""

                        });

                    }
                );

            }
        );


        // ==========================
        // 日付の新しい順
        // ==========================

        visits.sort(
            (a, b) => {

                return b.date.localeCompare(
                    a.date
                );

            }
        );


        // ==========================
        // 表示
        // ==========================

        visitList.innerHTML = "";


        if (visits.length === 0) {

            visitList.innerHTML = `

                <div class="visit-card">

                    <h2>
                        今月の訪問はありません
                    </h2>

                </div>

            `;

            return;

        }


        visits.forEach(
            (visit) => {

                visitList.innerHTML += `

                <div class="visit-card">

                    <p>
                        📅 ${visit.date}
                    </p>

                    <h2>
                        🏢 ${visit.customer}
                    </h2>

                    <p>
                        👤 ${visit.name}
                    </p>

                    <p>
                        🕒
                        ${visit.start}
                        〜
                        ${visit.end}
                    </p>

                    <p>
                        🔧 ${visit.work}
                    </p>

                    ${
                        visit.content
                        ?
                        `<p>📝 ${visit.content}</p>`
                        :
                        ""
                    }

                </div>

                `;

            }
        );


        console.log(
            "訪問件数:",
            visits.length
        );

    }
    catch (error) {

        console.error(
            "訪問一覧読み込みエラー",
            error
        );


        visitList.innerHTML = `

            <div class="visit-card">

                <h2>
                    読み込みエラー
                </h2>

                <p>
                    F12のConsoleを確認してください
                </p>

            </div>

        `;

    }

}


// ==============================
// 実行
// ==============================

loadVisits();