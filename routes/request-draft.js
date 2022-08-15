const express = require('express');
const authMiddleware = require('../middleware/auth');
const firebase = require('../util/firebase');
const format = require('date-fns/format');
const indoLocale = require('date-fns/locale/id');

const router = express.Router();
const db = firebase.firestore();

router.use(authMiddleware.isAuthenticated);

router.get('/', async (req, res, next) => {
  let defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  defaultStart.setHours(0, 0, 0, 0);
  start_date =
    req.query.start == undefined ? defaultStart : new Date(req.query.start);

  end_date = req.query.end == undefined ? new Date() : new Date(req.query.end);
  end_date.setHours(23, 59, 59, 999);
  console.log(start_date, end_date);

  const ref = db.collection('requests');
  const requestList = await ref
    .where('admin_approval', '==', 0)
    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start_date))
    .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(end_date))
    .orderBy('createdAt', 'desc')
    .get();

  let listUnapproved = [];
  requestList.forEach((doc) => {
    const data = doc.data();

    data.createdAt = data.createdAt.toDate();
    data.createdAt_formatted = format(data.createdAt, 'dd MMM yyyy, HH:mm', {
      locale: indoLocale
    });

    if (data.data_ktp != undefined) {
      data.data_ktp.tanggal_lahir_formatted = format(
        new Date(data.data_ktp.tanggal_lahir || null),
        'dd MMM yyyy',
        { locale: indoLocale }
      );
    } else {
      data.anggota_count = data.data_kk.length;
      data.data_kk.forEach((person) => {
        person.tanggal_lahir_formatted = format(
          new Date(person.tanggal_lahir || null),
          'dd MMM yyyy',
          { locale: indoLocale }
        );
      });
    }
    data.id = doc.id;

    listUnapproved.push(data);
  });

  const data = {
    title: 'Permintaan Masuk',
    filter: {
      start: format(start_date, 'yyyy-MM-dd'),
      end: format(end_date, 'yyyy-MM-dd')
    },
    data: {
      requests: listUnapproved
    },
    url: {
      filter: '/request-draft',
      update_status: '/request-draft/update'
    }
  };
  res.render('request-draft/index', data);
});

router.get('/rejected', async (req, res, next) => {
  let defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  defaultStart.setHours(0, 0, 0, 0);
  start_date =
    req.query.start == undefined ? defaultStart : new Date(req.query.start);

  end_date = req.query.end == undefined ? new Date() : new Date(req.query.end);
  end_date.setHours(23, 59, 59, 999);
  console.log(start_date, end_date);

  const ref = db.collection('requests');
  const requestList = await ref
    .where('admin_approval', '==', 2)
    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start_date))
    .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(end_date))
    .orderBy('createdAt', 'desc')
    .get();

  let listRejected = [];
  requestList.forEach((doc) => {
    const data = doc.data();

    data.createdAt = data.createdAt.toDate();
    data.createdAt_formatted = format(data.createdAt, 'dd MMM yyyy, HH:mm', {
      locale: indoLocale
    });

    if (data.data_ktp != undefined) {
      data.data_ktp.tanggal_lahir_formatted = format(
        new Date(data.data_ktp.tanggal_lahir),
        'dd MMM yyyy',
        { locale: indoLocale }
      );
    } else {
      data.anggota_count = data.data_kk.length;
      data.data_kk.forEach((person) => {
        person.tanggal_lahir_formatted = format(
          new Date(person.tanggal_lahir),
          'dd MMM yyyy',
          { locale: indoLocale }
        );
      });
    }
    data.id = doc.id;

    listRejected.push(data);
  });

  const data = {
    title: 'Permintaan Masuk Ditolak',
    filter: {
      start: format(start_date, 'yyyy-MM-dd'),
      end: format(end_date, 'yyyy-MM-dd')
    },
    data: {
      requests: listRejected
    },
    url: {
      filter: '/request-draft'
    }
  };
  res.render('request-draft/rejected', data);
});

router.post('/update/:status', async (req, res, next) => {
  console.log(req.body, req.params.status);
  const ref = db.collection('requests').doc(req.body.id);
  await ref.update({ admin_approval: parseInt(req.params.status) });

  res.redirect('/request-draft');
});

module.exports = router;
