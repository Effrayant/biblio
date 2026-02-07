// Exporte la fonction / le middleware pour le reste des fichiers
module.exports = function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID invalide"
    });
  }

  req.id = id; // stocke l'id validé dans la requête pour pas recalculer (tout le but de la fonction)
  next(); // Middleware suivant 
};