const { response } = require("express");

//database  creating new DB
let db;
const request = indexedDB.open("budget", 1 )

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // Creating an Table to set AutoIncrement true
    db.createObject("newData", { autoIncrement : true});
};
request.onsuccess = function(event) {
     //checking if Online
    db = event.target.result;
    //If online Check database??
   if (navigator.onLine) {
       checkDatabase();
   }
};
//console.log error
request.onerror = function(event){
    //console log 
    console.log(event.target.errorCode);
};

//Save data to  the DB
function saveRecord(record) {
    //Create a Transcation with DB
    const transaction = db.transaction(["newData"], "readwrite");
    const store = transaction.objectStore("newData");
    //make sure to add
    store.add(record);
}
//checking database
function checkDatabase() {
// open a transcation
const transaction = db.transaction(["newData"], "readwrite");
const store = transaction.objectStore("newData");
const getAll = store.getAll();
//get all call
getAll.onsuccess =  function(){
    if (getAll.result.length > 0){
        fetch("/api/transaction",{
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers:{
                Accept: "application/json, text/plain, */* ",
                "Content-Type": "application/json",  
            },
        }).then(response => response.json())
        .then((data) => {
            const transaction = db.transaction(["newData"], "readwrite");
            const store = transaction.objectStore("newData")
            //Clears all 
            store.clear();
        });
    }
};
}
//listening to come back online
window.addEventListener("online", checkDatabase);