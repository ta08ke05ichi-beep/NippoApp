import { db } from "./firebase.js";

import {

    collection,
    getDocs,
    addDoc,
    serverTimestamp

} from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



console.log("report.js 起動");





// ======================
// 要素取得
// ======================


const tasksArea = document.getElementById("tasks");

const addTaskBtn =
document.getElementById("addTaskBtn");

const saveBtn =
document.getElementById("saveBtn");

const dateInput =
document.getElementById("date");

const nameInput =
document.getElementById("name");





// ======================
// 日付自動入力
// ======================


const today = new Date();


const yyyy =
today.getFullYear();


const mm =
String(today.getMonth()+1)
.padStart(2,"0");


const dd =
String(today.getDate())
.padStart(2,"0");



dateInput.value =
`${yyyy}-${mm}-${dd}`;







// ======================
// 顧客データ
// ======================


let customers = [];





// ======================
// 顧客読み込み
// ======================


async function loadCustomers(){


    try{


        const snap =
        await getDocs(
            collection(db,"customers")
        );



        customers = [];



        snap.forEach(doc=>{


            customers.push({

                id:doc.id,

                ...doc.data()

            });


        });



        console.log(
            "顧客読み込み完了",
            customers.length
        );

console.log(
    "顧客1件目確認",
    customers[0]
);

    }
    catch(e){


        console.error(
            "顧客取得エラー",
            e
        );


    }


}



loadCustomers();









// ======================
// 顧客検索
// ======================


function searchCustomer(input){


    const keyword =
    input.value
    .trim()
    .toLowerCase();



    const result =
    input
    .nextElementSibling;



    result.innerHTML="";



    if(!keyword){

        return;

    }





 const list =
customers.filter(c=>{


    const target =

        (c.name || "") +

        (c.kana || "") +

        (c.tel || "") +

        (c.searchName || "");



    return target
    .toLowerCase()
    .includes(keyword);


});

console.log(
    "検索結果件数",
    list.length
);





    list.slice(0,20)
    .forEach(c=>{


        const div =
        document.createElement("div");



        div.className =
        "customer-item";


        div.innerHTML = `

<strong>
${c.name || "会社名なし"}
</strong>

<br>

${c.tel || ""}

`;



        div.onclick = ()=>{


            selectCustomer(
                input,
                c
            );


        };



        result.appendChild(div);



    });



}
// ======================
// 顧客選択
// ======================


function selectCustomer(input, customer){



    const card =
    input.closest(".visit-card");



    const detail =
    card.querySelector(".customer-detail");



    const hidden =
    card.querySelector(".customer-value");



    const result =
    card.querySelector(".customer-result");





    hidden.value =
    customer.id;



    card.querySelector(".customer-name")
.textContent =
customer.name || "";



card.querySelector(".customer-address")
.textContent =
(customer.address1 || "")
+
(customer.address2 || "");



    card.querySelector(".customer-tel")
    .textContent =
    customer.tel || "";




    detail.style.display =
    "block";



    result.innerHTML="";



    input.value =
customer.name;




}






// ======================
// 検索イベント
// ======================


document.addEventListener(
"input",
e=>{


    if(
        e.target.classList.contains(
            "customer-search"
        )
    ){


        searchCustomer(
            e.target
        );


    }


});









// ======================
// 訪問追加
// ======================


addTaskBtn.onclick = ()=>{


    const count =
    document.querySelectorAll(
        ".visit-card"
    ).length + 1;



    const first =
    document.querySelector(
        ".visit-card"
    );



    const clone =
    first.cloneNode(true);



    clone.querySelector(
        ".visit-title"
    )
    .textContent =
    `訪問${count}`;



    clone.querySelectorAll(
        "input,textarea,select"
    )
    .forEach(el=>{


        if(
            el.type !== "hidden"
        ){

            el.value="";

        }


    });




    clone.querySelector(
        ".customer-detail"
    )
    .style.display =
    "none";



    clone.querySelector(
        ".customer-result"
    )
    .innerHTML="";



    tasksArea.appendChild(
        clone
    );


};









// ======================
// 保存
// ======================


saveBtn.onclick =
async ()=>{



    const tasks=[];



    document.querySelectorAll(
        ".visit-card"
    )
    .forEach(card=>{



        const task={



            customer:

            card.querySelector(
                ".customer-name"
            )
            .textContent,



            address:

            card.querySelector(
                ".customer-address"
            )
            .textContent,



            tel:

            card.querySelector(
                ".customer-tel"
            )
            .textContent,




            work:

            card.querySelector(
                ".work"
            )
            .value,



            content:

            card.querySelector(
                ".content"
            )
            .value



        };



        tasks.push(task);



    });









    try{


        await addDoc(

            collection(
                db,
                "reports"
            ),

            {


                date:
                dateInput.value,



                name:
                nameInput.value,



                tasks:tasks,



                createdAt:
                serverTimestamp()



            }


        );



        alert(
            "日報を保存しました"
        );



        location.reload();



    }
    catch(e){


        console.error(
            e
        );


        alert(
            "保存エラー"
        );


    }



};