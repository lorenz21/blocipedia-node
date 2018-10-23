const request = require("request");
const base = "http://localhost:3000/wikis/";

const sequelize = require("../../src/db/models/index").sequelize;
const server = require("../../src/server");
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {
  beforeEach((done) => {
    this.wiki;
    this.user;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        name: "Hank McCoy",
        email: "beast@xavier.edu",
        password: "justLikeEveryoneElse"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Mansions of Madness",
          body: "App-assisted horror game inspired by the works of H.P. Lovecraft",
          private: false,
          userId: this.user.id,
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        })
      })
    });

   });

   describe("user performing CRUD actions for Wiki", () => {

      beforeEach((done) => {
         User.create({
            name: "Clarice Ferguson",
            email: "blink@xavier.edu",
            password: "inTheBlinkOfAnEye"
         })
         .then((user) => {
            request.get({         
               url: "http://localhost:3000/auth/fake",
               form: {
                 name: user.name,     
                 userId: user.id,
                 email: user.email
               }
             },
               (err, res, body) => {
                 done();
               }
             );
         })
      });

      describe("GET /wikis", () => {
         it("should respond with all wikis", (done) => {
            request.get(base, (err, res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("Mansions of Madness");
               done();
            });
         });

      });

      describe("GET /wikis/new", () => {
         it("should render a view with a new wiki form", (done) => {
            request.get(`${base}new`, (err, res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("New Wiki");
               done();
            });
         });

      });

      describe("GET /wikis/create", () => {

         it("should create a new wiki and redirect", (done) => {
          const options = {
            url: `${base}create`,
            form: {
              title: "A Fire Inside",
              body: "An american rock band from Ukiah, California",
              userId: this.user.id,
            }
           };

          request.post(options, (err, res, body) => {
            console.log(res.statusMessage);
            Wiki.findOne({where: {title: "A Fire Inside"}})
            .then((wiki) => {
              expect(wiki.title).toBe("A Fire Inside");
              expect(wiki.body).toBe("An american rock band from Ukiah, California");
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            }); 
            }
          );

         });

      });

      describe("GET /wikis/:id", () => {
         
         it("should render a view with the selected wiki", (done) => {
            request.get(`${base}${this.wiki.id}`, (err,res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("Mansions of Madness");
               done();
            });
         });

      });

      describe("POST /wikis/:id/destroy", () => {

         it("should delete the wiki with the associated ID", (done) => {
            Wiki.all()
            .then((wikis) => {
               const wikiCountBeforeDelete = wikis.length;

               expect(wikiCountBeforeDelete).toBe(1);

               request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                  Wiki.all()
                  .then((wikis) => {
                     expect(err).toBeNull();
                     expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                     done();
                  })
               });
            })
         });

      });

      describe("GET /wikis/:id/edit", () => {
         
         it("should render a view with an edit wiki form", (done) => {
            request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
              expect(err).toBeNull();
              expect(body).toContain("Edit Wiki");
              expect(body).toContain("Mansions of Madness");
              done();
            })
         });

      });

      describe("POST /wikis/:id/update", () => {

        it("should update the wiki with the given values", (done) => {
          request.post({
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "The Mansions of Madness",
                body: "One of the best tabletop games!",
                userId: this.user.id
              }
          }, (err, res, body) => {
              expect(err).toBeNull();
              Wiki.findOne({
                where: {id:1}
              })
              .then((wiki) => {
                expect(wiki.title).toBe("The Mansions of Madness");
                done();
              });
          });
        });

        it("should allow other users to update the wiki with the given values", (done) => {
          User.create({
            name: "Alex Summers",
            email: "havok@xavier.edu",
            password: "reekingHavok"
          })
          .then((user) => {
            request.post({
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "The Mansions of Madness!",
                body: "The best tabletop games!",
                userId: user.id
              }
            }, (err, res, body) => {
              expect(err).toBeNull();
              expect(user.id).toBe(3);
              Wiki.findOne({
                where: {id:1}
              })
              .then((wiki) => {
                expect(wiki.userId).toBe(3);
                expect(wiki.title).toBe("The Mansions of Madness!");
                done();
              });
            });
          })
        });

      });

   });

});