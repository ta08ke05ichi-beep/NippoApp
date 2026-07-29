import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("report.js 起動");



const dateInput =
document.getElementById("date");


const nameInput =
document.getElementById("name");


const tasksArea =
document.getElementById("tasks");


const addTaskBtn =
document.getElementById("addTaskBtn");


const saveBtn =
document.getElementById("saveBtn");



let customers = [];





// 今日の日付セット

const today =
new Date();


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







// 名前保存

const savedName =
localStorage.getItem("reportName");


if(savedName){

nameInput.value =
savedName;

}



nameInput.addEventListener(
"change",
()=>{

localStorage.setItem(
"reportName",
nameInput.value
);

});








// 顧客一覧取得

async function loadCustomers(){


const snapshot =
await getDocs(
collection(db,"customers")
);


customers=[];


snapshot.forEach(doc=>{


const data =
doc.data();

customers.push({

    id: doc.id,

    name: data.name,

    searchName:

    data.name

    .replaceAll("株式会社","かぶしきがいしゃ")

    .replaceAll("有限会社","ゆうげんがいしゃ")

    .replaceAll("合同会社","ごうどうがいしゃ")

    .replaceAll("（株）","かぶしきがいしゃ")

    .replaceAll("(株)","かぶしきがいしゃ")

    .replaceAll("（有）","ゆうげんがいしゃ")

    .replaceAll("(有)","ゆうげんがいしゃ")

    .toLowerCase()

});

});


console.log(
"顧客数:",
customers.length
);

console.log(
"検索用データ:",
customers[0]
);

}


// 顧客検索設定

function setupCustomerSearch(card){


const search =
card.querySelector(".customer-search");


const result =
card.querySelector(".customer-result");


const value =
card.querySelector(".customer-value");

const address =
card.querySelector(".customer-address");

const tel =
card.querySelector(".customer-tel");

if(!search || !result || !value){

    return;

}



search.addEventListener(
"input",
()=>{


const text =
search.value
.toLowerCase()
.replace(/\s/g,"");

console.log(
    "検索確認:",
    customers[0]
);

result.innerHTML="";



if(!text){

    return;

}

customers
.filter(customer=>{


const name =
(customer.name || "")
.toLowerCase();


const searchName =
(customer.searchName || "")
.toLowerCase();



return (

name.includes(text)

||

searchName.includes(text)

);


})

.slice(0,20)
.forEach(customer=>{


const div =
document.createElement("div");


div.className =
"customer-item";


div.textContent =
customer.name;



div.addEventListener(
"click",
()=>{

    search.value =
    customer.name;

    value.value =
    customer.name;

    address.textContent =
    customer.address1 || "";

    tel.textContent =
    customer.tel || "";

    console.log(
    "選択した顧客:",
    customer
    );

    result.innerHTML="";

});


result.appendChild(div);



});



});



}

// 訪問追加

addTaskBtn.addEventListener(
"click",
()=>{


const count =
document.querySelectorAll(".task-card").length + 1;



const div =
document.createElement("div");


div.className =
"task-card";



div.innerHTML = `

<h2>
訪問${count}
</h2>


<label>
顧客
</label>


<input
type="text"
class="customer-search"
placeholder="顧客名を検索">


<select
class="customer-select">

<option value="">
顧客を選択してください
</option>

</select>



<label>
開始時間
</label>


<input
type="time"
class="start-time">



<label>
終了時間
</label>


<input
type="time"
class="end-time">



<label>
作業分類
</label>


<select
class="work">


<option value="">
選択してください
</option>

<option>点検</option>
<option>修理</option>
<option>設置</option>
<option>社内業務</option>
<option>その他</option>


</select>



<label>
作業内容
</label>


<textarea
class="content"
placeholder="作業した内容を入力してください">
</textarea>


`;


tasksArea.appendChild(div);



setupCustomerSearch(div);



});









// 保存

saveBtn.addEventListener(
"click",
async()=>{


if(!nameInput.value){

alert("名前を選択してください");

return;

}




const taskCards =
document.querySelectorAll(".task-card");



let tasks = [];


taskCards.forEach(card=>{


const customerInput =
card.querySelector(".customer-value");


const customer =
customerInput ? customerInput.value : "";



const startTimeInput =
card.querySelector(".start-time");

const startTime =
startTimeInput ? startTimeInput.value : "";



const endTimeInput =
card.querySelector(".end-time");

const endTime =
endTimeInput ? endTimeInput.value : "";



const workInput =
card.querySelector(".work");

const work =
workInput ? workInput.value : "";



const contentInput =
card.querySelector(".content");

const content =
contentInput ? contentInput.value : "";



if(
!customer &&
!work &&
!content
){

return;

}


tasks.push({

customer:customer,

startTime:startTime,

endTime:endTime,

work:work,

content:content

});


});



if(tasks.length === 0){

alert("作業内容を入力してください");

return;

}





await addDoc(

collection(db,"reports"),

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




alert("保存しました😊");



// 入力リセット

location.reload();



});

async function start(){

    await loadCustomers();


    setTimeout(()=>{


        document
        .querySelectorAll(".task-card")
        .forEach(card=>{

            setupCustomerSearch(card);

        });


        console.log(
        "検索設定完了",
        document.querySelectorAll(".task-card").length
        );


    },500);


}


start();