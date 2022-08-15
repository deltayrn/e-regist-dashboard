const firebase = require('../util/firebase');
const db = firebase.firestore();

module.exports = {
  isAuthenticated: async function (req, res, next) {
    try {
      var user = firebase.auth().currentUser;

      const ref = db.collection('users').doc(user.uid);
      let userData = await ref.get();
      user.detail = userData.data();

      if (user !== null) {
        req.user = user;
        res.locals.req = await req;
        res.locals.currentUrl = req.originalUrl;

        next();
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      res.redirect('/login');
    }
  }
};
