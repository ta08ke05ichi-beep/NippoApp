import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    writeBatch,
    doc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

console.log("customers.js 起動");


const customerList =
document.getElementById("customerList");

let customers = [];

const searchInput =
document.getElementById("searchInput");

// 顧客一覧表示

async function loadCustomers(){

    customers = [];

    customerList.innerHTML="読み込み中...";


    const q =
    query(
        collection(db,"customers"),
        orderBy("name")
    );


    const snapshot =
    await getDocs(q);



    if(snapshot.empty){

        customerList.innerHTML=
        "登録されている顧客はありません";

        return;

    }



    customerList.innerHTML="";



    snapshot.forEach((doc)=>{


        const data = doc.data();

        customers.push(data);

        const div =
        document.createElement("div");


        div.className="customer-card";


   div.innerHTML =
`
<h3>
🏢 ${data.name}
</h3>

<p>
📮 ${data.postal || "住所情報なし"}
</p>

<p>
📍 ${data.address1 || ""}${data.address2 || ""}
</p>

<p>
☎ ${data.tel || "電話番号なし"}
</p>

<button class="history-btn">
履歴を見る
</button>

`;


const btn =
div.querySelector(".history-btn");


btn.onclick = ()=>{

    location.href =
    "customer-history.html?customer=" + data.name;

};


customerList.appendChild(div);


    });


}



// 顧客追加

async function addCustomer(){


const name =
document.getElementById("customerName").value;


const postal =
document.getElementById("postal").value;


const address1 =
document.getElementById("address1").value;


const tel =
document.getElementById("tel").value;



if(!name){

    alert("顧客名を入力してください");

    return;

}



await addDoc(
collection(db,"customers"),
{

name:name,

postal:postal,

address1:address1,

tel:tel,

createdAt:new Date()

}

);



alert("顧客を追加しました");



document.getElementById("customerName").value="";
document.getElementById("postal").value="";
document.getElementById("address1").value="";
document.getElementById("tel").value="";



loadCustomers();


}


// ボタン

document.getElementById(
"saveCustomerBtn"
)
.addEventListener(
"click",
addCustomer
);


// 起動

loadCustomers();

// =====================
// CSV一括取込（writeBatch版）
// =====================

const csvFile =
document.getElementById("csvFile");

const importBtn =
document.getElementById("importBtn");

const importStatus =
document.getElementById("importStatus");



importBtn.addEventListener(
"click",
async()=>{


    const file =
    csvFile.files[0];


    if(!file){

        alert("CSVファイルを選択してください");

        return;

    }


    importStatus.textContent =
    "CSV読み込み中...";



    const text =
    await file.text();



    const lines =
    text.split(/\r?\n/);



   let batch = writeBatch(db);

let count = 0;


for(let i = 1; i < lines.length; i++){

    if(!lines[i].trim()){
        continue;
    }


    const row =
    lines[i].split(",");


    const customerRef =
    doc(collection(db,"customers"));


    batch.set(customerRef,{
        name: row[0]?.trim() || "",
        name2: row[1]?.trim() || "",
        honorific: row[2]?.trim() || "",
        postal: row[3]?.trim() || "",
        address1: row[4]?.trim() || "",
        address2: row[5]?.trim() || "",
        tel: row[6]?.trim() || "",
        fax: row[7]?.trim() || "",
        contactName: row[8]?.trim() || "",
        contactHonorific: row[9]?.trim() || "",
        createdAt:new Date()
    });


    count++;


    if(count % 500 === 0){

        await batch.commit();

        batch = writeBatch(db);

    }

}


await batch.commit();



    importStatus.textContent =
    `${count}件の顧客を登録しました`;



    alert(
        "CSV取込完了しました"
    );


    loadCustomers();



});

searchInput.addEventListener(
"input",
()=>{


    const text =
    searchInput.value.toLowerCase();


    const result =
    customers.filter(customer=>{


        return (

            customer.name?.toLowerCase().includes(text)

            ||

            customer.postal?.includes(text)

            ||

            customer.address1?.toLowerCase().includes(text)
||
customer.address2?.toLowerCase().includes(text)

            ||

            customer.tel?.includes(text)

        );


    });


    customerList.innerHTML="";


    result.forEach(customer=>{


        const div =
        document.createElement("div");


        div.className =
        "customer-card";


        div.innerHTML = `

        <h3>🏢 ${customer.name}</h3>

        <p>📮 ${customer.postal || ""}</p>

        <p>
📍 ${customer.address1 || ""}${customer.address2 || ""}
</p>

        <p>☎ ${customer.tel || ""}</p>

        `;


        customerList.appendChild(div);


    });


});