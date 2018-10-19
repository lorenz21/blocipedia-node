const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {
   
   describe("GET /", () => {

      it("should return code 200 and have Welcome to Blocipedia", (done) => {
         request.get(base, (err, res, body) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toContain("Welcome to Blocipedia");
            done();
         });
      });

   });

   describe("GET /about", () => {

      it("should return status code 200 from /about and have 'About Us' in the body", (done) => {
         request.get(`${base}about`, (err, res, body) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toContain("About Us");
            done();
         });
      });

   });

});