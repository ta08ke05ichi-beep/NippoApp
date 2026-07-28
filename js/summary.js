import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const monthInput =
document.getElementById("month");

const nameInput =
document.getElementById("name");

const visitCount =
document.getElementById("visitCount");


// 今月を初期表示
const today = new Date();

monthInput.value =
`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;


// 集計
document.getElementById("searchBtn")
.addEventListener("click",loadSummary);


async function loadSummary(){

    const snapshot = await getDocs(
        collection(db,"reports")
    );

    let count = 0;
    let work = 0;

    const customers = new Set();

    const month =
    monthInput.value;

    const name =
    nameInput.value;


    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(
            data.employee !== name
        ){
            return;
        }

        if(
            !data.date.startsWith(month)
        ){
            return;
        }

        if(Array.isArray(data.tasks)){

            count += data.tasks.length;
            work += data.tasks.length;

            data.tasks.forEach(task=>{

                if(task.customer){
                    customers.add(task.customer);
                }

            });

        }else{

            count++;
            work++;

        }

    });


    visitCount.textContent =
    `${count}件`;

    workCount.textContent =
    `${work}件`;

    customerCount.textContent =
    `${customers.size}社`;

}

document.getElementById("visitCount")
.addEventListener("click",()=>{

    const month =
    monthInput.value;

    const name =
    nameInput.value;

    location.href =
    `visit-list.html?month=${month}&name=${encodeURIComponent(name)}`;

});

const workCount =
document.getElementById("workCount");

const customerCount =
document.getElementById("customerCount");