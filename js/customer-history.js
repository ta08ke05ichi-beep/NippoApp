import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



const customerName =
document.getElementById("customerName");


const historyList =
document.getElementById("historyList");



// URLから顧客名を取得

const params =
new URLSearchParams(location.search);


const customer =
params.get("customer");



customerName.textContent =
"🏢 " + customer;



// 履歴取得

async function loadHistory(){


    const snapshot =
    await getDocs(
        collection(db,"reports")
    );



    historyList.innerHTML="";



    let count = 0;



    snapshot.forEach((doc)=>{


        const report =
        doc.data();



        if(!report.tasks){
    return;
}


report.tasks.forEach(task=>{


            console.log("探してる顧客:", customer);
console.log("日報の顧客:", task.customer);

if(task.customer == customer){


                count++;


                const div =
                document.createElement("div");


                div.className="card";


                div.innerHTML = `

                <h3>
                📅 ${report.date}
                </h3>


                <p>
                👤 担当：${report.employee}
                </p>


                <p>
                ⏰ ${task.startTime}
                ～ 
                ${task.endTime}
                </p>


                <p>
                🔧 ${task.workContent}
                </p>


                `;


                historyList.appendChild(div);


            }


        });



    });



    if(count === 0){

        historyList.innerHTML =
        "この顧客の日報はありません";

    }


}



loadHistory();