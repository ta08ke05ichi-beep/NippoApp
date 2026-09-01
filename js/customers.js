import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    writeBatch,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

console.log("customers.js 起動");


// ==================================================
// 要素取得
// ==================================================

const customerList =
    document.getElementById("customerList");

let customers = [];

const searchInput =
    document.getElementById("searchInput");


// ==================================================
// 顧客一覧＋訪問履歴読み込み
// ==================================================

async function loadCustomers(){

    customers = [];

    customerList.innerHTML = "読み込み中...";


    try {

        // ------------------------------------------
        // 顧客データ取得
        // ------------------------------------------

        const customerQuery =
            query(
                collection(db, "customers"),
                orderBy("name")
            );


        const customerSnapshot =
            await getDocs(customerQuery);


        if(customerSnapshot.empty){

            customerList.innerHTML =
                "登録されている顧客はありません";

            return;

        }


        // ------------------------------------------
        // 日報データ取得
        // ------------------------------------------

        const reportSnapshot =
            await getDocs(
                collection(db, "reports")
            );


        // ------------------------------------------
        // 顧客ごとの訪問情報
        // ------------------------------------------

        const visitInfo = {};


        reportSnapshot.forEach(reportDoc => {

            const data =
                reportDoc.data();


            if(!Array.isArray(data.tasks)){

                return;

            }


            data.tasks.forEach(task => {

                const customerName =
                    task.customer;


                if(!customerName){

                    return;

                }


                // 初回登録
                if(!visitInfo[customerName]){

                    visitInfo[customerName] = {

                        count: 0,

                        lastVisit: ""

                    };

                }


                // 訪問回数
                visitInfo[customerName].count++;


                // 日付
                const date =
                    data.date || "";


                // 最終訪問日
                if(
                    date &&
                    (
                        !visitInfo[customerName].lastVisit ||
                        date >
                        visitInfo[customerName].lastVisit
                    )
                ){

                    visitInfo[customerName].lastVisit =
                        date;

                }

            });

        });


        // ------------------------------------------
        // 顧客データ作成
        // ------------------------------------------

        customers = [];


        customerSnapshot.forEach(customerDoc => {

            const data =
                customerDoc.data();


            if(
                !data.name ||
                data.name.trim() === ""
            ){

                return;

            }


            const name =
                data.name.trim();


            const info =
                visitInfo[name] || {

                    count: 0,

                    lastVisit: ""

                };


            customers.push({

                id:
                    customerDoc.id,

                name:
                    name,

                postal:
                    data.postal || "",

                address1:
                    data.address1 || "",

                address2:
                    data.address2 || "",

                tel:
                    data.tel || "",

                kana:
                    data.kana || "",

                searchName:
                    (
                        data.searchName ||
                        data.name ||
                        ""
                    ).toLowerCase(),

                // 訪問回数
                visitCount:
                    info.count,

                // 最終訪問日
                lastVisit:
                    info.lastVisit,

                // ⭐ お気に入り
                favorite:
                    data.favorite === true

            });

        });


        // ⭐ お気に入りを上にする
        sortCustomers();


        showCustomers(customers);


        console.log(
            "顧客一覧読み込み完了",
            customers.length
        );

    }
    catch(error){

        console.error(
            "顧客一覧読み込みエラー",
            error
        );


        customerList.innerHTML =
            "顧客一覧の読み込みに失敗しました";

    }

}


// ==================================================
// お気に入り順に並び替え
// ==================================================

function sortCustomers(){

    customers.sort((a, b) => {

        // お気に入りを先に
        if(a.favorite && !b.favorite){

            return -1;

        }

        if(!a.favorite && b.favorite){

            return 1;

        }

        // 同じ状態なら名前順
        return a.name.localeCompare(
            b.name,
            "ja"
        );

    });

}


// ==================================================
// お気に入り切り替え
// ==================================================

async function toggleFavorite(customer, button){

    const oldFavorite =
        customer.favorite === true;

    const newFavorite =
        !oldFavorite;


    // ==========================================
    // ① まず画面を即変更
    // ==========================================

    customer.favorite =
        newFavorite;

    button.textContent =
        newFavorite ? "⭐" : "☆";


    // ==========================================
    // ② Firebaseへ保存
    // ==========================================

    try{

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
            "お気に入り保存完了",
            customer.name,
            newFavorite
        );


    }
    catch(error){

        console.error(
            "お気に入り保存エラー",
            error
        );


        // ======================================
        // 保存失敗したら元に戻す
        // ======================================

        customer.favorite =
            oldFavorite;

        button.textContent =
            oldFavorite
                ? "⭐"
                : "☆";


        alert(
            "お気に入りの保存に失敗しました"
        );

    }

}


