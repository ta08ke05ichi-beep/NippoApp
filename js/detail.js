import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const params = new URLSearchParams(location.search);

const id = params.get("id");

const detail =
document.getElementById("detail");

async function getCustomerName(id){

    if(!id || id === "選択してください"){

        return id || "";

    }

    const snap =
    await getDoc(doc(db,"customers",id));

    if(snap.exists()){

        return snap.data().name;

    }

    return id;

}

async function loadDetail(){

    const snap =
    await getDoc(doc(db,"reports",id));

    if(!snap.exists()){

        detail.innerHTML = "<p>日報が見つかりません。</p>";

        return;

    }

    const data = snap.data();

    const customerName =
    await getCustomerName(data.customer);

    detail.innerHTML = `

    <div class="detail-card">

        <h2>${data.name}さんの日報</h2>

        <p>📅 ${data.date}</p>

        <p>🏢 ${customerName}</p>

        <p>🕒 ${data.startTime} ～ ${data.endTime}</p>

        <p>🔧 ${data.work}</p>

    </div>

    `;

}

loadDetail();

document.getElementById("backBtn")
.addEventListener("click",()=>{

    location.href="reports.html";

});

document.getElementById("editBtn")
.addEventListener("click",()=>{

    location.href=`edit.html?id=${id}`;

});

document.getElementById("deleteBtn")
.addEventListener("click",async()=>{

    if(confirm("この日報を削除しますか？")){

        await deleteDoc(
            doc(db,"reports",id)
        );

        alert("削除しました");

        location.href="reports.html";

    }

});