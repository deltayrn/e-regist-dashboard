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
    .where('type', 'in', ['ktp_new', 'ktp_update'])
    .where('admin_approval', '==', 1)
    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start_date))
    .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(end_date))
    .orderBy('createdAt', 'desc')
    .get();

  let listKtp = [];
  requestList.forEach((doc) => {
    const data = doc.data();

    data.createdAt = data.createdAt.toDate();
    data.createdAt_formatted = format(data.createdAt, 'dd MMM yyyy, HH:mm', {
      locale: indoLocale
    });
    data.data_ktp.tanggal_lahir_formatted = format(
      new Date(data.data_ktp.tanggal_lahir),
      'dd MMM yyyy',
      { locale: indoLocale }
    );
    data.id = doc.id;

    listKtp.push(data);
  });

  const data = {
    title: 'Request KTP',
    filter: {
      start: format(start_date, 'yyyy-MM-dd'),
      end: format(end_date, 'yyyy-MM-dd')
    },
    data: {
      requests: listKtp
    },
    url: {
      filter: '/request-ktp',
      update_status: '/request-ktp/update'
    }
  };
  res.render('request-ktp/index', data);
});

router.post('/update', async (req, res, next) => {
  console.log(req.body);
  const ref = db.collection('requests').doc(req.body.id);
  await ref.update({ status: parseInt(req.body.status) });

  res.redirect('/request-ktp');
});

module.exports = router;
