import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const params = new URLSearchParams(location.search);

const month = params.get("month");

const name = params.get("name");

const visitList =
document.getElementById("visitList");



async function getCustomerName(id){

    const snap = await getDoc(
        doc(db,"customers",id)
    );

    if(snap.exists()){

        return snap.data().name;

    }

    return "不明";

}



async function loadVisits(){

    const snapshot = await getDocs(
        collection(db,"reports")
    );

    const customerCounts = {};



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


            if(!customerCounts[customerName]){

                customerCounts[customerName]=0;

            }


            customerCounts[customerName]++;

        }

    }


    visitList.innerHTML="";


    for(const customer in customerCounts){

        visitList.innerHTML += `

<div class="visit-card"
onclick="openHistory('${customer}')">

<h2>${customer}</h2>

<p>訪問回数：${customerCounts[customer]}回</p>

</div>

`;

    }

}



window.openHistory=function(customer){

    location.href=
`visit-history.html?customer=${encodeURIComponent(customer)}&month=${month}&name=${encodeURIComponent(name)}`;

}



loadVisits();