// ==================================================
// 顧客一覧表示
// ==================================================

function showCustomers(list){

    customerList.innerHTML = "";


    if(list.length === 0){

        customerList.innerHTML =
            "<p>該当する顧客がありません。</p>";

        return;

    }


    list.forEach(customer => {

        const div =
            document.createElement("div");


        div.className =
            "customer-card";


        // ------------------------------------------
        // 最終訪問日の表示
        // ------------------------------------------

        const lastVisitText =
            customer.lastVisit
                ? `📅 最終訪問：${customer.lastVisit}`
                : "📅 最終訪問：まだありません";


        // ------------------------------------------
        // 訪問回数
        // ------------------------------------------

        const visitCountText =
            `🚗 訪問回数：${customer.visitCount}回`;


        // ------------------------------------------
        // ⭐ お気に入りボタン
        // ------------------------------------------

        const favoriteIcon =
            customer.favorite
                ? "⭐"
                : "☆";


        const favoriteText =
            customer.favorite
                ? "お気に入り"
                : "お気に入り";


        div.innerHTML = `

            <div class="customer-header">

                <h3>
                    🏢 ${customer.name}
                </h3>

                <button
                    type="button"
                    class="favorite-btn"
                    title="${favoriteText}"
                >
                    ${favoriteIcon}
                </button>

            </div>


            <p>
                📮 ${customer.postal || "住所情報なし"}
            </p>


            <p>
                📍 ${customer.address1 || ""}
                ${customer.address2 || ""}
            </p>


            <p>
                ☎ ${customer.tel || "電話番号なし"}
            </p>


            <div class="visit-info">

                <p>
                    ${lastVisitText}
                </p>

                <p>
                    ${visitCountText}
                </p>

            </div>


            <div class="button-group">

                <button class="detail-btn">
                    詳細
                </button>


                <button class="history-btn">
                    履歴を見る
                </button>

            </div>

        `;


        // ------------------------------------------
        // ⭐ お気に入り
        // ------------------------------------------

        div
    .querySelector(".favorite-btn")
    .onclick = async (event) => {

        event.stopPropagation();
 

        const button =
            event.currentTarget;


        await toggleFavorite(
            customer,
            button
        );

    };


        // ------------------------------------------
        // 詳細
        // ------------------------------------------

        div
            .querySelector(".detail-btn")
            .onclick = () => {

                location.href =
                    "customer-detail.html?id=" +
                    customer.id;

            };


        // ------------------------------------------
        // 履歴
        // ------------------------------------------

        div
            .querySelector(".history-btn")
            .onclick = () => {

                location.href =
                    "customer-history.html?customer=" +
                    encodeURIComponent(
                        customer.name
                    );

            };


        customerList.appendChild(div);

    });

}


// ==================================================
// 顧客追加
// ==================================================

async function addCustomer(){

    const name =
        document
            .getElementById("customerName")
            .value;


    const postal =
        document
            .getElementById("postal")
            .value;


    const address1 =
        document
            .getElementById("address1")
            .value;


    const tel =
        document
            .getElementById("tel")
            .value;


    if(!name){

        alert(
            "顧客名を入力してください"
        );

        return;

    }


    await addDoc(

        collection(
            db,
            "customers"
        ),

        {

            name:
                name,

            postal:
                postal,

            address1:
                address1,

            tel:
                tel,

            // ⭐ 新規顧客はお気に入りOFF
            favorite:
                false,

            createdAt:
                new Date()

        }

    );


    alert(
        "顧客を追加しました"
    );


    document
        .getElementById("customerName")
        .value = "";


    document
        .getElementById("postal")
        .value = "";


    document
        .getElementById("address1")
        .value = "";


    document
        .getElementById("tel")
        .value = "";


    loadCustomers();

}


// ==================================================
// 顧客追加ボタン
// ==================================================

document
    .getElementById("saveCustomerBtn")
    .addEventListener(
        "click",
        addCustomer
    );


// ==================================================
// CSV一括取込
// ==================================================

const csvFile =
    document.getElementById("csvFile");


const importBtn =
    document.getElementById("importBtn");


const importStatus =
    document.getElementById("importStatus");


