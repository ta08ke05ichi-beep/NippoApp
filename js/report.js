import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("report.js 起動");


// ======================
// 要素取得
// ======================

const tasksArea =
    document.getElementById("tasks");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const saveBtn =
    document.getElementById("saveBtn");

const draftBtn =
    document.getElementById("draftBtn");

const dateInput =
    document.getElementById("date");

const nameInput =
    document.getElementById("name");

console.log("draftBtn確認:", draftBtn);


// ======================
// 日付自動入力
// ======================

const today = new Date();

const yyyy =
    today.getFullYear();

const mm =
    String(today.getMonth() + 1)
        .padStart(2, "0");

const dd =
    String(today.getDate())
        .padStart(2, "0");

dateInput.value =
    `${yyyy}-${mm}-${dd}`;


// ======================
// 顧客データ
// ======================

let customers = [];


// ======================
// 顧客読み込み
// ======================

async function loadCustomers() {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "customers"
                )
            );

        customers = [];

        snap.forEach(docSnap => {

            customers.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        // ⭐お気に入りを上にする

        customers.sort((a, b) => {

            if (
                a.favorite === true &&
                b.favorite !== true
            ) {
                return -1;
            }

            if (
                a.favorite !== true &&
                b.favorite === true
            ) {
                return 1;
            }

            return (a.name || "")
                .localeCompare(
                    b.name || "",
                    "ja"
                );

        });


        console.log(
            "顧客読み込み完了",
            customers.length
        );

        console.log(
            "顧客1件目確認",
            customers[0]
        );

    }

    catch (e) {

        console.error(
            "顧客取得エラー",
            e
        );

    }

}


loadCustomers();

// ======================
// 顧客検索
// ======================

function searchCustomer(input) {

    const keyword =
        input.value
            .trim()
            .toLowerCase();


    const card =
        input.closest(".visit-card");

    if (!card) {
        return;
    }


    const result =
        card.querySelector(
            ".customer-result"
        );

    if (!result) {
        return;
    }


    const favoriteFilter =
        card.querySelector(
            ".favorite-filter-btn"
        );


    const favoriteOnly =
        favoriteFilter &&
        favoriteFilter.classList.contains(
            "active"
        );


    // いったん結果を空にする

    result.innerHTML = "";


    // ======================
    // 顧客検索
    // ======================

    let list =
        customers.filter(customer => {

            const target =
                (customer.name || "") +
                (customer.kana || "") +
                (customer.tel || "") +
                (customer.searchName || "");


            const matchKeyword =
                !keyword ||
                target
                    .toLowerCase()
                    .includes(keyword);


            const matchFavorite =
                !favoriteOnly ||
                customer.favorite === true;


            return (
                matchKeyword &&
                matchFavorite
            );

        });


    // ======================
    // ⭐お気に入りを上に
    // ======================

    list.sort((a, b) => {

        if (
            a.favorite === true &&
            b.favorite !== true
        ) {
            return -1;
        }

        if (
            a.favorite !== true &&
            b.favorite === true
        ) {
            return 1;
        }

        return (a.name || "")
            .localeCompare(
                b.name || "",
                "ja"
            );

    });


    console.log(
        "検索結果件数:",
        list.length
    );


    // ======================
    // 検索文字も
    // お気に入りもない場合
    // ======================

    if (
        !keyword &&
        !favoriteOnly
    ) {
        return;
    }


    // ======================
    // 最大20件表示
    // ======================

    list
        .slice(0, 20)
        .forEach(customer => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "customer-item";


            // ======================
            // ⭐お気に入りボタン
            // ======================

            const favoriteButton =
                document.createElement(
                    "button"
                );

            favoriteButton.type =
                "button";

            favoriteButton.className =
                "favorite-button";


            favoriteButton.textContent =
                customer.favorite === true
                    ? "⭐"
                    : "☆";


            // ======================
            // ⭐お気に入りクリック
            // ======================

            favoriteButton.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const oldFavorite =
                        customer.favorite === true;


                    const newFavorite =
                        !oldFavorite;


                    // 先に画面変更

                    customer.favorite =
                        newFavorite;


                    favoriteButton.textContent =
                        newFavorite
                            ? "⭐"
                            : "☆";


                    try {

                        await updateDoc(

                            doc(
                                db,
                                "customers",
                                customer.id
                            ),

                            {
                                favorite:
                                    newFavorite
                            }

                        );


                        console.log(
                            "⭐お気に入り変更:",
                            customer.name,
                            newFavorite
                        );


                        // お気に入り表示中なら
                        // 再検索

                        if (
                            favoriteOnly
                        ) {

                            searchCustomer(
                                input
                            );

                        }

                    }

                    catch(error) {

                        console.error(
                            "お気に入り保存エラー:",
                            error
                        );


                        // 元に戻す

                        customer.favorite =
                            oldFavorite;


                        favoriteButton.textContent =
                            oldFavorite
                                ? "⭐"
                                : "☆";


                        alert(
                            "お気に入りの保存に失敗しました"
                        );

                    }

                }
            );


            // ======================
            // 顧客情報
            // ======================

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "customer-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                customer.name ||
                "会社名なし";


            const tel =
                document.createElement(
                    "div"
                );

            tel.textContent =
                customer.tel || "";


            info.appendChild(name);

            info.appendChild(tel);


            // ======================
            // 顧客選択
            // ======================

            info.addEventListener(
                "click",
                function() {

                    selectCustomer(
                        input,
                        customer
                    );

                }
            );


            // ======================
            // 表示
            // ======================

            div.appendChild(
                favoriteButton
            );

            div.appendChild(
                info
            );

            result.appendChild(
                div
            );

        });

}


