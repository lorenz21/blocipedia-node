const userQueries = require("../db/queries.users");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');

module.exports = {
  signUp(req, res, next){
     res.render("users/signup");
  },
  payment(req, res, next) {
    res.render("users/payment");
  },
  create(req, res, next){
    let newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err){
        req.flash("error", err);
        res.redirect("/users/signup");
      }
      else{
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: user.email,
            from: 'support@blocipedia.com',
            subject: 'Welcome to Blocipedia!',
            text: `Welcome to Blocipedia ${user.name}!`,
            html: `<strong>Welcome to Blocipedia ${user.name}!</strong>`,
          };
          sgMail.send(msg);
          res.redirect("/");
        })
      }
    });
  },
  signInForm(req, res, next){
    res.render("users/signin");
  },
  signIn(req, res, next){
    passport.authenticate("local")(req, res, function() {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("/users/signin");
      }
      else{
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },
  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out");
    res.redirect("/");
  },
  show(req, res, next){
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user === null){
        req.flash("notice", "No user found with that ID.");
        res.redirect("/");
      } 
      else {
        res.render("users/show", {user});
      }
    });
  },
  updatePremium(req, res, next){
    // User role (1) = Standard User
    var stripe = require("stripe")("sk_test_BzZRi566CbNn6JzHnpvYbvDO");

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    const charge = stripe.charges.create({
      amount: 999,
      currency: 'usd',
      description: 'Example charge',
      source: token,
    });

    userQueries.updateUserRole(req.params.id, 1, (err, user) => {
      if(err || user == null) {
        req.flash("notice", "No user found with that ID.");
        res.redirect(404, `/users/${req.params.id}`);
      }
      else {
        req.flash("notice", "Welcome, premium member!");
        res.redirect(`/users/${req.params.id}`);
      }
    })
  },
  updateStandard(req, res, next){
    // User role (0) = Standard User
    userQueries.updateUserRole(req.params.id, 0, (err, user) => {
      if(err || user == null) {
        res.redirect(404, `/users/${req.params.id}`);
      }
      else {
        req.flash("notice", "Your account has been downgraded to a standard account");
        res.redirect(`/users/${req.params.id}`);
      }
    })
  },
}