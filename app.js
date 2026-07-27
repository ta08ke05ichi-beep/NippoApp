import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// 今日の日付を表示

let today = new Date();

let date =
today.getFullYear() + "年" +
(today.getMonth() + 1) + "月" +
today.getDate() + "日";


document.getElementById("today").innerHTML = date;



// 日報保存

async function saveReport(){

    let name =
    document.getElementById("name").value;


    let customer =
    document.getElementById("customer").value;


    let time =
    document.getElementById("time").value;


    let work =
    document.getElementById("work").value;



    let report = {

        date: date,
        name: name,
        customer: customer,
        time: time,
        work: work

    };


    await addDoc(
    collection(db,"reports"),
    report
);

document.getElementById("result").innerHTML =
"✅ 日報を保存しました！";


    document.getElementById("result").innerHTML =
    "✅ 日報を保存しました！";


}

// 名前保存

function saveName(){

    let name =
    document.getElementById("name").value;


    localStorage.setItem(
        "userName",
        name
    );


    alert("名前を登録しました！");
}


// 起動時に名前表示

let savedName =
localStorage.getItem("userName");


if(savedName){

    document.getElementById("name").value =
    savedName;

}

// 顧客データ取得

let customers =
JSON.parse(localStorage.getItem("customers")) || [];


// 顧客一覧表示

function showCustomers(){

    let select =
    document.getElementById("customer");


    select.innerHTML = "";


    customers.forEach(function(customer){

        let option =
        document.createElement("option");


        option.textContent = customer;


        select.appendChild(option);

    });

}


// 顧客追加

function addCustomer(){

    let input =
    document.getElementById("newCustomer");


    let name =
    input.value;


    if(name == ""){

        alert("会社名を入力してください");

        return;

    }


    customers.push(name);


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    input.value = "";


    showCustomers();

}


// 起動時表示

showCustomers();

window.saveName = saveName;
window.saveReport = saveReport;
window.addCustomer = addCustomer;

// 日報一覧表示

async function loadReports(){

    let list =
    document.getElementById("reportList");


    list.innerHTML = "";


    const querySnapshot =
    await getDocs(collection(db,"reports"));


    querySnapshot.forEach((doc)=>{


        let data = doc.data();


        let div =
        document.createElement("div");


        div.className = "card";


        div.innerHTML = `

        <p>📅 ${data.date}</p>

        <p>👤 ${data.name}</p>

        <p>🏢 ${data.customer}</p>

        <p>⏰ ${data.time}</p>

        <p>📝 ${data.work}</p>

        `;


        list.appendChild(div);


    });


}


// 起動時に読み込み

loadReports();