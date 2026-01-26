const express = require("express");

const app = express();
const PORT = 3000;
app.use(express.json());

const TYPES_AUTORISES = ["Film", "Serie", "Jeu", "Manga", "Manhwa", "Webcomic", "Video"];

const STATUTS_AUTORISES = ["A consommer", "En cours", "Terminé", "Abandonné", "Sortie prochaine"];

// --------------------
// Données en mémoire
// --------------------

let oeuvres = [
        {id: 1, titre: "Dragon", type: "Film", statut: "Terminé", note: 10, progression: null, commentaire: null},
        {id: 2, titre: "Strangers Things", type: "Serie", statut: "Terminé", note: 9.5, progression: "S5E9", commentaire: null},
        {id: 3, titre: "Total War Warhammer", type: "Jeu", statut: "Terminé", note: 9.5, progression: "100%", commentaire: null}
];

function validationOeuvrePut(body) { //fonction de validation des champs pour la route PUT
  const CHAMPS_AUTORISES = ["titre", "type", "statut", "note", "progression", "commentaire"]

  // champs interdits
  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key)) {
      return "Champ non autorisé trouvé";
    }
  }

   // titre (obligatoire)
  if (typeof body.titre !== "string" || body.titre.trim().length === 0) {
    return "Titre invalide";
  }

  // type (obligatoire)
  if (typeof body.type !== "string" || !TYPES_AUTORISES.includes(body.type)) {
    return "Type invalide";
  }

  // statut (obligatoire)
  if (typeof body.statut !== "string" || !STATUTS_AUTORISES.includes(body.statut)) {
    return "Statut invalide";
  }

  // note (obligatoire)
  if (typeof body.note !== "number" || body.note < 0) {
    return "Note invalide";
  }

  // progression (optionnelle)
  if ("progression" in body && body.progression !== null && typeof body.progression !== "string") {
    return "Progression invalide";
  }

  // commentaire (optionnel)
  if ("commentaire" in body && body.commentaire !== null && typeof body.commentaire !== "string") {
    return "Commentaire invalide";
  }

  return null; // tout est OK
}

function validationOeuvrePost(body) { //fonction de validation des champs pour la route POST
  const CHAMPS_AUTORISES = ["titre", "type", "statut", "note", "progression", "commentaire"]

  // body vide
  if (Object.keys(body).length === 0) {
    return "Corps de requête vide";
  }

  // champs interdits
  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key)) {
      return "Champ non autorisé trouvé";
    }
  }

   // titre (obligatoire)
  if (typeof body.titre !== "string" || body.titre.trim().length === 0) {
    return "Titre invalide";
  }

  // type (obligatoire)
  if (typeof body.type !== "string" || !TYPES_AUTORISES.includes(body.type)) {
    return "Type invalide";
  }

  // statut (obligatoire)
  if (typeof body.statut !== "string" || !STATUTS_AUTORISES.includes(body.statut)) {
    return "Statut invalide";
  }

  // note (obligatoire)
  if (typeof body.note !== "number" || body.note < 0) {
    return "Note invalide";
  }

  // progression (optionnelle)
  if ("progression" in body && body.progression !== null && typeof body.progression !== "string") {
    return "Progression invalide";
  }

  // commentaire (optionnel)
  if ("commentaire" in body && body.commentaire !== null && typeof body.commentaire !== "string") {
    return "Commentaire invalide";
  }

  return null; // tout est OK
}

function validattionOeuvrePatch(body) { //fonction de validation des champs pour la route PATCH
  const CHAMPS_AUTORISES = ["statut", "note", "progression", "commentaire"];

  // body vide
  if (Object.keys(body).length === 0) {
    return "Corps de requête vide";
  }

  // champs interdits
  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key)) {
      return "Champ non autorisé trouvé";
    }
  }

  // validation des valeurs
  if ("statut" in body && !STATUTS_AUTORISES.includes(body.statut)) {
    return "Statut invalide";
  }

  if ("note" in body) {
    if (typeof body.note !== "number" || body.note < 0) {
      return "Note invalide";
    }
  }

  if ("progression" in body) {
    if (body.progression !== null && typeof body.progression !== "string") {
      return "Progression invalide";
    }
  }

  if ("commentaire" in body) {
    if (body.commentaire !== null && typeof body.commentaire !== "string") {
      return "Commentaire invalide";
    }
  }

  return null; // tout est OK
}

// --------------------
// Routes de base 
// --------------------

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --------------------
// GET
// --------------------

app.get("/oeuvres", (req, res) => {
  res.json(oeuvres);
});

app.get("/oeuvres/:id", (req, res) => {
  const id = Number(req.params.id);
  const oeuvre = oeuvres.find(o => o.id === id);

  if (!oeuvre) {
    return res.status(404).json({ error: "Oeuvre non trouvée" });
  }

  res.json(oeuvre);
});

// --------------------
// POST
// --------------------

app.post("/oeuvres", (req, res) => {
  const error = validationOeuvrePost(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const nouvelleOeuvre = {
    id: oeuvres.length + 1,
    titre: req.body.titre,
    type: req.body.type,
    statut: req.body.statut,
    note: req.body.note,
    progression: req.body.progression ?? null,
    commentaire: req.body.commentaire ?? null
  };

  oeuvres.push(nouvelleOeuvre);
  return res.status(201).json(nouvelleOeuvre);
});

// --------------------
// DELETE
// --------------------

app.delete("/oeuvres/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = oeuvres.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Oeuvre non trouvée" });
  }

  oeuvres.splice(index, 1);
  res.status(204).send();
});

// --------------------
// PUT (remplacement complet)
// --------------------

app.put("/oeuvres/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = oeuvres.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Oeuvre non trouvée" });
  }

  const oeuvreModifiee = {
    id,
    titre: req.body.titre,
    type: req.body.type,
    statut: req.body.statut,
    note: req.body.note,
    progression: req.body.progression ?? null,
    commentaire: req.body.commentaire ?? null
  };

  oeuvres[index] = oeuvreModifiee;
  res.status(200).json(oeuvreModifiee);
});

// --------------------
// PATCH (remplacement partiel)
// --------------------

app.patch("/oeuvres/:id", (req, res) => {
  const error = validatePatchOeuvre(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = Number(req.params.id);
  const index = oeuvres.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Oeuvre non trouvée" });
  }

  const o = oeuvres[index];

  if ("statut" in req.body) o.statut = req.body.statut;
  if ("note" in req.body) o.note = req.body.note;
  if ("progression" in req.body) o.progression = req.body.progression;
  if ("commentaire" in req.body) o.commentaire = req.body.commentaire;

  return res.status(200).json(o);
});

// --------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});