// ======================
// 顧客選択
// ======================

function selectCustomer(
    input,
    customer
) {

    const card =
        input.closest(
            ".visit-card"
        );

    if (!card) {
        return;
    }


    const detail =
        card.querySelector(
            ".customer-detail"
        );

    const hidden =
        card.querySelector(
            ".customer-value"
        );

    const result =
        card.querySelector(
            ".customer-result"
        );


    hidden.value =
        customer.id;


    card.querySelector(
        ".customer-name"
    ).textContent =
        customer.name || "";


    card.querySelector(
        ".customer-address"
    ).textContent =
        (customer.address1 || "") +
        (customer.address2 || "");


    card.querySelector(
        ".customer-tel"
    ).textContent =
        customer.tel || "";


    detail.style.display =
        "block";


    result.innerHTML =
        "";


    input.value =
        customer.name || "";


    // 最近使った顧客に保存

    saveRecentCustomer(
        customer
    );

}


// ======================
// 検索イベント
// ======================

document.addEventListener(
    "input",
    function (e) {

        if (
            e.target.classList.contains(
                "customer-search"
            )
        ) {

            searchCustomer(
                e.target
            );

        }

    }
);


// ======================
// 訪問追加
// ======================

addTaskBtn.onclick = () => {

    const count =
        document.querySelectorAll(
            ".visit-card"
        ).length + 1;


    const first =
        document.querySelector(
            ".visit-card"
        );


    const clone =
        first.cloneNode(true);


    clone.querySelector(
        ".visit-title"
    ).textContent =
        `訪問${count}`;


    clone.querySelectorAll(
        "input, textarea, select"
    ).forEach(el => {

        if (
            el.type !== "hidden"
        ) {

            el.value = "";

        }

    });


    clone.querySelector(
        ".customer-detail"
    ).style.display =
        "none";


    clone.querySelector(
        ".customer-result"
    ).innerHTML =
        "";


    tasksArea.appendChild(
        clone
    );

};


// ======================
// 保存
// ======================

saveBtn.onclick =
    async () => {

        const tasks = [];


        document
            .querySelectorAll(
                ".visit-card"
            )
            .forEach(card => {

                tasks.push({

                    customer:
                        card.querySelector(
                            ".customer-name"
                        ).textContent,

                    address:
                        card.querySelector(
                            ".customer-address"
                        ).textContent,

                    tel:
                        card.querySelector(
                            ".customer-tel"
                        ).textContent,

                    work:
                        card.querySelector(
                            ".work"
                        ).value,

                    content:
                        card.querySelector(
                            ".content"
                        ).value

                });

            });


        // URLから下書きID

        const params =
            new URLSearchParams(
                location.search
            );

        const draftId =
            params.get("draftId");


        try {

            // ======================
            // 下書きから開いた場合
            // ======================

            if (draftId) {

                const draftRef =
                    doc(
                        db,
                        "reports",
                        draftId
                    );


                await updateDoc(
                    draftRef,
                    {

                        date:
                            dateInput.value,

                        name:
                            nameInput.value,

                        tasks:
                            tasks,

                        status:
                            "submitted",

                        updatedAt:
                            serverTimestamp()

                    }
                );


                alert(
                    "✅ 日報を正式に保存しました！"
                );

            }


            // ======================
            // 新しい日報
            // ======================

            else {

                await addDoc(

                    collection(
                        db,
                        "reports"
                    ),

                    {

                        date:
                            dateInput.value,

                        name:
                            nameInput.value,

                        tasks:
                            tasks,

                        status:
                            "submitted",

                        createdAt:
                            serverTimestamp()

                    }

                );


                alert(
                    "日報を保存しました"
                );

            }


            location.reload();

        }

        catch (error) {

            console.error(
                "保存エラー",
                error
            );

            alert(
                "保存エラー"
            );

        }

    };