importBtn.addEventListener(
    "click",
    async () => {

        const file =
            csvFile.files[0];


        if(!file){

            alert(
                "CSVファイルを選択してください"
            );

            return;

        }


        importStatus.textContent =
            "CSV読み込み中...";


        const text =
            await file.text();


        const lines =
            text.split(/\r?\n/);


        let batch =
            writeBatch(db);


        let count = 0;

        let batchCount = 0;


        for(
            let i = 1;
            i < lines.length;
            i++
        ){

            if(!lines[i].trim()){

                continue;

            }


            const row =
                lines[i].split(",");


            const name =
                row[0]?.trim();


            if(!name){

                continue;

            }


            const customerRef =
                doc(
                    collection(
                        db,
                        "customers"
                    )
                );


            batch.set(

                customerRef,

                {

                    name:
                        row[0]?.trim() || "",

                    kana:
                        row[1]?.trim() || "",

                    name2:
                        row[2]?.trim() || "",

                    honorific:
                        row[3]?.trim() || "",

                    postal:
                        row[4]?.trim() || "",

                    address1:
                        row[5]?.trim() || "",

                    address2:
                        row[6]?.trim() || "",

                    tel:
                        row[7]?.trim() || "",

                    fax:
                        row[8]?.trim() || "",

                    contactName:
                        row[9]?.trim() || "",

                    contactHonorific:
                        row[10]?.trim() || "",

                    // ⭐ CSV登録時もお気に入りOFF
                    favorite:
                        false,

                    createdAt:
                        new Date()

                }

            );


            count++;

            batchCount++;


            // 500件ごと保存
            if(batchCount === 500){

                await batch.commit();


                batch =
                    writeBatch(db);


                batchCount = 0;


                importStatus.textContent =
                    `${count}件登録中...`;

            }

        }


        // 残り保存
        if(batchCount > 0){

            await batch.commit();

        }


        importStatus.textContent =
            `${count}件の顧客を登録しました`;


        alert(
            "CSV取込完了しました"
        );


        loadCustomers();

    }
);


// ==================================================
// 🔍 顧客検索 強化版
// ==================================================

searchInput.addEventListener(
    "input",
    () => {

        // ------------------------------------------
        // 検索文字を正規化
        // ------------------------------------------

        const normalize = (value) => {

            return String(value || "")
                .toLowerCase()

                // 全角英数字 → 半角
                .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
                    String.fromCharCode(
                        char.charCodeAt(0) - 0xfee0
                    )
                )

                // 全角スペース → 半角スペース
                .replace(/　/g, " ")

                // スペース・ハイフン類を削除
                .replace(/[\s\-ー－―‐]/g, "")

                .trim();

        };


        const text =
            normalize(searchInput.value);


        // ------------------------------------------
        // 入力なし
        // ------------------------------------------

        if(text === ""){

            sortCustomers();

            showCustomers(customers);

            return;

        }


        // ------------------------------------------
        // 検索
        // ------------------------------------------

        const result =
            customers.filter(customer => {

                const name =
                    normalize(customer.name);

                const kana =
                    normalize(customer.kana);

                const searchName =
                    normalize(customer.searchName);

                const postal =
                    normalize(customer.postal);

                const address1 =
                    normalize(customer.address1);

                const address2 =
                    normalize(customer.address2);

                const tel =
                    normalize(customer.tel);


                return (

                    // 顧客名
                    name.includes(text)

                    ||

                    // ふりがな
                    kana.includes(text)

                    ||

                    // 検索用名前
                    searchName.includes(text)

                    ||

                    // 郵便番号
                    postal.includes(text)

                    ||

                    // 住所
                    address1.includes(text)

                    ||

                    address2.includes(text)

                    ||

                    // 電話番号
                    tel.includes(text)

                );

            });


        // ------------------------------------------
        // 🔥 検索順位
        // ------------------------------------------

        result.sort((a, b) => {

            const aName =
                normalize(a.name);

            const bName =
                normalize(b.name);


            // ⭐ お気に入り優先
            if(a.favorite && !b.favorite){

                return -1;

            }

            if(!a.favorite && b.favorite){

                return 1;

            }


            // 🎯 名前完全一致
            if(aName === text && bName !== text){

                return -1;

            }

            if(aName !== text && bName === text){

                return 1;

            }


            // 🎯 名前が検索文字から始まる
            const aStart =
                aName.startsWith(text);

            const bStart =
                bName.startsWith(text);


            if(aStart && !bStart){

                return -1;

            }

            if(!aStart && bStart){

                return 1;

            }


            // 🔤 それ以外は名前順
            return aName.localeCompare(
                bName,
                "ja"
            );

        });


        // ------------------------------------------
        // 🔢 検索結果表示
        // ------------------------------------------

        showCustomers(result);


        console.log(
            `顧客検索：${text} → ${result.length}件`
        );

    }
);


// ==================================================
// 起動
// ==================================================

loadCustomers();