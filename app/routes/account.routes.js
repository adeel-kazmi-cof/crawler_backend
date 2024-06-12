const { authJwt } = require("../middleware");
const controller = require("../controllers/account.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/accounts", controller.getAll);
  app.get("/api/accounts/:id", controller.getOne);
  app.post("/api/accounts", controller.register);
  app.put("/api/accounts/:id", controller.update);
  app.delete("/api/accounts/:id", controller.delete);
};
