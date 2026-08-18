import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("customer-detail.js 起動");


// ==============================
// URLから顧客ID取得
// ==============================

const params =
    new URLSearchParams(location.search);

const id =
    params.get("id");


// ==============================
// HTML要素
// ==============================

const customerInfo =
    document.getElementById("customerInfo");

const historyList =
    document.getElementById("historyList");


// ==============================
// 顧客情報取得
// ==============================

async function loadCustomer() {

    if (!id) {

        customerInfo.innerHTML =
            "<p>顧客IDがありません。</p>";

        return;

    }


    try {

        const snap =
            await getDoc(
                doc(db, "customers", id)
            );


        if (!snap.exists()) {

            customerInfo.innerHTML =
                "<p>顧客情報がありません。</p>";

            return;

        }


        const data =
            snap.data();


        console.log(
            "顧客データ確認",
            data
        );


        customerInfo.innerHTML = `

            <div class="detail-card">

                <label>
                    顧客名
                </label>

                <input
                    type="text"
                    id="name"
                    value="${data.name || ""}"
                >


                <label>
                    郵便番号
                </label>

                <input
                    type="text"
                    id="postal"
                    value="${data.postal || ""}"
                >


                <label>
                    住所
                </label>

                <input
                    type="text"
                    id="address"
                    value="${
                        (data.address1 || "") +
                        (data.address2 || "")
                    }"
                >


                <label>
                    電話番号
                </label>

                <input
                    type="text"
                    id="tel"
                    value="${data.tel || ""}"
                >


                <label>
                    メモ
                </label>

                <textarea id="memo">${data.memo || ""}</textarea>


                <button id="saveBtn">
                    💾 保存
                </button>

            </div>

        `;


        // ==========================
        // 顧客情報保存
        // ==========================

        document
        .getElementById("saveBtn")
        .addEventListener(
            "click",
            async () => {

                try {

                    await updateDoc(

                        doc(
                            db,
                            "customers",
                            id
                        ),

                        {

                            name:
                                document
                                .getElementById("name")
                                .value,

                            postal:
                                document
                                .getElementById("postal")
                                .value,

                            address1:
                                document
                                .getElementById("address")
                                .value,

                            tel:
                                document
                                .getElementById("tel")
                                .value,

                            memo:
                                document
                                .getElementById("memo")
                                .value

                        }

                    );


                    alert(
                        "保存しました😊"
                    );

                }
                catch (error) {

                    console.error(
                        "保存エラー",
                        error
                    );

                    alert(
                        "保存に失敗しました"
                    );

                }

            }
        );

    }
    catch (error) {

        console.error(
            "顧客情報取得エラー",
            error
        );

        customerInfo.innerHTML =
            "<p>顧客情報の取得に失敗しました。</p>";

    }

}


// ==============================
// 対応履歴取得
// ==============================

async function loadHistory() {

    historyList.innerHTML =
        "読み込み中...";


    try {

        // ==========================
        // 現在の顧客情報を取得
        // ==========================

        const customerSnap =
            await getDoc(
                doc(
                    db,
                    "customers",
                    id
                )
            );


        if (!customerSnap.exists()) {

            historyList.innerHTML =
                "<p>顧客情報がありません。</p>";

            return;

        }


        const customerData =
            customerSnap.data();


        const customerName =
            customerData.name || "";


        console.log(
            "履歴検索対象顧客:",
            customerName
        );


        // ==========================
        // 日報取得
        // ==========================

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


                // tasksがない日報は除外

                if (
                    !Array.isArray(data.tasks)
                ) {

                    return;

                }


                // ======================
                // tasksを確認
                // ======================

                data.tasks.forEach(
                    (task) => {

                        // 顧客名が一致するものだけ

                        if (
                            task.customer !==
                            customerName
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


        historyList.innerHTML = "";


        // ==========================
        // 履歴なし
        // ==========================

        if (
            histories.length === 0
        ) {

            historyList.innerHTML = `

                <div class="report-card">

                    <p>
                        対応履歴はありません。
                    </p>

                </div>

            `;

            return;

        }


        // ==========================
        // 履歴表示
        // ==========================

        histories.forEach(
            (history) => {

                historyList.innerHTML += `

                    <div
                        class="report-card history-click"
                        data-report-id="${history.reportId}"
                    >

                        <h3>
                            👤 ${history.name}さん
                        </h3>

                        <p>
                            📅 ${history.date}
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

                        <p class="detail-link">
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
        .querySelectorAll(".history-click")
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
            "対応履歴件数:",
            histories.length
        );

    }
    catch (error) {

        console.error(
            "対応履歴読み込みエラー",
            error
        );


        historyList.innerHTML = `

            <div class="report-card">

                <p>
                    対応履歴の読み込みに失敗しました。
                </p>

            </div>

        `;

    }

}


// ==============================
// 戻るボタン
// ==============================

const backBtn =
    document.getElementById("backBtn");


if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            location.href =
                "customers.html";

        }
    );

}


// ==============================
// 読み込み開始
// ==============================

loadCustomer();

loadHistory();