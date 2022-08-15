const express = require('express');
const authMiddleware = require('../middleware/auth');
const firebase = require('../util/firebase');
const format = require('date-fns/format');
const parseISO = require('date-fns/parseISO');
const eachDayOfInterval = require('date-fns/eachDayOfInterval');
const sub = require('date-fns/sub');
const indoLocale = require('date-fns/locale/id');

const router = express.Router();
const db = firebase.firestore();

router.use(authMiddleware.isAuthenticated);

router.get('/', async (req, res, next) => {
  const ref = db.collection('requests');
  const requestList = await ref.orderBy('createdAt', 'desc').get();

  const date = {
    start: sub(new Date(), { days: 6 }),
    end: new Date()
  };

  const dateList = eachDayOfInterval({
    start: sub(new Date(), { days: 6 }),
    end: new Date()
  }).map((date) => {
    return format(date, 'yyyy-MM-dd');
  });

  const requestDateArray = dateList.map((date) => {
    dateFormatted = format(parseISO(date), 'dd MMM yyyy', {
      locale: indoLocale
    });
    return {
      date: date,
      dateFormatted,
      sum: 0
    };
  });
  const requestAcceptedDateArray = requestDateArray.map((a) =>
    Object.assign({}, a)
  );

  let listRequests = [];
  let countRequestToday = 0;
  let countRequestDenied = 0;
  let countKTP = 0;
  let countKK = 0;
  requestList.forEach((doc) => {
    const data = doc.data();
    data.createdAt = data.createdAt.toDate();

    const dataDate = format(data.createdAt, 'yyyy-MM-dd');
    if (dateList.includes(dataDate) && data.admin_approval == 0) {
      requestDateArray[requestDateArray.findIndex((x) => x.date == dataDate)]
        .sum++;
      countRequestToday++;
    }
    if (dateList.includes(dataDate) && data.admin_approval == 1) {
      requestAcceptedDateArray[
        requestAcceptedDateArray.findIndex((x) => x.date == dataDate)
      ].sum++;
    }
    if (dateList.includes(dataDate) && data.admin_approval == 2) {
      countRequestDenied++;
    }
    if (
      dateList.includes(dataDate) &&
      data.admin_approval == 1 &&
      data.data_ktp != undefined
    ) {
      countKTP++;
    }
    if (
      dateList.includes(dataDate) &&
      data.admin_approval == 1 &&
      data.data_kk != undefined
    ) {
      countKK++;
    }

    listRequests.push(data);
  });

  const data = {
    title: 'Dashboard',
    data: {
      date: {
        start: format(date.start, 'yyyy-MM-dd'),
        end: format(date.end, 'yyyy-MM-dd')
      },
      countRequestToday,
      countRequestDenied,
      countKTP,
      countKK,
      graph: {
        request: {
          label: requestDateArray.map((x) => x.dateFormatted),
          data: requestDateArray.map((x) => x.sum)
        },
        processed: {
          label: requestAcceptedDateArray.map((x) => x.dateFormatted),
          data: requestAcceptedDateArray.map((x) => x.sum)
        }
      }
    },
    url: {
      logout: '/logout'
    }
  };

  res.render('dashboard/index', data);
});

module.exports = router;