// ======================
// 📝 下書き保存
// ======================

draftBtn.onclick =
    async () => {

        const tasks = [];


        document
            .querySelectorAll(
                ".visit-card"
            )
            .forEach(card => {

                tasks.push({

                    customer:
                        card.querySelector(
                            ".customer-name"
                        ).textContent,

                    address:
                        card.querySelector(
                            ".customer-address"
                        ).textContent,

                    tel:
                        card.querySelector(
                            ".customer-tel"
                        ).textContent,

                    work:
                        card.querySelector(
                            ".work"
                        ).value,

                    content:
                        card.querySelector(
                            ".content"
                        ).value

                });

            });


        try {

            await addDoc(

                collection(
                    db,
                    "reports"
                ),

                {

                    date:
                        dateInput.value,

                    name:
                        nameInput.value,

                    tasks:
                        tasks,

                    status:
                        "draft",

                    createdAt:
                        serverTimestamp()

                }

            );


            alert(
                "📝 下書きを保存しました"
            );

        }

        catch (error) {

            console.error(
                "下書き保存エラー",
                error
            );

            alert(
                "下書きの保存に失敗しました"
            );

        }

    };


// =====================================
// 最近使った顧客
// =====================================

const RECENT_CUSTOMERS_KEY =
    "nippo_recent_customers";


// ==========================
// 保存
// ==========================

function saveRecentCustomer(
    customer
) {

    let recent = [];


    try {

        recent =
            JSON.parse(
                localStorage.getItem(
                    RECENT_CUSTOMERS_KEY
                )
            ) || [];

    }

    catch (e) {

        recent = [];

    }


    // 同じ顧客を削除

    recent =
        recent.filter(
            item =>
                item.id !== customer.id
        );


    // 一番上に追加

    recent.unshift({

        id:
            customer.id,

        name:
            customer.name || "",

        postal:
            customer.postal || "",

        address1:
            customer.address1 || "",

        address2:
            customer.address2 || "",

        tel:
            customer.tel || "",

        kana:
            customer.kana || "",

        searchName:
            customer.searchName || "",

        favorite:
            customer.favorite === true

    });


    // 最大5件

    recent =
        recent.slice(0, 5);


    localStorage.setItem(

        RECENT_CUSTOMERS_KEY,

        JSON.stringify(recent)

    );


    showRecentCustomers();

}


// ==========================
// 最近使った顧客を取得
// ==========================

function getRecentCustomers() {

    try {

        return JSON.parse(

            localStorage.getItem(
                RECENT_CUSTOMERS_KEY
            )

        ) || [];

    }

    catch (e) {

        return [];

    }

}


// ==========================
// 最近使った顧客を表示
// ==========================

function showRecentCustomers() {

    const lists =
        document.querySelectorAll(
            ".recent-customer-list"
        );


    const recent =
        getRecentCustomers();


    lists.forEach(list => {

        list.innerHTML = "";


        if (
            recent.length === 0
        ) {

            list.innerHTML = `
                <p class="no-recent">
                    まだありません
                </p>
            `;

            return;

        }


        recent.forEach(customer => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "recent-customer-item";


            const favoriteIcon =
                customer.favorite === true
                    ? "⭐"
                    : "🏢";


            item.innerHTML = `
                ${favoriteIcon}
                <span>
                    ${customer.name}
                </span>
            `;


            item.onclick = () => {

                const card =
                    item.closest(
                        ".visit-card"
                    );


                if (!card) {
                    return;
                }


                const input =
                    card.querySelector(
                        ".customer-search"
                    );


                selectCustomer(
                    input,
                    customer
                );

            };


            list.appendChild(
                item
            );

        });

    });

}


// ==========================
// 初期表示
// ==========================

showRecentCustomers();


// =====================================
// 📋 コピーした日報を読み込む
// =====================================

