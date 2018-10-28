const Collaborator = require("./models").Collaborator;
const User = require("./models").User;

module.exports = {
   getAllCollaborators(callback) {
      return User.all(
         {
            include: [{
               model: Collaborator,
               as: "collaborators"
            }]
         }
      )
      .then((users) => {

         callback(null, users);
      })
      .catch((err) => {
         callback(err);
      });
   },
   addCollaborator(req, collaboratorInfo, callback) {
      return Collaborator.findOne({
         where: {
            wikiId: req.params.wikiId,
            userId: req.body.id
         }
      })
      .then((collaborator) => {
         console.log(req.body.id);
         if(!collaborator){
            // console.log(`Wiki Id: ${req.params.wikiId} \n User Id: ${req}`);
            Collaborator.create({
               wikiId: req.params.wikiId,
               userId: req.body.id
            })
            .then((collaborator) => {
               callback(null, collaborator);
            })
            .catch((err) => {
               callback(err);
            });
         }
         else{
            console.log("Reached the error");
            callback("error", "Collaborator already exist for this wiki");
         }
      })
   },
   removeCollaborator(req, collaboratorInfo, callback) {
      return Collaborator.findOne({
         where: {
            wikiId: req.params.wikiId,
            userId: req.body.id
         }
      })
      .then((collaborator) => {
         console.log(req.body.id);
         if(collaborator){
            console.log(collaborator.id);
            Collaborator.destroy({
               where: {
                  id: collaborator.id
               }
            })
            .then((collaborator) => {
               callback(null, collaborator);
            })
            .catch((err) => {
               callback(err);
            });
         }
         else{
            console.log("Reached the error");
            callback("error", "Collaborator already exist for this wiki");
         }
      })
   },
}