import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
}
from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const search =
    document.getElementById("customerSearch");


const list =
    document.getElementById("customerSearchList");


let customers = [];



// ==========================================
// 顧客読み込み
// ==========================================

async function loadCustomers(){

    try{

        const snap =
            await getDocs(
                collection(db, "customers")
            );


        customers = [];


        snap.forEach(docSnap => {

            const data =
                docSnap.data();


            customers.push({

                id: docSnap.id,

                name: data.name || "",

                favorite:
                    data.favorite === true

            });

        });


        // お気に入りを上に
        sortCustomers();


        showCustomers(customers);


        console.log(
            "顧客読み込み完了",
            customers.length
        );


    }
    catch(error){

        console.error(
            "顧客読み込みエラー",
            error
        );

    }

}



// ==========================================
// 並び替え
// ==========================================

function sortCustomers(){

    customers.sort((a, b) => {

        // お気に入りを上
        if(a.favorite !== b.favorite){

            return b.favorite - a.favorite;

        }


        // 名前順
        return a.name.localeCompare(
            b.name,
            "ja"
        );

    });

}



// ==========================================
// 表示
// ==========================================

function showCustomers(data){

    list.innerHTML = "";


    data.forEach(customer => {


        const div =
            document.createElement("div");


        div.className =
            "customer-item";


        div.innerHTML = `

            <button
                class="favorite-button"
                type="button"
            >
                ${customer.favorite ? "⭐" : "☆"}
            </button>

            <span>
                🏢 ${customer.name}
            </span>

        `;


        // ======================================
        // お気に入りボタン
        // ======================================

        const favoriteButton =
            div.querySelector(
                ".favorite-button"
            );


        favoriteButton.onclick =
            async (event) => {

                // 顧客クリックを発生させない
                event.stopPropagation();


                await toggleFavorite(
                    customer,
                    favoriteButton
                );

            };


        // ======================================
        // 顧客選択
        // ======================================

        div.onclick = () => {

            location.href =
                `report.html?customer=${encodeURIComponent(customer.name)}`;

        };


        list.appendChild(div);

    });

}



// ==========================================
// お気に入り切り替え
// ==========================================

async function toggleFavorite(
    customer,
    button
){

    const oldFavorite =
        customer.favorite === true;


    const newFavorite =
        !oldFavorite;


    // ======================================
    // ① 画面を即変更
    // ======================================

    customer.favorite =
        newFavorite;


    button.textContent =
        newFavorite ? "⭐" : "☆";


    // ======================================
    // ② Firebaseへ保存
    // ======================================

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


        // 並び替え
        sortCustomers();


        // 検索中なら検索結果を維持
        const text =
            search.value.trim();


        const result =
            customers.filter(c =>
                c.name.includes(text)
            );


        showCustomers(result);


    }
    catch(error){

        console.error(
            "お気に入り保存エラー",
            error
        );


        // ==================================
        // 保存失敗 → 元に戻す
        // ==================================

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



// ==========================================
// 検索
// ==========================================

search.addEventListener(
    "input",
    () => {

        const text =
            search.value.trim();


        const result =
            customers.filter(c =>

                c.name.includes(text)

            );


        // 検索結果もお気に入りを上
        result.sort((a, b) => {

            if(a.favorite !== b.favorite){

                return b.favorite - a.favorite;

            }


            return a.name.localeCompare(
                b.name,
                "ja"
            );

        });


        showCustomers(result);

    }
);



// ==========================================
// 起動
// ==========================================

loadCustomers();