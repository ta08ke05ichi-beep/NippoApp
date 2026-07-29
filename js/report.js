// report.js 前半

console.log("report.js 起動");


import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



// ==============================
// 要素取得
// ==============================

const dateInput =
document.getElementById("date");


const nameInput =
document.getElementById("name");


const customerSelect =
document.getElementById("customer");


const workInput =
document.getElementById("work");


const timeInput =
document.getElementById("time");


const memoInput =
document.getElementById("memo");


const submitBtn =
document.getElementById("submitBtn");



// ==============================
// 日付 自動入力
// ==============================

if(dateInput){

    const today = new Date();

    const year =
    today.getFullYear();

    const month =
    String(today.getMonth()+1)
    .padStart(2,"0");

    const day =
    String(today.getDate())
    .padStart(2,"0");


    dateInput.value =
    `${year}-${month}-${day}`;

}



// ==============================
// 名前を保存
// ==============================

if(nameInput){

    const savedName =
    localStorage.getItem("reportName");


    if(savedName){

        nameInput.value =
        savedName;

    }


    nameInput.addEventListener(
        "change",
        ()=>{

            localStorage.setItem(
                "reportName",
                nameInput.value
            );

        }
    );

}




// ==============================
// 顧客一覧取得
// ==============================

async function loadCustomers(){


    if(!customerSelect){
        return;
    }


    try{


        const snapshot =
        await getDocs(
            collection(db,"customers")
        );


        customerSelect.innerHTML =
        `
        <option value="">
        顧客を選択してください
        </option>
        `;



        snapshot.forEach(doc=>{


            const data =
            doc.data();


            const option =
            document.createElement("option");


            option.value =
            data.name;


            option.textContent =
            data.name;


            customerSelect.appendChild(
                option
            );


        });



        console.log(
            "顧客一覧読み込み完了"
        );


    }
    catch(error){


        console.error(
            "顧客取得エラー",
            error
        );


    }


}



loadCustomers();


// ==============================
// 日報保存
// ==============================

if(submitBtn){


    submitBtn.addEventListener(
        "click",
        async ()=>{


            const reportData = {


                date:
                dateInput.value,


                name:
                nameInput.value,


                customer:
                customerSelect.value,


                work:
                workInput.value,


                time:
                timeInput.value,


                memo:
                memoInput.value,


                createdAt:
                serverTimestamp()


            };



            // ==================
            // 入力チェック
            // ==================

            if(
                !reportData.date ||
                !reportData.name
            ){


                alert(
                    "日付と名前を入力してください"
                );


                return;

            }




            try{


                await addDoc(
                    collection(db,"reports"),
                    reportData
                );



                alert(
                    "日報を保存しました！"
                );



                // ==================
                // 入力リセット
                // ==================


                customerSelect.value =
                "";


                workInput.value =
                "";


                timeInput.value =
                "";


                memoInput.value =
                "";



                console.log(
                    "保存完了",
                    reportData
                );



            }
            catch(error){


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