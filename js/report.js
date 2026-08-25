import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
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

const dateInput =
    document.getElementById("date");

const nameInput =
    document.getElementById("name");


// ======================
// 日付自動入力
// ======================

const today =
    new Date();

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

async function loadCustomers(){

    try{

        const snap =
            await getDocs(
                collection(
                    db,
                    "customers"
                )
            );

        customers = [];

        snap.forEach(doc => {

            customers.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        // ⭐ お気に入りを上にする
        customers.sort((a, b) => {

            if(
                a.favorite === true &&
                b.favorite !== true
            ){

                return -1;

            }

            if(
                a.favorite !== true &&
                b.favorite === true
            ){

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
    catch(e){

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

function searchCustomer(input){

    const keyword =
        input.value
            .trim()
            .toLowerCase();


    const result =
        input.nextElementSibling;


    result.innerHTML = "";


    if(!keyword){

        return;

    }


    // ==========================
    // 検索
    // ==========================

    let list =
        customers.filter(c => {

            const target =

                (c.name || "") +

                (c.kana || "") +

                (c.tel || "") +

                (c.searchName || "");


            return target
                .toLowerCase()
                .includes(keyword);

        });


    // ==========================
    // ⭐ お気に入りを上にする
    // ==========================

    list.sort((a, b) => {

        if(
            a.favorite === true &&
            b.favorite !== true
        ){

            return -1;

        }

        if(
            a.favorite !== true &&
            b.favorite === true
        ){

            return 1;

        }

        return (a.name || "")
            .localeCompare(
                b.name || "",
                "ja"
            );

    });


    console.log(
        "検索結果件数",
        list.length
    );


    // 最大20件
    list
        .slice(0, 20)
        .forEach(c => {

            const div =
                document.createElement("div");


            div.className =
                "customer-item";


            // ⭐ お気に入り表示
            const favoriteIcon =
                c.favorite === true
                    ? "⭐"
                    : "☆";


            div.innerHTML = `

                <strong>
                    ${favoriteIcon}
                    ${c.name || "会社名なし"}
                </strong>

                <br>

                ${c.tel || ""}

            `;


            div.onclick = () => {

                selectCustomer(
                    input,
                    c
                );

            };


            result.appendChild(div);

        });

}


// ======================
// 顧客選択
// ======================

function selectCustomer(
    input,
    customer
){

    const card =
        input.closest(
            ".visit-card"
        );


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
    )
    .textContent =
        customer.name || "";


    card.querySelector(
        ".customer-address"
    )
    .textContent =
        (customer.address1 || "") +
        (customer.address2 || "");


    card.querySelector(
        ".customer-tel"
    )
    .textContent =
        customer.tel || "";


    detail.style.display =
        "block";


    result.innerHTML =
        "";


    input.value =
        customer.name;


    // ==========================
    // 最近使った顧客に保存
    // ==========================

    saveRecentCustomer(
        customer
    );

}


// ======================
// 検索イベント
// ======================

document.addEventListener(
    "input",
    e => {

        if(
            e.target.classList.contains(
                "customer-search"
            )
        ){

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
    )
    .textContent =
        `訪問${count}`;


    clone.querySelectorAll(
        "input,textarea,select"
    )
    .forEach(el => {

        if(
            el.type !== "hidden"
        ){

            el.value = "";

        }

    });


    clone.querySelector(
        ".customer-detail"
    )
    .style.display =
        "none";


    clone.querySelector(
        ".customer-result"
    )
    .innerHTML =
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


    document.querySelectorAll(
        ".visit-card"
    )
    .forEach(card => {

        const task = {

            customer:

                card.querySelector(
                    ".customer-name"
                )
                .textContent,


            address:

                card.querySelector(
                    ".customer-address"
                )
                .textContent,


            tel:

                card.querySelector(
                    ".customer-tel"
                )
                .textContent,


            work:

                card.querySelector(
                    ".work"
                )
                .value,


            content:

                card.querySelector(
                    ".content"
                )
                .value

        };


        tasks.push(task);

    });


    try{

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

                createdAt:
                    serverTimestamp()

            }

        );


        alert(
            "日報を保存しました"
        );


        location.reload();

    }
    catch(e){

        console.error(e);

        alert(
            "保存エラー"
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
){

    let recent = [];


    try{

        recent =
            JSON.parse(
                localStorage.getItem(
                    RECENT_CUSTOMERS_KEY
                )
            ) || [];

    }
    catch(e){

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

        // ⭐ お気に入り状態も保存
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

function getRecentCustomers(){

    try{

        return JSON.parse(
            localStorage.getItem(
                RECENT_CUSTOMERS_KEY
            )
        ) || [];

    }
    catch(e){

        return [];

    }

}


// ==========================
// 最近使った顧客を表示
// ==========================

function showRecentCustomers(){

    const lists =
        document.querySelectorAll(
            ".recent-customer-list"
        );


    const recent =
        getRecentCustomers();


    lists.forEach(list => {

        list.innerHTML = "";


        if(recent.length === 0){

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


                if(!card){

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

function loadCopyData(){

    const params =
        new URLSearchParams(
            location.search
        );


    // コピーじゃなければ何もしない
    if(
        params.get("copy") !== "true"
    ){

        return;

    }


    const saved =
        sessionStorage.getItem(
            "nippo_copy_data"
        );


    if(!saved){

        return;

    }


    try{

        const copyData =
            JSON.parse(saved);


        const tasks =
            copyData.tasks || [];


        if(tasks.length === 0){

            return;

        }


        // 最初の訪問カード
        const firstCard =
            document.querySelector(
                ".visit-card"
            );


        if(!firstCard){

            return;

        }


        tasks.forEach(
            (task,index) => {

                let card;


                // 1件目
                if(index === 0){

                    card =
                        firstCard;

                }

                // 2件目以降
                else{

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


                // ==========================
                // 顧客
                // ==========================

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


                // ==========================
                // 作業分類
                // ==========================

                card.querySelector(
                    ".work"
                ).value =
                    task.work || "";


                // ==========================
                // 作業内容
                // ==========================

                card.querySelector(
                    ".content"
                ).value =
                    task.content || "";

            }
        );


        // コピー情報を削除
        sessionStorage.removeItem(
            "nippo_copy_data"
        );


        console.log(
            "📋 日報コピー完了"
        );

    }
    catch(error){

        console.error(
            "コピー読み込みエラー",
            error
        );

    }

}


loadCopyData();