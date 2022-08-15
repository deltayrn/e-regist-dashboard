const firebase = require('firebase');
require('firebase/auth');
require('firebase/firestore');

const config = {
  apiKey: 'AIzaSyCMARdFQjl2x7hbtwFvogB14cvFncTaoW8',
  authDomain: 'delta-eregist.firebaseapp.com',
  databaseURL: 'https://delta-eregist.firebaseio.com',
  projectId: 'delta-eregist',
  storageBucket: 'delta-eregist.appspot.com',
  messagingSenderId: '410361002668',
  appId: '1:410361002668:web:bbd4304143e20d965cfd09',
  measurementId: 'G-8JCX5842TJ'
};

firebase.initializeApp(config);

// export const auth = firebase.auth;
// export default firebase;
module.exports = firebase;
