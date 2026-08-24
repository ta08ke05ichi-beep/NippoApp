import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("edit.js 起動");


const params =
    new URLSearchParams(location.search);

const id =
    params.get("id");


const nameInput =
    document.getElementById("name");

const dateInput =
    document.getElementById("date");

const customerInput =
    document.getElementById("customer");

const workInput =
    document.getElementById("work");

const contentInput =
    document.getElementById("content");


// ==============================
// 顧客一覧読み込み
// ==============================

async function loadCustomers(selectedCustomer){

    customerInput.innerHTML = "";

    const first =
        document.createElement("option");

    first.value = "";

    first.textContent =
        "顧客を選択してください";

    customerInput.appendChild(first);


    const snapshot =
        await getDocs(
            collection(db, "customers")
        );


    snapshot.forEach(docSnap => {

        const data =
            docSnap.data();


        const option =
            document.createElement("option");

        option.value =
            data.name || "";

        option.textContent =
            data.name || "";


        if(
            data.name === selectedCustomer
        ){

            option.selected = true;

        }


        customerInput.appendChild(option);

    });

}


// ==============================
// 日報データ読み込み
// ==============================

async function loadData(){

    if(!id){

        alert("日報IDがありません");

        return;

    }


    const snap =
        await getDoc(
            doc(db, "reports", id)
        );


    if(!snap.exists()){

        alert("日報がありません");

        return;

    }


    const data =
        snap.data();

    console.log(
        "編集データ",
        data
    );


    nameInput.value =
        data.name || "";

    dateInput.value =
        data.date || "";


    // 現在の日報形式
    // tasks の先頭を編集対象にする

    const task =
        data.tasks &&
        data.tasks.length > 0
            ? data.tasks[0]
            : null;


    if(task){

        customerInput.dataset.selected =
            task.customer || "";

        workInput.value =
            task.work || "";

        contentInput.value =
            task.content || "";

        await loadCustomers(
            task.customer
        );

    }
    else{

        await loadCustomers("");

    }

}


loadData();


// ==============================
// 更新
// ==============================

document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        async () => {


            try{


                const snap =
                    await getDoc(
                        doc(db, "reports", id)
                    );


                if(!snap.exists()){

                    alert(
                        "日報がありません"
                    );

                    return;

                }


                const data =
                    snap.data();


                const tasks =
                    data.tasks || [];


                if(tasks.length === 0){

                    alert(
                        "編集する訪問データがありません"
                    );

                    return;

                }


                tasks[0] = {

                    ...tasks[0],

                    customer:
                        customerInput.value,

                    work:
                        workInput.value,

                    content:
                        contentInput.value

                };


                await updateDoc(

                    doc(
                        db,
                        "reports",
                        id
                    ),

                    {

                        name:
                            nameInput.value,

                        date:
                            dateInput.value,

                        tasks:
                            tasks

                    }

                );


                alert(
                    "更新しました😊"
                );


                location.href =
                    `report-detail.html?id=${id}`;


            }
            catch(e){

                console.error(
                    "更新エラー",
                    e
                );

                alert(
                    "更新に失敗しました"
                );

            }

        }
    );