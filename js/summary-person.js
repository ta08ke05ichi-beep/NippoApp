import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const monthInput =
document.getElementById("month");

const result =
document.getElementById("result");


// 今月を初期表示
const today = new Date();

monthInput.value =
`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;


document.getElementById("searchBtn")
.addEventListener("click", loadSummary);


async function loadSummary(){

    const snapshot =
    await getDocs(
        collection(db,"reports")
    );

    const month =
    monthInput.value;

    const persons = {};

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(!data.date.startsWith(month)){
            return;
        }

        const name = data.name || "未設定";

        if(!persons[name]){
            persons[name] = {
                visits: 0,
                customers: new Set()
            };
        }

        persons[name].visits++;

        if(data.customer){
            persons[name].customers.add(data.customer);
        }

    });

    result.innerHTML = "";

    if(Object.keys(persons).length === 0){
        result.innerHTML = `
            <div class="card">
                <h3>データがありません</h3>
            </div>
        `;
        return;
    }

    for(const name in persons){

        const info = persons[name];

        result.innerHTML += `
        <div class="card">

            <h2>👤 ${name}</h2>

            <p>訪問件数</p>

            <h3>${info.visits}件</h3>

            <hr>

            <p>訪問顧客数</p>

            <h3>${info.customers.size}社</h3>

        </div>
        `;
    }

}

loadSummary();