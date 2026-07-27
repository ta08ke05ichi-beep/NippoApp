import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const params = new URLSearchParams(location.search);

const customer =
params.get("customer");

const month =
params.get("month");

const name =
params.get("name");

const historyList =
document.getElementById("historyList");


// 戻る
document.getElementById("backBtn")
.addEventListener("click",()=>{

    location.href =
`visit-list.html?month=${month}&name=${encodeURIComponent(name)}`;

});



async function getCustomerName(id){

    const snap = await getDoc(
        doc(db,"customers",id)
    );

    if(snap.exists()){

        return snap.data().name;

    }

    return "不明";

}



async function loadHistory(){

    const snapshot = await getDocs(
        collection(db,"reports")
    );

    historyList.innerHTML = "";


    for(const docSnap of snapshot.docs){

        const data = docSnap.data();


        if(name !== "全員" && data.name !== name){

            continue;

        }


        if(!data.date.startsWith(month)){

            continue;

        }


        if(!Array.isArray(data.tasks)){

            continue;

        }


        for(const task of data.tasks){

            const customerName =
            await getCustomerName(task.customer);


            if(customerName !== customer){

                continue;

            }


            historyList.innerHTML += `

<div class="history-card">

<h2>📅 ${data.date}</h2>

<p>👤 ${data.name}</p>

<p>🕒 ${task.startTime} ～ ${task.endTime}</p>

<p>📝 ${task.work}</p>

</div>

`;

        }

    }

}

loadHistory();