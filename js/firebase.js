  const firebaseConfig = {
    apiKey: "AIzaSyDZuB8s_nJTsW-wtqAUy_e-H0-JBQvMZLM",
    authDomain: "nippoapp-dd004.firebaseapp.com",
    databaseURL: "https://nippoapp-dd004-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nippoapp-dd004",
    storageBucket: "nippoapp-dd004.firebasestorage.app",
    messagingSenderId: "551664893416",
    appId: "1:551664893416:web:5aadad5f42c4d5be3a385d"
  };

  import { initializeApp } from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);


export { db };