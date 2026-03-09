require("dotenv").config(); // Charge les variables d'environnement depuis le fichier .env

const express = require("express"); // Framework pour serveur HTTP
const cors = require("cors");       // Pour les requêtes externes (le frontend ici)

const oeuvresRoutes = require("./routes/oeuvres.routes"); // Importe les routes liés au serveur (GET POST PATCH PUT et DELETE)

const app = express(); // l'application en elle même
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // permet au serveur de lire le JSON envoyé par le client

app.use("/oeuvres", oeuvresRoutes);

// Permet juste de vérifier que le serveur est pas mort
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});