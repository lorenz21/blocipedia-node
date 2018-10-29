const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const markdown = require("markdown").markdown;

module.exports = {
   index(req, res, next) {
      if(req.user){
        if(req.user.role == 1 || req.user.role == 2) {
          wikiQueries.getAllWikis((err, wikis) => {
            if(err){
                res.redirect(500, "static/index");
            }
            else{
                res.render("wikis/index", {wikis});
            }
          })
        }
        else{
          console.log("Made it to public wikis");
          wikiQueries.getAllPublicWikis((err, wikis) => {
            if(err){
              res.redirect(500, "static/index");
            }
            else{
              res.render("wikis/index", {wikis});
            }
          })
        }
      }
      wikiQueries.getAllPublicWikis((err, wikis) => {
        if(err){
          res.redirect(500, "static/index");
        }
        else{
          res.render("wikis/index", {wikis});
        }
      })
      
   },
   new(req, res, next) {
      res.render("wikis/new");
   },
   create(req, res, next) {
      let newWiki = {
         title: req.body.title,
         body: req.body.body,
         userId: req.user.id
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
         if(err) {
            res.redirect(500, "/wikis/new");
         }
         else {
            res.redirect(303, `/wikis/${wiki.id}`);
         }
      });
   },
   show(req, res, next) {
      wikiQueries.getWiki(req.params.id, (err, wiki) => {
        let wikiMarkdown = {
          title: markdown.toHTML(wiki.title),
          body: markdown.toHTML(wiki.body),
          private: wiki.private,
          userId: wiki.userId,
          id: wiki.id
        };
         if(err || wiki == null) {
            res.redirect(404, "/");
         }
         else {
            res. render("wikis/show", {wikiMarkdown});
         }
      });
   },
   destroy(req, res, next) {
      wikiQueries.deleteWiki(req.params.id, (err, wiki) => {
         if(err) {
            res.direct(500, `/wikis/${wiki.id}`);
         }
         else {
            res.redirect(303, "/wikis");
         }
      });
   },
   edit(req, res, next) {
      wikiQueries.getWiki(req.params.id, (err, wiki) => {
         if(err || wiki == null) {
            res.redirect(404, "/");
         }
         else {
            const authorized = new Authorizer(req.user, wiki).edit();
            if(authorized){
               res.render("wikis/edit", {wiki});
            }
            else {
               req.flash("notice", "You are not authorized to do that.");
               res.redirect(`/wikis/${req.params.id}`);
            }
         }
      });
   },
   update(req, res, next) {
      wikiQueries.updateWiki(req, req.body, (err, wiki) => {
         if(err || wiki == null) {
            res.redirect(404, `/wikis/${req.params.id}/edit`);
         }
         else {
            res.redirect(`/wikis/${wiki.id}`);
         }
      });
   },
   makePrivate(req, res, next){
      if(req.user.role == 1 || req.user.role == 2) {
         wikiQueries.updateWikiStatus(req, true, (err, wiki) => {
            if(err || wiki == null) {
              res.redirect(404, `/wikis/${wiki.id}`);
            }
            else {
                const authorized = new Authorizer(req.user, wiki).edit();
                if(authorized){
                   req.flash("notice", "You have made this wiki PRIVATE and only viewable to you and your collaborators");
                   res.redirect(`/wikis/${wiki.id}`);
                }
             } 
    
          })
      }
      else {
         req.flash("notice", "You are not authorized to do that. Upgrage to a premium account to make private wikis");
         res.redirect(`/wikis/${req.params.id}`);
      }
   },
   makePublic(req, res, next){
      if(req.user.role == 1 || req.user.role == 2) {
         wikiQueries.updateWikiStatus(req, false, (err, wiki) => {
            if(err || wiki == null) {
              res.redirect(404, `/wikis/${wiki.id}`);
            }
            else {
                const authorized = new Authorizer(req.user, wiki).edit();
                if(authorized){
                   req.flash("notice", "You have made this wiki PUBLIC and is viewable to anyone");
                   res.redirect(`/wikis/${wiki.id}`);
                }
             } 
    
          })
      }
      else {
         req.flash("notice", "You are not authorized to do that. Upgrage to a premium account to make private wikis");
         res.redirect(`/wikis/${req.params.id}`);
      }
   },
}