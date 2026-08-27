import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("customer-history.js 起動");


// ==================================================
// 要素取得
// ==================================================

const customerName =
    document.getElementById("customerName");

const historyList =
    document.getElementById("historyList");


// ==================================================
// URLから顧客名を取得
// ==================================================

const params =
    new URLSearchParams(location.search);

const customer =
    params.get("customer");


if (!customer) {

    customerName.textContent =
        "🏢 顧客が指定されていません";

    historyList.innerHTML =
        "<p>顧客情報を取得できませんでした。</p>";

} else {

    customerName.textContent =
        "🏢 " + customer;

}


// ==================================================
// 履歴取得
// ==================================================

async function loadHistory() {

    if (!customer) {
        return;
    }


    historyList.innerHTML =
        "読み込み中...";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "reports"
                )
            );


        const histories = [];


        // ==================================================
        // 日報を確認
        // ==================================================

        snapshot.forEach(reportDoc => {

            const report =
                reportDoc.data();


            // 下書きは履歴に表示しない
            if (
                report.status &&
                report.status !== "submitted"
            ) {

                return;

            }


            if (
                !Array.isArray(
                    report.tasks
                )
            ) {

                return;

            }


            // ==================================================
            // 訪問データを確認
            // ==================================================

            report.tasks.forEach(task => {

                if (
                    task.customer !== customer
                ) {

                    return;

                }


                histories.push({

                    date:
                        report.date || "",

                    name:
                        report.name || "担当者不明",

                    work:
                        task.work || "",

                    content:
                        task.content || "",

                    reportId:
                        reportDoc.id

                });

            });

        });


        // ==================================================
        // 新しい日付順
        // ==================================================

        histories.sort((a, b) => {

            return b.date.localeCompare(
                a.date
            );

        });


        // ==================================================
        // 件数
        // ==================================================

        if (
            histories.length === 0
        ) {

            historyList.innerHTML = `

                <div class="history-empty">

                    <p>
                        📭 この顧客の訪問履歴はありません
                    </p>

                </div>

            `;

            return;

        }


        // ==================================================
        // 履歴表示
        // ==================================================

        historyList.innerHTML = `

            <div class="history-count">

                🚗 訪問履歴：
                <strong>
                    ${histories.length}
                </strong>
                件

            </div>

        `;


        histories.forEach(history => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "history-card";


            div.innerHTML = `

                <div class="history-date">

                    📅
                    ${history.date || "日付不明"}

                </div>


                <p>

                    👤
                    <strong>
                        担当：
                    </strong>

                    ${history.name}

                </p>


                <p>

                    🔧
                    <strong>
                        作業分類：
                    </strong>

                    ${history.work || "記録なし"}

                </p>


                <p>

                    📝
                    <strong>
                        作業内容：
                    </strong>

                    ${history.content || "記録なし"}

                </p>

            `;


            historyList.appendChild(
                div
            );

        });


        console.log(
            "顧客履歴読み込み完了",
            customer,
            histories.length
        );


    }
    catch (error) {

        console.error(
            "顧客履歴読み込みエラー",
            error
        );


        historyList.innerHTML = `

            <p>
                ❌ 顧客履歴の読み込みに失敗しました。
            </p>

        `;

    }

}


// ==================================================
// 起動
// ==================================================

loadHistory();