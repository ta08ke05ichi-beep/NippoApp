import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// 今日の日付を自動入力

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2,"0");
const day = String(today.getDate()).padStart(2,"0");


document.getElementById("date").value =
`${year}-${month}-${day}`;




// 保存

document.getElementById("saveBtn")
.addEventListener("click", async()=>{


    const taskElements =
    document.querySelectorAll(".task");


    const tasks = [];


    taskElements.forEach((task)=>{


        tasks.push({

            customer:
task.querySelector(".customer").value,


            startTime:
            task.querySelector(".startTime").value,


            endTime:
            task.querySelector(".endTime").value,


            workContent:
task.querySelector(".work").value

        });


    });



    const report = {

    employee:
    document.getElementById("name").value,


    date:
    document.getElementById("date").value,


    tasks: tasks,


    createdAt:
    new Date()

};



    try{


        await addDoc(
            collection(db,"reports"),
            report
        );


        alert("保存しました");


        // 作業内容リセット

        document.querySelectorAll(".work")
        .forEach(e=>e.value="");


        document.querySelectorAll(".startTime")
        .forEach(e=>e.value="");


        document.querySelectorAll(".endTime")
        .forEach(e=>e.value="");


        document.querySelectorAll(".customer")
.forEach(e=>e.value="");


    }catch(error){


        console.error(error);

        alert("保存失敗");


    }


});

// 顧客検索

let customers = [];


async function loadCustomers(){


const snapshot =
await getDocs(
collection(db,"customers")
);


customers = [];


snapshot.forEach((doc)=>{

customers.push(doc.data());

});


}


loadCustomers();


setupCustomerSearch(
document.querySelector(".task")
);



function setupCustomerSearch(task){


const search =
task.querySelector(".customerSearch");


const result =
task.querySelector(".customerResult");


const hidden =
task.querySelector(".customer");



search.addEventListener(
"input",
()=>{


const text =
search.value.toLowerCase();


result.innerHTML="";


customers
.filter(c =>
c.name.toLowerCase().includes(text)
)
.slice(0,10)
.forEach(c=>{


const div =
document.createElement("div");


div.textContent =
"🏢 " + c.name;


div.onclick = ()=>{


search.value =
c.name;


hidden.value =
c.name;


result.innerHTML="";


};


result.appendChild(div);


});


});


}

// 作業追加

let taskCount = 1;



document.getElementById("addTaskBtn")
.addEventListener("click",()=>{


    taskCount++;


    const tasks =
    document.getElementById("tasks");



    const div =
    document.createElement("div");



    div.className =
    "card task";



    div.innerHTML = `

<h3>作業${taskCount}</h3>


<label>顧客</label>

<input 
class="customerSearch"
placeholder="顧客名を入力してください">

<div class="customerResult"></div>

<input 
type="hidden"
class="customer">


<label>開始時間</label>

<input type="time" class="startTime">


<label>終了時間</label>

<input type="time" class="endTime">


<label>作業内容</label>

<textarea class="work"></textarea>

`;



    tasks.appendChild(div);

setupCustomerSearch(div);

    // 追加した作業にも顧客を入れる

    loadCustomers();



});