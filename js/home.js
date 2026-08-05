import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.getElementById("reportBtn").addEventListener("click",()=>{

    location.href = "pages/report.html";

});

document.getElementById("reportsBtn").addEventListener("click",()=>{

    location.href = "pages/reports.html";

});

document.getElementById("customersBtn").addEventListener("click",()=>{

    location.href = "pages/customers.html";

});

document.getElementById("summaryBtn").addEventListener("click",()=>{

    location.href = "pages/summary.html";

});

// 今日の日報表示

async function loadTodayReports(){

console.log("今日の日報読み込み開始");

const today = new Date();

const year =
today.getFullYear();

const month =
String(today.getMonth()+1).padStart(2,"0");

const day =
String(today.getDate()).padStart(2,"0");


const todayText =
`${year}-${month}-${day}`;



const snapshot =
await getDocs(
collection(db,"reports")
);



let count = 0;


snapshot.forEach((doc)=>{


const data =
doc.data();


if(data.date === todayText){

    count++;

}


});

console.log("今日の日報件数:", count);

document.getElementById(
"todayCount"
).textContent =

`今日の日報 ${count}件`;



}

// 今月の訪問件数

async function loadMonthReports(){

    const today = new Date();

    const month =
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

    const snapshot =
    await getDocs(
        collection(db,"reports")
    );

    let count = 0;

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(
            data.date &&
            data.date.startsWith(month)
        ){

            count++;

        }

    });

    document.getElementById(
        "monthCount"
    ).textContent =
    `${count}件`;

}

// 登録顧客数

async function loadCustomerTotal(){

    const snapshot =
    await getDocs(
        collection(db,"customers")
    );

    document.getElementById(
        "customerTotal"
    ).textContent =
    `${snapshot.size}社`;

}

loadTodayReports();

loadMonthReports();

loadCustomerTotal();