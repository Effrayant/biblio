require("dotenv").config(); // Charge les variables d'environnement depuis le fichier .env

const express = require("express"); // Framework pour serveur HTTP
const cors = require("cors");       // Pour les requêtes externes (le frontend ici)

const oeuvresRoutes = require("./routes/oeuvres.routes"); // Importe les routes liés au serveur (GET POST PATCH PUT et DELETE)

const app = express(); // l'application en elle même

app.use(cors());
app.use(express.json()); // permet au serveur de lire le JSON envoyé par le client

app.use("/oeuvres", oeuvresRoutes);

// Permet juste de vérifier que le serveur est pas mort
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT || 3000); // Lancement du serveur