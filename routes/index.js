const express = require('express');
const firebase = require('../util/firebase');
// const customAlphabet = require('nanoid').customAlphabet;
// const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

const router = express.Router();
const db = firebase.firestore();

router.get('/', async (req, res, next) => {
  /* if (req.app.settings.env == 'development') {
    await doLogin('admin@mailinator.com', '123456');
  } */

  if (firebase.auth().currentUser == null) {
    res.redirect('/login');
  } else {
    res.redirect('/dashboard');
  }
});

router.get('/login', function (req, res, next) {
  const data = {
    title: 'Login',
    url: {
      login: '/login'
    }
  };
  res.render('auth/login', { data: data, layout: 'blank' });
});

router.post('/login', async (req, res) => {
  try {
    if (await doLogin(req.body.username, req.body.password)) {
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/login');
  }
});

const doLogin = async (username, password) => {
  try {
    let loggedInUser = await firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .catch((error) => {
        console.log(error);
        return false;
      });

    loggedInUser = loggedInUser.user;

    const ref = db.collection('users').doc(loggedInUser.uid);
    let userData = await ref.get();
    userData = userData.data();

    if (userData.type !== 'admin') {
      await firebase.auth().signOut();
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

router.get('/logout', function (req, res, next) {
  firebase
    .auth()
    .signOut()
    .then(function () {
      res.redirect('/');
    })
    .catch(function (error) {
      res.redirect('/');
    });
});

/* router.get('/createKTP', async (req, res, next) => {
  const data = {
    admin_approval: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    data_ktp: {
      agama: 'Islam',
      jenis_kelamin: 'L',
      nama: 'Nama 4',
      nik: '3404052223210001',
      pekerjaan: 'Karyawan Swasta',
      status_perkawinan: 'Kawin',
      tanggal_lahir: '1990-10-09',
      tempat_lahir: 'Kota A'
    },
    status: 0,
    type: 'ktp_update',
    temp: true,
    user: {
      fullName: 'Delta Setiyarini',
      id: '5zpBguIc50NILvaU9LjaKpBKMPE3'
    }
  };
  let result = await db.collection('requests').add(data);
  result = await result.get();
  console.log(result.data());
  res
    .status(200)
    .send('Added document with ID: ' + JSON.stringify(result.data()));
});

router.get('/updateList', async (req, res, next) => {
  const ref = db.collection('requests');
  const requestList = await ref.get().then((querySnapshot) => {
    querySnapshot.forEach(function (doc) {
      console.log(doc.ref);
      doc.ref.update({ code: 'doc-' + nanoid() });
    });
  });

  res.status(200).send('Success');
}); */

/* router.get('/createUser', async (req, res, next) => {
  try {
    const user = {
      email: 'delta@gmail.com',
      password: '123456',
      fullName: 'Delta Setiyarini',
      type: 'user'
    };
    let createdUser = await firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password);
    createdUser = createdUser.user;
    const newUser = {
      fullName: user.fullName,
      type: user.type
    };
    const result = await db
      .collection('users')
      .doc(createdUser.uid)
      .set(newUser);
    console.log(result);
    res.send('success: ' + JSON.stringify(result));
  } catch (error) {
    console.log(error);
    res.send('error: ' + error.message);
  }
}); */

module.exports = router;
