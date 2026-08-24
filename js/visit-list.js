import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("visit-list.js 起動");


// ==============================
// URLから条件取得
// ==============================

const params =
    new URLSearchParams(location.search);

const month =
    params.get("month");

const name =
    params.get("name") || "全員";


console.log("対象月:", month);
console.log("対象担当者:", name);


// ==============================
// HTML
// ==============================

const visitList =
    document.getElementById("visitList");

const backBtn =
    document.getElementById("backBtn");


// ==============================
// 訪問一覧読み込み
// ==============================

async function loadVisits() {

    console.log("訪問一覧読み込み開始");


    if (!month) {

        visitList.innerHTML = `
            <div class="visit-card">
                <p>対象月が指定されていません。</p>
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


        // ==========================
        // 顧客ごとの訪問データ
        // ==========================

        const customers = {};


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
                    !data.date ||
                    !data.date.startsWith(month)
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
                // 訪問1件ずつ
                // ----------------------

                data.tasks.forEach(
                    (task) => {

                        const customer =
                            task.customer;


                        if (
                            !customer ||
                            customer.trim() === ""
                        ) {

                            return;

                        }


                        if (
                            !customers[customer]
                        ) {

                            customers[customer] = [];

                        }


                       customers[customer]
    .push({

        reportId:
            docSnap.id,

        date:
            data.date,

        name:
            data.name || "",

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
        // 表示
        // ==========================

        visitList.innerHTML = "";


        const customerNames =
            Object.keys(customers)
            .sort();


        if (
            customerNames.length === 0
        ) {

            visitList.innerHTML = `

                <div class="visit-card">

                    <p>
                        この月の訪問履歴はありません。
                    </p>

                </div>

            `;

            return;

        }


        customerNames.forEach(
            (customer) => {

                const visits =
                    customers[customer];


                visitList.innerHTML += `

                    <div
                        class="visit-card"
                        data-customer="${encodeURIComponent(customer)}"
                    >

                        <h2>
                            🏢 ${customer}
                        </h2>

                        <p>
                            訪問回数：
                            ${visits.length}回
                        </p>

                        <p>
                            最新：
                            ${visits[0].date}
                        </p>

                        <p class="visit-link">
                            📋 訪問履歴を見る →
                        </p>

                    </div>

                `;

            }
        );


        // ==========================
        // 顧客クリック
        // ==========================

        document
            .querySelectorAll(".visit-card[data-customer]")
            .forEach(
                (card) => {

                    card.addEventListener(
                        "click",
                        () => {

                            const customer =
                                decodeURIComponent(
                                    card.dataset.customer
                                );


                            location.href =
                                `visit-history.html?customer=${encodeURIComponent(customer)}&month=${encodeURIComponent(month)}&name=${encodeURIComponent(name)}`;

                        }
                    );

                }
            );


        console.log(
            "訪問先数:",
            customerNames.length
        );

        console.log(
            "訪問件数:",
            Object.values(customers)
                .reduce(
                    (total, visits) =>
                        total + visits.length,
                    0
                )
        );

    }
    catch (error) {

        console.error(
            "訪問一覧読み込みエラー",
            error
        );


        visitList.innerHTML = `

            <div class="visit-card">

                <p>
                    訪問一覧の読み込みに失敗しました。
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

            // 担当者・月を維持して月間集計へ
            location.href =
                `summary.html?month=${encodeURIComponent(month)}&name=${encodeURIComponent(name)}`;

        }
    );

}


// ==============================
// 開始
// ==============================

loadVisits();