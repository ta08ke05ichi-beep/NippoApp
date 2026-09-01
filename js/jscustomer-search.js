```js
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const search =
    document.getElementById("customerSearch");

const list =
    document.getElementById("customerSearchList");


let customers = [];


// ==========================================
// 顧客読み込み
// ==========================================

async function loadCustomers() {

    try {

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

                name:
                    data.name || "",

                favorite:
                    data.favorite === true

            });

        });


        showCustomers(customers);

    }
    catch (error) {

        console.error(
            "顧客読み込みエラー",
            error
        );

    }

}


// ==========================================
// 顧客表示
// ==========================================

function showCustomers(data) {

    list.innerHTML = "";


    data.forEach(customer => {

        const div =
            document.createElement("div");


        div.className =
            "customer-item";


        // 顧客名

        const name =
            document.createElement("span");

        name.textContent =
            "🏢 " + customer.name;


        // ⭐ボタン

        const favoriteButton =
            document.createElement("button");


        favoriteButton.type =
            "button";


        favoriteButton.className =
            "favorite-button";


        favoriteButton.textContent =
            customer.favorite
                ? "⭐"
                : "☆";


        // ⭐クリック

        favoriteButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                console.log(
                    "⭐クリック",
                    customer.name
                );


                const oldFavorite =
                    customer.favorite;


                const newFavorite =
                    !oldFavorite;


                // まず画面変更

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
                        "お気に入り保存完了"
                    );

                }
                catch (error) {

                    console.error(
                        "お気に入り保存エラー",
                        error
                    );


                    // 保存失敗したら戻す

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


        // 顧客クリック

        div.addEventListener(
            "click",
            function () {

                location.href =
                    "report.html?customer=" +
                    encodeURIComponent(
                        customer.name
                    );

            }
        );


        div.appendChild(
            favoriteButton
        );

        div.appendChild(
            name
        );


        list.appendChild(div);

    });

}


// ==========================================
// 検索
// ==========================================

search.addEventListener(
    "input",
    function () {

        const text =
            search.value.trim();


        const result =
            customers.filter(
                function (customer) {

                    return customer.name.includes(
                        text
                    );

                }
            );


        showCustomers(result);

    }
);


// ==========================================
// 起動
// ==========================================

loadCustomers();
```
