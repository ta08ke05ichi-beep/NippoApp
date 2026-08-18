import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("summary.js 起動");


// ==============================
// HTML要素
// ==============================

const monthInput =
    document.getElementById("month");

const nameInput =
    document.getElementById("name");

const visitCount =
    document.getElementById("visitCount");

const workCount =
    document.getElementById("workCount");

const customerCount =
    document.getElementById("customerCount");

const timeCount =
    document.getElementById("timeCount");

const personSummary =
    document.getElementById("personSummary");

const searchBtn =
    document.getElementById("searchBtn");


// ==============================
// 今月を初期表示
// ==============================

const today = new Date();

const currentMonth =
    `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;

monthInput.value = currentMonth;


// ==============================
// 集計ボタン
// ==============================

searchBtn.addEventListener(
    "click",
    loadSummary
);


// ==============================
// 月間集計
// ==============================

async function loadSummary() {

    console.log("月間集計開始");


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "reports"
                )
            );


        // ==========================
        // 集計用
        // ==========================

        let visits = 0;

        let works = 0;

        let minutes = 0;


        const customers =
            new Set();


        const persons = {};


        // ==========================
        // 選択された月・担当者
        // ==========================

        const targetMonth =
            monthInput.value;


        const targetName =
            nameInput.value;


        console.log(
            "対象月:",
            targetMonth
        );

        console.log(
            "対象担当者:",
            targetName
        );


        // ==========================
        // 日報を確認
        // ==========================

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                // ======================
                // 担当者チェック
                // ======================

                if (
                    targetName !== "全員" &&
                    data.name !== targetName
                ) {

                    return;

                }


                // ======================
                // 日付チェック
                // ======================

                if (
                    !data.date ||
                    !data.date.startsWith(
                        targetMonth
                    )
                ) {

                    return;

                }


                // ======================
                // tasksチェック
                // ======================

                if (
                    !Array.isArray(
                        data.tasks
                    )
                ) {

                    return;

                }


                // ======================
                // 訪問1件ずつ処理
                // ======================

                data.tasks.forEach(
                    (task) => {


                        // ------------------
                        // 訪問件数
                        // ------------------

                        visits++;


                        // ------------------
                        // 作業件数
                        // ------------------

                        if (
                            task.work &&
                            task.work.trim() !== ""
                        ) {

                            works++;

                        }


                        // ------------------
                        // 顧客数
                        // ------------------

                        if (
                            task.customer &&
                            task.customer.trim() !== ""
                        ) {

                            customers.add(
                                task.customer
                            );

                        }


                        // ------------------
                        // 作業時間
                        // ------------------

                        if (
                            task.start &&
                            task.end
                        ) {

                            const start =
                                task.start.split(":");

                            const end =
                                task.end.split(":");


                            if (
                                start.length === 2 &&
                                end.length === 2
                            ) {

                                const startMinutes =
                                    Number(start[0]) * 60 +
                                    Number(start[1]);


                                const endMinutes =
                                    Number(end[0]) * 60 +
                                    Number(end[1]);


                                let diff =
                                    endMinutes -
                                    startMinutes;


                                // 日をまたいだ場合
                                if (diff < 0) {

                                    diff += 24 * 60;

                                }


                                minutes += diff;

                            }

                        }


                        // ------------------
                        // 担当者別
                        // ------------------

                        const person =
                            data.name || "名前なし";


                        if (
                            !persons[person]
                        ) {

                            persons[person] = {

                                visits: 0,

                                customers:
                                    new Set()

                            };

                        }


                        persons[person].visits++;


                        if (
                            task.customer &&
                            task.customer.trim() !== ""
                        ) {

                            persons[person]
                                .customers
                                .add(
                                    task.customer
                                );

                        }

                    }
                );

            }
        );


        // ==========================
        // 集計結果表示
        // ==========================

        visitCount.textContent =
            `${visits}件`;


        workCount.textContent =
            `${works}件`;


        customerCount.textContent =
            `${customers.size}社`;


        // ==========================
        // 時間表示
        // ==========================

        const hours =
            Math.floor(
                minutes / 60
            );


        const mins =
            minutes % 60;


        timeCount.textContent =
            `${hours}時間${mins}分`;


        // ==========================
        // 担当者別集計
        // ==========================

        personSummary.innerHTML = "";


        if (
            targetName === "全員"
        ) {

            const personNames =
                Object.keys(persons)
                .sort();


            if (
                personNames.length === 0
            ) {

                personSummary.innerHTML = `
                    <p>
                        この月のデータはありません。
                    </p>
                `;

            }
            else {

                personNames.forEach(
                    (person) => {

                        const data =
                            persons[person];


                        personSummary.innerHTML += `

                            <div class="person-card">

                                <h3>
                                    👤 ${person}
                                </h3>

                                <p
                                    class="visit-link"
                                    onclick="openVisitList('${encodeURIComponent(person)}')"
                                >
                                    訪問件数：
                                    ${data.visits}件
                                </p>

                                <p>
                                    訪問顧客数：
                                    ${data.customers.size}社
                                </p>

                            </div>

                        `;

                    }
                );

            }

        }
        else {

            personSummary.innerHTML = `

                <div class="person-card">

                    <h3>
                        👤 ${targetName}
                    </h3>

                    <p>
                        訪問件数：
                        ${visits}件
                    </p>

                    <p>
                        訪問顧客数：
                        ${customers.size}社
                    </p>

                </div>

            `;

        }


        console.log(
            "集計完了",
            {
                visits,
                works,
                customers: customers.size,
                minutes
            }
        );

    }
    catch (error) {

        console.error(
            "月間集計エラー",
            error
        );


        visitCount.textContent =
            "エラー";


        workCount.textContent =
            "エラー";


        customerCount.textContent =
            "エラー";


        timeCount.textContent =
            "エラー";


        personSummary.innerHTML = `
            <p>
                集計中にエラーが発生しました。
            </p>
        `;

    }

}


// ==============================
// 訪問一覧へ
// ==============================

window.openVisitList =
function(person) {

    const month =
        monthInput.value;


    const name =
        decodeURIComponent(person);


    location.href =
        `visit-list.html?month=${encodeURIComponent(month)}&name=${encodeURIComponent(name)}`;

};


// ==============================
// 最初の集計
// ==============================

loadSummary();