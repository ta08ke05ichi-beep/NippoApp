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


const customerSearch =
document.querySelector(".customer-search");


const customerResult =
document.querySelector(".customer-result");


const customerValue =
document.querySelector(".customer-value");


const workInput =
document.querySelector(".work");


const startTimeInput =
document.querySelector(".start-time");


const endTimeInput =
document.querySelector(".end-time");


const contentInput =
document.querySelector(".content");


const saveBtn =
document.getElementById("saveBtn");



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

    try{

        const snapshot =
        await getDocs(
            collection(db,"customers")
        );


        customers = [];


        snapshot.forEach(doc=>{

            customers.push(
                doc.data()
            );

        });


        console.log(
            "顧客一覧読み込み完了",
            customers
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

if(saveBtn){


    saveBtn.addEventListener(
        "click",
        async ()=>{


            const reportData = {


                date:
                dateInput.value,


                name:
                nameInput.value,


                customer:
customerValue.value,


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


                customerSearch.value =
"";

customerValue.value =
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

// ==============================
// 顧客検索
// ==============================

let customers = [];



// 入力したら検索

customerSearch.addEventListener(
"input",
()=>{


    const keyword =
    customerSearch.value;


    customerResult.innerHTML="";


    if(keyword === ""){
        return;
    }



    customers
.filter(customer => {


    const search =
    keyword
    .toLowerCase()
    .replace(/\s/g,"");


    return customer.searchName
    &&
    customer.searchName.includes(search);


})
.forEach(customer=>{


    const div =
    document.createElement("div");


    div.textContent =
    customer.name;


    div.className =
    "customer-item";


    div.onclick = ()=>{


        customerSearch.value =
        customer.name;


        customerValue.value =
        customer.name;


        document.querySelector(".customer-name").textContent =
        customer.name;


        document.querySelector(".customer-address").textContent =
        customer.address1;


        document.querySelector(".customer-tel").textContent =
        customer.tel;


        customerResult.innerHTML =
        "";


    };


    customerResult.appendChild(div);


});
   


});