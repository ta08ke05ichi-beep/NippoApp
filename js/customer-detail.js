import { db } from "./firebase.js";

import {

doc,
getDoc,
updateDoc,
collection,
getDocs,
query,
where

} from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const params = new URLSearchParams(location.search);

const id = params.get("id");


const customerInfo =
document.getElementById("customerInfo");


const historyList =
document.getElementById("historyList");


// 履歴取得

async function loadHistory(){

    const snapshot = await getDocs(
        collection(db,"reports")
    );

    historyList.innerHTML = "";

    for(const docSnap of snapshot.docs){

        const data = docSnap.data();

        if(!Array.isArray(data.tasks)){
            continue;
        }

        for(const task of data.tasks){

            if(task.customer !== id){
                continue;
            }

            historyList.innerHTML += `

<div class="report-card">

<h2>${data.name}さん</h2>

<p>📅 ${data.date}</p>

<p>🕒 ${task.startTime} ～ ${task.endTime}</p>

<p>📝 ${task.work}</p>

</div>

`;

        }

    }

    if(historyList.innerHTML === ""){

        historyList.innerHTML =
        "<p>対応履歴はありません。</p>";

    }

}

loadCustomer();

async function loadCustomer(){

    const snap = await getDoc(
        doc(db,"customers",id)
    );

    const data = snap.data();

    customerInfo.innerHTML = `

<div class="detail-card">

<label>顧客名</label>
<input type="text" id="name" value="${data.name || ""}">

<label>住所</label>
<input type="text" id="address" value="${data.address || ""}">

<label>電話番号</label>
<input type="text" id="tel" value="${data.tel || ""}">

<label>メモ</label>
<textarea id="memo">${data.memo || ""}</textarea>

<button id="saveBtn">
💾 保存
</button>

</div>

`;

    document.getElementById("saveBtn")
    .addEventListener("click", async()=>{

        await updateDoc(
            doc(db,"customers",id),
            {
                name: document.getElementById("name").value,
                address: document.getElementById("address").value,
                tel: document.getElementById("tel").value,
                memo: document.getElementById("memo").value
            }
        );

        alert("保存しました😊");

    });

}

loadHistory();


// 戻る

document.getElementById("backBtn")
.addEventListener("click",()=>{

location.href="customers.html";

});