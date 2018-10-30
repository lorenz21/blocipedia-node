const Wiki = require("./models").Wiki;
const Collaborator = require("./models").Collaborator;

module.exports = {
   getAllWikis(callback) {
      return Wiki.all({
         include: [{
            model: Collaborator,
            as: "collaborators"
         }]
      })
      .then((wikis) => {
         callback(null, wikis);
      })
      .catch((err) => {
         callback(err);
      });
   },
   getAllPublicWikis(callback) {
      return Wiki.all({
         where: { private: false},
         include: [
            {
               model: Collaborator, 
               as: "collaborators", 
            }
         ],
      })
      .then((wikis) => {
         callback(null, wikis);
      })
      .catch((err) => {
         callback(err);
      });
   },
   getAllPublicWikis(callback) {
      return Wiki.all({
         where: {
            private: false
         }
      })
      .then((wikis) => {
         callback(null, wikis);
      })
      .catch((err) => {
         callback(err);
      });
   },
   addWiki(newWiki, callback) {
      return Wiki.create(newWiki)
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   getWiki(id, callback) {
      return Wiki.findById(id, {
         include: [{
            model: Collaborator,
            as: "collaborators"
         }],
      })
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   deleteWiki(id, callback) {
      return Wiki.destroy({
         where: {id}
      })
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   updateWikiStatus(req, updatedStatus, callback) {
      return Wiki.findById(req.params.id)
      .then((wiki) => {
         if(!wiki){
            return callback("Wiki not found");
         }
         return wiki.update({private: updatedStatus}, {fields:['private']})
         .then(() => {
            callback(null, wiki);
         })
         .catch((err) => {
            callback(err);
         });
      })
   },
   updateWikiStatus(req, updatedStatus, callback) {
      return Wiki.findById(req.params.id)
      .then((wiki) => {
         if(!wiki){
            return callback("Wiki not found");
         }
         return wiki.update({private: updatedStatus}, {fields:['private']})
         .then(() => {
            callback(null, wiki);
         })
         .catch((err) => {
            callback(err);
         });
      })
   },
   downgradePrivate(req, callback) {
      console.log(req.user.id);
      return Wiki.all()
      .then((wikis) => {
         wikis.forEach((wiki) => {
            if(wiki.userId == req.user.id && wiki.private == true){
               wiki.update({
                  private: false
               })
            }
         });
      })
      .catch((err) => {
         callback(err);
      });
   }
}