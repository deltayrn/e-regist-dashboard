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
    .where('type', 'in', ['kk_new', 'kk_update'])
    .where('admin_approval', '==', 1)
    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start_date))
    .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(end_date))
    .orderBy('createdAt', 'desc')
    .get();

  let listKK = [];
  requestList.forEach((doc) => {
    const data = doc.data();

    data.createdAt = data.createdAt.toDate();
    data.createdAt_formatted = format(data.createdAt, 'dd MMM yyyy, HH:mm', {
      locale: indoLocale
    });
    data.id = doc.id;
    data.anggota_count = data.data_kk.length;
    data.data_kk.forEach((person) => {
      person.tanggal_lahir_formatted = format(
        new Date(person.tanggal_lahir),
        'dd MMM yyyy',
        { locale: indoLocale }
      );
    });

    listKK.push(data);
  });

  const data = {
    title: 'Request KK',
    filter: {
      start: format(start_date, 'yyyy-MM-dd'),
      end: format(end_date, 'yyyy-MM-dd')
    },
    data: {
      requests: listKK
    },
    url: {
      filter: '/request-kk',
      update_status: '/request-kk/update'
    }
  };
  res.render('request-kk/index', data);
});

router.post('/update', async (req, res, next) => {
  console.log(req.body);
  const ref = db.collection('requests').doc(req.body.id);
  await ref.update({ status: parseInt(req.body.status) });

  res.redirect('/request-kk');
});

module.exports = router;
