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

const urlName =
    params.get("name") || "全員";


console.log("対象月:", month);
console.log("対象担当者:", urlName);


// ==============================
// HTML
// ==============================

const visitList =
    document.getElementById("visitList");

const backBtn =
    document.getElementById("backBtn");

const nameFilter =
    document.getElementById("nameFilter");

const customerFilter =
    document.getElementById("customerFilter");

const visitCount =
    document.getElementById("visitCount");


// ==============================
// 全訪問データ
// ==============================

let allVisits = [];


// ==============================
// 日報読み込み
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


        allVisits = [];


        // ==========================
        // 日報 → 訪問データに変換
        // ==========================

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                // ----------------------
                // 下書きは除外
                // ----------------------

                if (
                    data.status === "draft"
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


                        allVisits.push({

                            reportId:
                                docSnap.id,

                            date:
                                data.date || "",

                            name:
                                data.name || "",

                            customer:
                                customer,

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
        // 担当者一覧を作成
        // ==========================

        const names =
            [
                ...new Set(
                    allVisits
                        .map(
                            visit => visit.name
                        )
                        .filter(
                            name => name
                        )
                )
            ]
            .sort(
                (a, b) =>
                    a.localeCompare(
                        b,
                        "ja"
                    )
            );


        if (nameFilter) {

            nameFilter.innerHTML = `
                <option value="全員">全員</option>
            `;


            names.forEach(
                person => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        person;

                    option.textContent =
                        person;

                    nameFilter.appendChild(
                        option
                    );

                }
            );


            // URLの担当者を反映
            if (
                names.includes(urlName)
            ) {

                nameFilter.value =
                    urlName;

            }
            else {

                nameFilter.value =
                    "全員";

            }

        }


        // ==========================
        // 表示
        // ==========================

        showVisits();


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
// 訪問一覧表示
// ==============================

function showVisits() {

    let result =
        [...allVisits];


    // ==========================
    // 担当者絞り込み
    // ==========================

    const selectedName =
        nameFilter
            ? nameFilter.value
            : "全員";


    if (
        selectedName !== "全員"
    ) {

        result =
            result.filter(
                visit =>
                    visit.name === selectedName
            );

    }


    // ==========================
    // 顧客名検索
    // ==========================

    const keyword =
        customerFilter
            ? customerFilter.value
                .trim()
                .toLowerCase()
            : "";


    if (keyword) {

        result =
            result.filter(
                visit =>

                    visit.customer
                        .toLowerCase()
                        .includes(keyword)

            );

    }


    // ==========================
    // 日付の新しい順
    // ==========================

    result.sort(
        (a, b) => {

            return b.date.localeCompare(
                a.date
            );

        }
    );


    // ==========================
    // 件数表示
    // ==========================

    if (visitCount) {

        visitCount.textContent =
            `${result.length}件`;

    }


    // ==========================
    // 0件
    // ==========================

    if (
        result.length === 0
    ) {

        visitList.innerHTML = `

            <div class="visit-card">

                <p>
                    該当する訪問履歴はありません。
                </p>

            </div>

        `;

        return;

    }


    // ==========================
    // 一覧表示
    // ==========================

    visitList.innerHTML = "";


    result.forEach(
        visit => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "visit-card";


            div.innerHTML = `

                <h2>
                    🏢 ${visit.customer}
                </h2>

                <p>
                    📅 ${visit.date}
                </p>

                <p>
                    👤 担当：${visit.name}
                </p>

                <p>
                    🔧 ${visit.work || "作業分類なし"}
                </p>

                <p>
                    📝 ${visit.content || "作業内容なし"}
                </p>

            `;


            // ======================
            // 顧客をクリック
            // ======================

            div.addEventListener(
                "click",
                () => {

                    location.href =
                        `visit-history.html?customer=${encodeURIComponent(
                            visit.customer
                        )}&month=${encodeURIComponent(
                            month
                        )}&name=${encodeURIComponent(
                            selectedName
                        )}`;

                }
            );


            visitList.appendChild(
                div
            );

        }
    );


    console.log(
        "表示訪問件数:",
        result.length
    );

}


// ==============================
// 担当者変更
// ==============================

if (nameFilter) {

    nameFilter.addEventListener(
        "change",
        () => {

            showVisits();

        }
    );

}


// ==============================
// 顧客検索
// ==============================

if (customerFilter) {

    customerFilter.addEventListener(
        "input",
        () => {

            showVisits();

        }
    );

}


// ==============================
// 戻るボタン
// ==============================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            location.href =
                `summary.html?month=${encodeURIComponent(
                    month
                )}&name=${encodeURIComponent(
                    urlName
                )}`;

        }
    );

}


// ==============================
// 開始
// ==============================

loadVisits();