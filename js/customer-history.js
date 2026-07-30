import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



const customerName =
document.getElementById("customerName");


const historyList =
document.getElementById("historyList");



const params =
new URLSearchParams(location.search);


const customer =
params.get("customer");



customerName.textContent =
"🏢 " + customer;



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


            if(task.customer == customer){


                count++;


                const div =
                document.createElement("div");


                div.className =
                "history-card";



                div.innerHTML = `


                <h3>
                📅 ${report.date || ""}
                </h3>


                <p>
                👤 担当：${report.name || ""}
                </p>


                <p>
                ⏰ ${task.start || ""}
                ～ 
                ${task.end || ""}
                </p>


                <p>
                🔧 ${task.work || ""}
                </p>


                <p>
                📝 ${task.content || ""}
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