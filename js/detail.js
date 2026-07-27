import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const params = new URLSearchParams(location.search);

const id = params.get("id");


const detail = document.getElementById("detail");


async function loadDetail(){


const snap = await getDoc(
    doc(db,"reports",id)
);


const data = snap.data();


detail.innerHTML = `

<div class="detail-card">

<h2>${data.name}さんの日報</h2>

<p>📅 ${data.date}</p>

<p>🏢 ${data.customer}</p>

<p>📝 ${data.work}</p>

</div>

`;

}


loadDetail();

document.getElementById("backBtn").addEventListener("click",()=>{

    location.href = "reports.html";

});

document.getElementById("deleteBtn").addEventListener("click", async()=>{

    if(confirm("この日報を削除しますか？")){

        await deleteDoc(
            doc(db,"reports",id)
        );

        alert("削除しました");

        location.href="reports.html";

    }

});

document.getElementById("editBtn").addEventListener("click",()=>{

    location.href = `edit.html?id=${id}`;

});