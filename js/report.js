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
        .forEach(e=>e.selectedIndex=0);



    }catch(error){


        console.error(error);

        alert("保存失敗");


    }


});





// 顧客読み込み

async function loadCustomers(){


    const customerSelects =
    document.querySelectorAll(".customer");



    const snapshot = await getDocs(
        collection(db,"customers")
    );



    customerSelects.forEach((select)=>{


        snapshot.forEach((doc)=>{


            const data = doc.data();


            const option =
            document.createElement("option");


            option.value = data.name;


            option.textContent =
            data.name;


            select.appendChild(option);


        });


    });


}



loadCustomers();





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

<select class="customer">

<option>選択してください</option>

</select>


<label>開始時間</label>

<input type="time" class="startTime">


<label>終了時間</label>

<input type="time" class="endTime">


<label>作業内容</label>

<textarea class="work"></textarea>

`;



    tasks.appendChild(div);



    // 追加した作業にも顧客を入れる

    loadCustomers();



});