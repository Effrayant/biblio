require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db")

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

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

function validationOeuvrePatch(body) { //fonction de validation des champs pour la route PATCH
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

app.get("/oeuvres", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM oeuvres ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

app.get("/oeuvres/:id", async (req, res) => {
  const id = Number(req.params.id);

  const result = await pool.query("SELECT * FROM oeuvres WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Oeuvre non trouvée" });
  }

  res.json(result.rows[0]);
});

// --------------------
// POST
// --------------------

app.post("/oeuvres", async (req, res) => {
  const error = validationOeuvrePost(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const { titre, type, statut, note, progression, commentaire } = req.body;

    const result = await pool.query(
      `INSERT INTO oeuvres
       (titre, type, statut, note, progression, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        titre,
        type,
        statut,
        note,
        progression ?? null,
        commentaire ?? null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// --------------------
// DELETE
// --------------------

app.delete("/oeuvres/:id", async (req, res) => {
  const id = Number(req.params.id);

  try{
      const result = await pool.query(`DELETE FROM oeuvres WHERE id = $1 RETURNING *`, [id]);

      if (result.rows.length === 0){
        return res.status(404).json({error: "Oeuvre non trouvée"});
      }

      res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// --------------------
// PUT (remplacement complet)
// --------------------

app.put("/oeuvres/:id", async (req, res) => {
  const id = Number(req.params.id);

  const error = validationOeuvrePut(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const { titre, type, statut, note, progression, commentaire } = req.body;

    const result = await pool.query(
      `UPDATE oeuvres
       SET titre = $2, type = $3, statut = $4, note = $5, progression = $6, commentaire = $7
       WHERE id = $1
       RETURNING *`,
      [id, titre, type, statut, note, progression ?? null, commentaire ?? null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// --------------------
// PATCH (remplacement partiel)
// --------------------

app.patch("/oeuvres/:id", async (req, res) => {
  const id = Number(req.params.id);

  const error = validationOeuvrePatch(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in req.body) {
      fields.push(`${key} = $${index + 1}`);
      values.push(req.body[key]);
      index++;
    }

    const query = `
      UPDATE oeuvres
      SET ${fields.join(", ")}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// --------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});