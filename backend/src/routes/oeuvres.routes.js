const express = require("express");
const router = express.Router();     // Routeur pour regrouper les routes (c'est dans le nom...)

// Import des fonctions contrôleurs / validation et le middleware
const controller = require("../controllers/oeuvres.controller");
const validator = require("../validators/oeuvres.validator");
const validateId = require("../middleware/validateId.js");

router.get("/", controller.getAll); // Appelle directement le contrôleur 
router.get("/:id", validateId, controller.getOne); // Passe d'abord par le middleware pour valider l'id

router.post("/", (req, res, next) => {
  const error = validator.validationOeuvrePost(req.body);
  if (error) return res.status(400).json({ error });
  next();
}, controller.create);

router.delete("/:id", validateId, controller.remove);

router.put("/:id", validateId, (req, res, next) => {
  const error = validator.validationOeuvrePut(req.body);
  if (error) return res.status(400).json({ error });
  next();
}, controller.replace);

router.patch("/:id", validateId, (req, res, next) => {
  const error = validator.validationOeuvrePatch(req.body);
  if (error) return res.status(400).json({ error });
  next();
}, controller.patch);

module.exports = router; // Rend le routeur utilisable par server.js