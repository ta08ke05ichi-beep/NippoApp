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

if (!data.name || data.name.trim() === "") {
    return;
}


customers.push({

    id: doc.id,

    name: data.name || "",

    postal: data.postal || "",

    address1: data.address1 || "",

    address2: data.address2 || "",

    tel: data.tel || "",

    kana: data.kana || "",

    searchName:
        (data.searchName || data.name || "")
        .toLowerCase()

});

    });

    showCustomers(customers);

}

function showCustomers(list){

    customerList.innerHTML = "";

    list.forEach(customer=>{

        const div = document.createElement("div");

        div.className = "customer-card";

        div.innerHTML = `
<h3>🏢 ${customer.name}</h3>

<p>📮 ${customer.postal || "住所情報なし"}</p>

<p>📍 ${customer.address1 || ""}${customer.address2 || ""}</p>

<p>☎ ${customer.tel || "電話番号なし"}</p>

<div class="button-group">

<button class="detail-btn">
詳細
</button>

<button class="history-btn">
履歴を見る
</button>

</div>
`;

        div.querySelector(".detail-btn").onclick = ()=>{

            location.href =
            "customer-detail.html?id=" + customer.id;

        };

        div.querySelector(".history-btn").onclick = ()=>{

            location.href =
            "customer-history.html?customer=" +
            encodeURIComponent(customer.name);

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



let batch =
writeBatch(db);


let count = 0;

let batchCount = 0;



for(let i = 1; i < lines.length; i++){


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
    doc(collection(db,"customers"));



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


});

searchInput.addEventListener(
"input",
()=>{

    const text =
    searchInput.value
    .toLowerCase()
    .trim();

    if(text === ""){

        loadCustomers();
        return;

    }

    const result = customers.filter(customer=>{

        return (

            customer.name.toLowerCase().includes(text)

            ||

            customer.searchName.includes(text)

            ||

            customer.postal.includes(text)

            ||

            customer.address1.toLowerCase().includes(text)

            ||

            customer.address2.toLowerCase().includes(text)

            ||

            customer.tel.includes(text)

        );

    });

    showCustomers(result);

});


