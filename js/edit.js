import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const params = new URLSearchParams(location.search);

const id = params.get("id");


const name = document.getElementById("name");
const date = document.getElementById("date");
const customer = document.getElementById("customer");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const work = document.getElementById("work");


// データ取得

async function loadData(){

    const snap = await getDoc(
        doc(db,"reports",id)
    );


    const data = snap.data();


    name.value = data.name || "";
    date.value = data.date || "";
    customer.value = data.customer || "";
    startTime.value = data.startTime || "";
    endTime.value = data.endTime || "";
    work.value = data.work || "";

}


loadData();


// 更新保存

document.getElementById("saveBtn").addEventListener("click", async()=>{


    await updateDoc(
        doc(db,"reports",id),
        {

            name:name.value,
            date:date.value,
            customer:customer.value,
            startTime:startTime.value,
            endTime:endTime.value,
            work:work.value

        }
    );


    alert("更新しました");


    location.href=`report-detail.html?id=${id}`;


});