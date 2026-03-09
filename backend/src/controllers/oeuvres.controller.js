const pool = require("../db"); // Import de la connexion à la base PostgreSQL
const validator = require("../validators/oeuvres.validator");

// Remplace les chaînes vide par null (plus pratique pour la base)
function clean(v) {
  return v?.trim() === "" ? null : v;
}

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM oeuvres ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};

exports.getOne = async (req, res) => {
  const id = req.id;

  try {
    const result = await pool.query(
      "SELECT * FROM oeuvres WHERE id = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};

// Route POST //
exports.create = async (req, res) => {
  try {
    let { titre, type, statut, note, progression, commentaire } = req.body;

    titre = clean(titre);
    type = clean(type);
    statut = clean(statut);
    progression = clean(progression);
    commentaire = clean(commentaire);

    if (titre === null || type === null || statut === null) {
      return res.status(400).json({
        error: "titre, type et statut ne peuvent pas être vides ou null",
      });
    }

    const result = await pool.query(
      `INSERT INTO oeuvres
       (titre, type, statut, note, progression, commentaire)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [titre, type, statut, note, progression, commentaire]
    );

    res.status(201).json(result.rows[0]); // rows[0] -> premier resultat de la query
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};

// Route DELETE //
exports.remove = async (req, res) => {
  const id = req.id;

  try {
    const result = await pool.query(
      "DELETE FROM oeuvres WHERE id=$1 RETURNING *",
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Oeuvre non trouvée" });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};

// Route PUT (remplacement complet) //
exports.replace = async (req, res) => {
  const id = req.id;

  try {
    let { titre, type, statut, note, progression, commentaire } = req.body;

    titre = clean(titre);
    type = clean(type);
    statut = clean(statut);
    progression = clean(progression);
    commentaire = clean(commentaire);

    if (titre === null || type === null || statut === null) {
      return res.status(400).json({
        error: "titre, type et statut ne peuvent pas être vides ou null",
      });
    }

    const result = await pool.query(
      `UPDATE oeuvres
       SET titre=$2,type=$3,statut=$4,
           note=$5,progression=$6,commentaire=$7
       WHERE id=$1 RETURNING *`,
      [id, titre, type, statut, note, progression, commentaire]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Oeuvre non trouvée" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};

// Route PATCH (modification partielle)
exports.patch = async (req, res) => {
  const id = req.id;

  try {
    const textFields = ["titre", "type", "statut", "progression", "commentaire"];

    // Nettoyage des champs texte présents dans le body
    for (const field of textFields) {
      if (field in req.body) {
        req.body[field] = clean(req.body[field]);
      }
    }

    // Vérifie que le body n'est pas vide
    const updates = Object.entries(req.body);
    if (updates.length === 0) {
      return res.status(400).json({ error: "Corps de requête vide" });
    }

    // Vérifie que l'oeuvre existe
    const current = await pool.query(
      "SELECT * FROM oeuvres WHERE id = $1",
      [id]
    );

    if (!current.rows.length) {
      return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    const oeuvreFinale = {
      ...current.rows[0],
      ...Object.fromEntries(updates)  // fusionne l'état actuel + le patch
    };

    const errCoherence = validator.validationOeuvrePatchCoherence(oeuvreFinale);
    if (errCoherence) return res.status(400).json({ error: errCoherence });

    // UPDATE dynamique à partir des champs envoyés
    const fields = updates.map(([key], i) => `${key} = $${i + 2}`);
    const values = updates.map(([, value]) => value);

    const result = await pool.query(
      `UPDATE oeuvres
       SET ${fields.join(", ")}
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};