function loadCopyData() {

    const params =
        new URLSearchParams(
            location.search
        );


    if (
        params.get("copy") !== "true"
    ) {
        return;
    }


    const saved =
        sessionStorage.getItem(
            "nippo_copy_data"
        );


    if (!saved) {
        return;
    }


    try {

        const copyData =
            JSON.parse(saved);


        const tasks =
            copyData.tasks || [];


        if (
            tasks.length === 0
        ) {
            return;
        }


        const firstCard =
            document.querySelector(
                ".visit-card"
            );


        if (!firstCard) {
            return;
        }


        tasks.forEach(
            (task, index) => {

                let card;


                // 1件目

                if (index === 0) {

                    card =
                        firstCard;

                }


                // 2件目以降

                else {

                    const first =
                        document.querySelector(
                            ".visit-card"
                        );


                    card =
                        first.cloneNode(true);


                    const count =
                        document.querySelectorAll(
                            ".visit-card"
                        ).length + 1;


                    card.querySelector(
                        ".visit-title"
                    ).textContent =
                        `訪問${count}`;


                    card.querySelector(
                        ".customer-detail"
                    ).style.display =
                        "none";


                    card.querySelector(
                        ".customer-result"
                    ).innerHTML =
                        "";


                    tasksArea.appendChild(
                        card
                    );

                }


                // 顧客

                card.querySelector(
                    ".customer-search"
                ).value =
                    task.customer || "";


                card.querySelector(
                    ".customer-name"
                ).textContent =
                    task.customer || "";


                card.querySelector(
                    ".customer-address"
                ).textContent =
                    task.address || "";


                card.querySelector(
                    ".customer-tel"
                ).textContent =
                    task.tel || "";


                card.querySelector(
                    ".customer-detail"
                ).style.display =
                    "block";


                // 作業分類

                card.querySelector(
                    ".work"
                ).value =
                    task.work || "";


                // 作業内容

                card.querySelector(
                    ".content"
                ).value =
                    task.content || "";

            }
        );


        sessionStorage.removeItem(
            "nippo_copy_data"
        );


        console.log(
            "📋 日報コピー完了"
        );

    }

    catch (error) {

        console.error(
            "コピー読み込みエラー",
            error
        );

    }

}


loadCopyData();


// =====================================
// 📝 下書きを読み込む
// =====================================

async function loadDraftData() {

    const params =
        new URLSearchParams(
            location.search
        );


    const draftId =
        params.get("draftId");


    if (!draftId) {
        return;
    }


    try {

        const draftRef =
            doc(
                db,
                "reports",
                draftId
            );


        const snapshot =
            await getDoc(
                draftRef
            );


        if (
            !snapshot.exists()
        ) {

            alert(
                "下書きが見つかりません。"
            );

            return;

        }


        const data =
            snapshot.data();


        console.log(
            "📝 下書き読み込み:",
            data
        );


        // ==========================
        // 基本情報
        // ==========================

        dateInput.value =
            data.date || "";


        nameInput.value =
            data.name || "";


        // ==========================
        // 訪問データ
        // ==========================

        const tasks =
            data.tasks || [];


        if (
            tasks.length === 0
        ) {
            return;
        }


        const firstCard =
            document.querySelector(
                ".visit-card"
            );


        tasks.forEach(
            (task, index) => {

                let card;


                // 最初のカード

                if (index === 0) {

                    card =
                        firstCard;

                }


                // 2件目以降

                else {

                    const first =
                        document.querySelector(
                            ".visit-card"
                        );


                    card =
                        first.cloneNode(true);


                    const count =
                        document.querySelectorAll(
                            ".visit-card"
                        ).length + 1;


                    card.querySelector(
                        ".visit-title"
                    ).textContent =
                        `訪問${count}`;


                    card.querySelector(
                        ".customer-detail"
                    ).style.display =
                        "none";


                    card.querySelector(
                        ".customer-result"
                    ).innerHTML =
                        "";


                    tasksArea.appendChild(
                        card
                    );

                }


                // 顧客

                card.querySelector(
                    ".customer-search"
                ).value =
                    task.customer || "";


                card.querySelector(
                    ".customer-name"
                ).textContent =
                    task.customer || "";


                card.querySelector(
                    ".customer-address"
                ).textContent =
                    task.address || "";


                card.querySelector(
                    ".customer-tel"
                ).textContent =
                    task.tel || "";


                card.querySelector(
                    ".customer-detail"
                ).style.display =
                    "block";


                // 作業分類

                card.querySelector(
                    ".work"
                ).value =
                    task.work || "";


                // 作業内容

                card.querySelector(
                    ".content"
                ).value =
                    task.content || "";

            }
        );


        console.log(
            "📝 下書き復元完了"
        );

    }

    catch (error) {

        console.error(
            "下書き読み込みエラー",
            error
        );


        alert(
            "下書きの読み込みに失敗しました。"
        );

    }

}


// ======================
// 下書き読み込み
// ======================

loadDraftData();

// =====================================
// ⭐ お気に入りだけ表示
// =====================================

document.addEventListener(
    "click",
    function (e) {

        if (
            !e.target.classList.contains(
                "favorite-filter-btn"
            )
        ) {
            return;
        }

        const button =
            e.target;

        const card =
            button.closest(
                ".visit-card"
            );

        if (!card) {
            return;
        }

        button.classList.toggle(
            "active"
        );

        if (
            button.classList.contains(
                "active"
            )
        ) {

            button.textContent =
                "⭐ お気に入り";

        } else {

            button.textContent =
                "⭐ お気に入りだけ表示";

        }

        const input =
            card.querySelector(
                ".customer-search"
            );

        if (input) {
            searchCustomer(input);
        }

    }
);