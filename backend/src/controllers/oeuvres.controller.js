const db = require("../db");
 
// Remplace les chaînes vides par null (plus propre pour la base)
function clean(v) {
  return v?.trim() === "" ? null : v;
}
 
// GET /oeuvres — retourne toutes les œuvres triées par id
exports.getAll = (req, res) => {
  try {
    const oeuvres = db.prepare("SELECT * FROM oeuvres ORDER BY id").all();
    res.json(oeuvres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};
 
// GET /oeuvres/:id — retourne une œuvre par son id
exports.getOne = (req, res) => {
  try {
    const oeuvre = db.prepare("SELECT * FROM oeuvres WHERE id = ?").get(req.id);
    if (!oeuvre) return res.status(404).json({ error: "Oeuvre non trouvée" });
    res.json(oeuvre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};
 
// POST /oeuvres — ajoute une nouvelle œuvre
exports.create = (req, res) => {
  try {
    let { titre, type, statut, note, progression, commentaire } = req.body;
 
    titre       = clean(titre);
    type        = clean(type);
    statut      = clean(statut);
    progression = clean(progression);
    commentaire = clean(commentaire);
 
    if (!titre || !type || !statut) {
      return res.status(400).json({ error: "titre, type et statut ne peuvent pas être vides ou null" });
    }
 
    const stmt = db.prepare(`
      INSERT INTO oeuvres (titre, type, statut, note, progression, commentaire)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
 
    // lastInsertRowid remplace le RETURNING * de Postgres
    const info = stmt.run(titre, type, statut, note ?? null, progression ?? null, commentaire ?? null);
    const nouvelle = db.prepare("SELECT * FROM oeuvres WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(nouvelle);
  } catch (err) {
    // Violation de la contrainte UNIQUE(titre, type)
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Une œuvre avec ce titre et ce type existe déjà" });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};
 
// DELETE /oeuvres/:id — supprime une œuvre
exports.remove = (req, res) => {
  try {
    // info.changes vaut 0 si aucune ligne n'a été supprimée (id inexistant)
    const info = db.prepare("DELETE FROM oeuvres WHERE id = ?").run(req.id);
    if (info.changes === 0) return res.status(404).json({ error: "Oeuvre non trouvée" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};
 
// PUT /oeuvres/:id — remplacement complet d'une œuvre
exports.replace = (req, res) => {
  try {
    let { titre, type, statut, note, progression, commentaire } = req.body;
 
    titre       = clean(titre);
    type        = clean(type);
    statut      = clean(statut);
    progression = clean(progression);
    commentaire = clean(commentaire);
 
    if (!titre || !type || !statut) {
      return res.status(400).json({ error: "titre, type et statut ne peuvent pas être vides ou null" });
    }
 
    const info = db.prepare(`
      UPDATE oeuvres
      SET titre = ?, type = ?, statut = ?, note = ?, progression = ?, commentaire = ?
      WHERE id = ?
    `).run(titre, type, statut, note ?? null, progression ?? null, commentaire ?? null, req.id);
 
    if (info.changes === 0) return res.status(404).json({ error: "Oeuvre non trouvée" });
 
    const oeuvre = db.prepare("SELECT * FROM oeuvres WHERE id = ?").get(req.id);
    res.json(oeuvre);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Une œuvre avec ce titre et ce type existe déjà" });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};
 
// PATCH /oeuvres/:id — modification partielle d'une œuvre
exports.patch = (req, res) => {
  try {
    const textFields = ["titre", "type", "statut", "progression", "commentaire"];
    for (const field of textFields) {
      if (field in req.body) req.body[field] = clean(req.body[field]);
    }
 
    const updates = Object.entries(req.body);
    if (updates.length === 0) {
      return res.status(400).json({ error: "Corps de requête vide" });
    }
 
    // Vérifie que l'œuvre existe avant de modifier
    const oeuvre = db.prepare("SELECT * FROM oeuvres WHERE id = ?").get(req.id);
    if (!oeuvre) return res.status(404).json({ error: "Oeuvre non trouvée" });
 
    // Construction dynamique du SET à partir des champs envoyés
    const set = updates.map(([key]) => `${key} = ?`).join(", ");
    const values = updates.map(([, value]) => value);
 
    db.prepare(`UPDATE oeuvres SET ${set} WHERE id = ?`).run(...values, req.id);
 
    const updated = db.prepare("SELECT * FROM oeuvres WHERE id = ?").get(req.id);
    res.json(updated);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Une œuvre avec ce titre et ce type existe déjà" });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};