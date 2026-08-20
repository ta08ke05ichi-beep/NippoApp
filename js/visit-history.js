import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("visit-history.js 起動");


// ==============================
// URLから条件取得
// ==============================

const params =
    new URLSearchParams(location.search);

const customer =
    params.get("customer");

const month =
    params.get("month");

const name =
    params.get("name") || "全員";


console.log("顧客:", customer);
console.log("対象月:", month);
console.log("担当者:", name);


// ==============================
// HTML
// ==============================

const visitList =
    document.getElementById("visitList");

const customerTitle =
    document.getElementById("customerTitle");

if (customerTitle && customer) {

    customerTitle.textContent =
        `🏢 ${customer}`;

}

const backBtn =
    document.getElementById("backBtn");


// ==============================
// 訪問履歴読み込み
// ==============================

async function loadVisitHistory() {

    console.log("訪問履歴読み込み開始");


    if (!customer) {

        visitList.innerHTML = `
            <div class="visit-card">
                <p>顧客が指定されていません。</p>
            </div>
        `;

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "reports"
                )
            );


        const histories = [];


        // ==========================
        // 日報を確認
        // ==========================

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                // ----------------------
                // 担当者
                // ----------------------

                if (
                    name !== "全員" &&
                    data.name !== name
                ) {

                    return;

                }


                // ----------------------
                // 月
                // ----------------------

                if (
                    month &&
                    (
                        !data.date ||
                        !data.date.startsWith(month)
                    )
                ) {

                    return;

                }


                // ----------------------
                // tasks
                // ----------------------

                if (
                    !Array.isArray(data.tasks)
                ) {

                    return;

                }


                // ----------------------
                // tasksを確認
                // ----------------------

                data.tasks.forEach(
                    (task) => {

                        if (
                            task.customer !==
                            customer
                        ) {

                            return;

                        }


                        histories.push({

                            // ★ 日報ID
                            reportId:
                                docSnap.id,

                            date:
                                data.date || "",

                            name:
                                data.name || "",

                            customer:
                                task.customer || "",

                            work:
                                task.work || "",

                            content:
                                task.content || "",

                            start:
                                task.start || "",

                            end:
                                task.end || ""

                        });

                    }
                );

            }
        );


        // ==========================
        // 日付の新しい順
        // ==========================

        histories.sort(
            (a, b) => {

                return (
                    b.date || ""
                ).localeCompare(
                    a.date || ""
                );

            }
        );


        // ==========================
        // 表示
        // ==========================

        visitList.innerHTML = "";


        if (
            histories.length === 0
        ) {

            visitList.innerHTML = `

                <div class="visit-card">

                    <p>
                        訪問履歴はありません。
                    </p>

                </div>

            `;

            return;

        }


        histories.forEach(
            (history) => {

                visitList.innerHTML += `

                    <div
                        class="visit-card history-card"
                        data-report-id="${history.reportId}"
                    >

                        <h2>
                            📅 ${history.date}
                        </h2>

                        <p>
                            👤 ${history.name}さん
                        </p>

                        <p>
                            🔧 ${history.work}
                        </p>

                        <p>
                            📝 ${history.content}
                        </p>

                        <p>
                            🕒
                            ${history.start}
                            〜
                            ${history.end}
                        </p>

                        <p class="visit-link">
                            📄 日報詳細を見る →
                        </p>

                    </div>

                `;

            }
        );


        // ==========================
        // 履歴クリック
        // ==========================

        document
            .querySelectorAll(
                ".history-card"
            )
            .forEach(
                (card) => {

                    card.addEventListener(
                        "click",
                        () => {

                            const reportId =
                                card.dataset.reportId;


                            if (!reportId) {

                                console.error(
                                    "日報IDがありません"
                                );

                                return;

                            }


                            console.log(
                                "日報詳細へ:",
                                reportId
                            );


                            location.href =
                                `report-detail.html?id=${encodeURIComponent(reportId)}`;

                        }
                    );

                }
            );


        console.log(
            "訪問履歴件数:",
            histories.length
        );

    }
    catch (error) {

        console.error(
            "訪問履歴読み込みエラー",
            error
        );


        visitList.innerHTML = `

            <div class="visit-card">

                <p>
                    訪問履歴の読み込みに失敗しました。
                </p>

            </div>

        `;

    }

}


// ==============================
// 戻るボタン
// ==============================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            location.href =
                `visit-list.html?month=${encodeURIComponent(month || "")}&name=${encodeURIComponent(name)}`;

        }
    );

}


// ==============================
// 読み込み開始
// ==============================

loadVisitHistory();