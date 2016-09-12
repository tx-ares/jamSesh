import Firebase from 'firebase'

  var config = {
    apiKey: "AIzaSyAsmzELQ-MI8oWOaHg0j_sDPjP0pO-LCOk",
    authDomain: "jamcamp.firebaseapp.com",
    databaseURL: "https://jamcamp.firebaseio.com",
    storageBucket: "firebase-jamcamp.appspot.com",
  };
  var ref = Firebase.initializeApp(config);


export default ref