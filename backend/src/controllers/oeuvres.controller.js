const pool = require("../db"); // Import de la co avec la bd PostGre

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

  const result = await pool.query(
    "SELECT * FROM oeuvres WHERE id = $1",
    [id]
  );

  if (!result.rows.length)
    return res.status(404).json({ error: "Oeuvre non trouvée" });

  res.json(result.rows[0]);
};

// Route POST //
exports.create = async (req, res) => {
  try {
    let { titre, type, statut, note, progression, commentaire } =
      req.body;

    progression = clean(progression);
    commentaire = clean(commentaire);

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
    let { titre, type, statut, note, progression, commentaire } =
      req.body;

    progression = clean(progression);
    commentaire = clean(commentaire);

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

// Route PATCH (remplacement partiel et pas de champ majeurs (titre / type)) //
exports.patch = async (req, res) => {
  const id = req.id;

  try {
    if (req.body.progression?.trim() === "") {
        req.body.progression = null;
    }
      
    if (req.body.commentaire?.trim() === "") {
        req.body.commentaire = null;
    }
      
    // Transforme le body en tableau clé/valeur
    const updates = Object.entries(req.body); 

    // Génère les champs SQL à modifier
    const fields = updates.map(
      ([key], i) => `${key} = $${i + 2}`
    );

    //Liste des nouvelles valeurs
    const values = updates.map(
      ([_, value]) => value
    );

    const result = await pool.query(
      `UPDATE oeuvres
       SET ${fields.join(", ")}
       WHERE id=$1
       RETURNING *`,
      [id, ...values]
    );

    if (!result.rows.length){
        return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    res.json(result.rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
};