const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/users", controller.getAll);
  app.get("/api/users/:id", controller.getOne);
  app.post("/api/users", controller.register);
  app.put("/api/users/:id", controller.update);
  app.delete("/api/users/:id", controller.delete);
  app.get("/api/profile", controller.getProfile);
  app.put("/api/change-password", controller.changePassword);

};
