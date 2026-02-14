const TYPES_AUTORISES = ["Film", "Serie", "Jeu", "Manga", "Manhwa", "Webcomic", "Video", "Autre"];

const STATUTS_AUTORISES = ["A faire/voir", "En cours", "Termine", "Abandonne", "Sortie prochaine"];

// Fonction de vérification pour les nouvelles oeuvres
function validationOeuvrePost(body) {
  const CHAMPS_AUTORISES = ["titre", "type", "statut", "note", "progression", "commentaire"];

  if (Object.keys(body).length === 0){
    return "Corps de requête vide";
  }

  // Verifie que la requete ne contient que des champs autorisés 
  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key)){
        return "Champ non autorisé trouvé";   
    }
  }

  // Titre obligatoire et non vide
  if (typeof body.titre !== "string" || body.titre.trim().length === 0){
    return "Titre invalide";
  }

  if (!TYPES_AUTORISES.includes(body.type)){
    return "Type invalide";
  }

  if (!STATUTS_AUTORISES.includes(body.statut)){
    return "Statut invalide";
  }

  if (typeof body.note !== "number" || body.note < 0){
    return "Note invalide";
  }

  // Progression facultative mais doit être une string si présente
  if ("progression" in body && body.progression !== null && typeof body.progression !== "string"){
    return "Progression invalide";
  }

  // Facultatif mais string si présent 
  if ("commentaire" in body && body.commentaire !== null && typeof body.commentaire !== "string"){
    return "Commentaire invalide";
  }
    
  return null;
}

// Validation identique a POST pour PUT 
function validationOeuvrePut(body) {
  return validationOeuvrePost(body);
}

function validationOeuvrePatch(body) {
  //Uniquement les champs "mineurs"
  const CHAMPS_AUTORISES = ["statut", "note", "progression", "commentaire"];

  if (Object.keys(body).length === 0){
    return "Corps de requête vide";
  }

  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key))
      return "Champ non autorisé trouvé";
  }

  if ("statut" in body && !STATUTS_AUTORISES.includes(body.statut)){
    return "Statut invalide";
  }

  if ("note" in body && (typeof body.note !== "number" || body.note < 0)){
    return "Note invalide";
  }

  if ("progression" in body && body.progression !== null && typeof body.progression !== "string"){
    return "Progression invalide";
  }

  if ("commentaire" in body && body.commentaire !== null && typeof body.commentaire !== "string"){
    return "Commentaire invalide";
  }

  return null;
}

// Exporte les fonctions pour les routes
module.exports = {
  validationOeuvrePost,
  validationOeuvrePut,
  validationOeuvrePatch
};