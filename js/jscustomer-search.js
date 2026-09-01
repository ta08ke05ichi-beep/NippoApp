```js
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const search = document.getElementById("customerSearch");
const list = document.getElementById("customerSearchList");

let customers = [];


async function loadCustomers() {

    const snap = await getDocs(
        collection(db, "customers")
    );

    customers = [];

    snap.forEach(docSnap => {

        const data = docSnap.data();

        customers.push({
            id: docSnap.id,
            name: data.name || ""
        });

    });

    showCustomers(customers);
}


function showCustomers(data) {

    list.innerHTML = "";

    data.forEach(customer => {

        const div = document.createElement("div");

        div.className = "customer-item";

        div.textContent = "🏢 " + customer.name;

        div.addEventListener("click", function () {

            location.href =
                "report.html?customer=" +
                encodeURIComponent(customer.name);

        });

        list.appendChild(div);

    });
}


search.addEventListener("input", function () {

    const text = search.value.trim();

    const result = customers.filter(function (customer) {

        return customer.name.includes(text);

    });

    showCustomers(result);

});


loadCustomers();
```
