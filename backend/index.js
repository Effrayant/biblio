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
        {id: 1, titre: "Dragon", type: "Film", statut: "Terminé", note: 10, commentaire: null},
        {id: 2, titre: "Strangers Things", type: "Serie", statut: "Terminé", note: 9.5, commentaire: null},
        {id: 3, titre: "Total War Warhammer", type: "Jeu", statut: "Terminé", note: 9.5, commentaire: null}];


// --------------------
// Routes de base 
// --------------------

app.get("/", (req, res) => {
  res.send("OK");
});

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
  res.status(201).json(nouvelleOeuvre);
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
    const CHAMPS_AUTORISES = ["statut", "note", "progression", "commentaire"];

    if (!Object.keys(req.body).every(key => CHAMPS_AUTORISES(key)) && Object.keys(req.body).every(key => !== undefined)){  // patch qui remplace une partie des champs mais pas tous.
        return res.status(400).json({error: "Champ non autorisé trouvé"});
    }

    const id = Number(req.params.id);
    const index = oeuvres.findIndex(o => o.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Oeuvre non trouvée" });
    }

    const oeuvreModifiee =  {
        id,
        statut: req.body.statut,
        note: req.body.note,
        progression: req.body.progression ?? null,
        commentaire: req.body.commentaire ?? null
    }

});

// --------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});