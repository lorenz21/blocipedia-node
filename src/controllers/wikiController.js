const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const markdown = require("markdown").markdown;

module.exports = {
   index(req, res, next) {
      if(req.user){
        let userWikis = [];
        wikiQueries.getAllWikis((err, wikis) => {
          if(err){
              res.redirect(500, "static/index");
          }
          else{
              wikis.forEach(wiki => {
                if(wiki.private){
                  if(wiki.collaborators){
                    wiki.collaborators.forEach(collaborator => {
                      if(collaborator.userId == req.user.id && wiki.id == collaborator.wikiId || req.user.role == 2 || req.user.id == wiki.userId) {
                        userWikis.push(wiki)
                      }
                    })
                  }
                  else{
                    if(req.user.role == 2 || req.user.id == wiki.userId){
                      userWikis.push(wiki)
                    }
                  } 
                }
                else{
                  userWikis.push(wiki)
                }
              });
              res.render("wikis/index", {userWikis});
          }
        })
      }
      else{
        let userWikis = [];
        wikiQueries.getAllPublicWikis((err, wikis) => {
          if(err){
            res.redirect(500, "static/index");
          }
          else{
            userWikis = wikis;
            res.render("wikis/index", {userWikis});
          }
        })
      }
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
         if(err || wiki == null ) {
            console.log(err);
            res.redirect(404, "/");
         }
         else {

            if(wiki.private){
                for(let i=0; i<=wiki.collaborators.length; i++){
                  if(req.user.role == 1 && wiki.userId == req.user.id || wiki.collaborators[i].userId == req.user.id || req.user.role == 2){
                    let wikiMarkdown = {
                      title: markdown.toHTML(wiki.title),
                      body: markdown.toHTML(wiki.body),
                      private: wiki.private,
                      userId: wiki.userId,
                      id: wiki.id,
                      collaborators: wiki.collaborators[i]
                    };
                    res. render("wikis/show", {wikiMarkdown});
                  }
                  else {
                    res.redirect(404, "/wikis");
                  }
                }
            }
            else {
              let wikiMarkdown = {
                title: markdown.toHTML(wiki.title),
                body: markdown.toHTML(wiki.body),
                private: wiki.private,
                userId: wiki.userId,
                id: wiki.id
              };
              res. render("wikis/show", {wikiMarkdown});
            }
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