const TYPES_AUTORISES = ["Film", "Serie", "Jeu", "Manga", "Manhwa", "Webcomic", "Video", "Autre"];

const STATUTS_AUTORISES = ["A faire/voir", "En cours", "Termine", "Abandonne", "Sortie prochaine"];
const STATUTS_NOTE_OBLIGATOIRE = ["Termine", "Abandonne"];

const CHAMPS_AUTORISES = ["titre", "type", "statut", "note", "progression", "commentaire"];

// String non vide (après trim)
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// null ou string (utile pour progression/commentaire)
function isNullableString(v) {
  return v === null || typeof v === "string";
}

// Note valide = nombre fini >= 0 (rejette NaN, Infinity)
function isValidNoteValue(v) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

// Règle métier pour POST / PUT
function validateNoteSelonStatut(statut, note) {
  if (!STATUTS_AUTORISES.includes(statut)) return "Statut invalide";

  // Note obligatoire pour certains statuts
  if (STATUTS_NOTE_OBLIGATOIRE.includes(statut)) {
    if (!isValidNoteValue(note)) {
      return "Note obligatoire et invalide pour ce statut";
    }
    return null;
  }

  // Pour les autres statuts : note facultative
  if (note !== null && !isValidNoteValue(note)) {
    return "Note invalide";
  }

  return null;
}

// Fonction de vérification pour les nouvelles oeuvres
function validationOeuvrePost(body) {

  if (Object.keys(body).length === 0){
    return "Corps de requête vide";
  }

  // Verifie que la requete ne contient que des champs autorisés 
  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key)){
        return "Champ non autorisé trouvé";   
    }
  }

  // Champs requis
  if (!isNonEmptyString(body.titre)) return "Titre invalide";
  if (!TYPES_AUTORISES.includes(body.type)) return "Type invalide";
  if (!STATUTS_AUTORISES.includes(body.statut)) return "Statut invalide";

  // Note doit être fournie (même si null quand statut sans note)
  if (!("note" in body)) return "Note manquante";

  // Applique la règle entre note et statut
  const errNote = validateNoteSelonStatut(body.statut, body.note);
  if (errNote) return errNote;

  // Progression facultative mais doit être une string si présente (ou null)
  if ("progression" in body && !isNullableString(body.progression)) {
    return "Progression invalide";
  }

  // Commentaire facultatif mais doit être une string si présent (ou null)
  if ("commentaire" in body && !isNullableString(body.commentaire)) {
    return "Commentaire invalide";
  }
    
  return null;
}

// Validation identique a POST pour PUT 
function validationOeuvrePut(body) {
  return validationOeuvrePost(body);
}

function validationOeuvrePatch(body) {
  if (Object.keys(body).length === 0){
    return "Corps de requête vide";
  }

  for (const key of Object.keys(body)) {
    if (!CHAMPS_AUTORISES.includes(key))
      return "Champ non autorisé trouvé";
  }

  if ("titre" in body && !isNonEmptyString(body.titre)) {
    return "Titre invalide";
  }

  if ("type" in body && !TYPES_AUTORISES.includes(body.type)) {
    return "Type invalide";
  }

  if ("statut" in body && !STATUTS_AUTORISES.includes(body.statut)) {
    return "Statut invalide";
  }

  // En PATCH on accepte note: null OU une note valide
  if ("note" in body) {
    if (!(body.note === null || isValidNoteValue(body.note))) {
      return "Note invalide";
    }
  }

  if ("progression" in body && !isNullableString(body.progression)) {
    return "Progression invalide";
  }

  if ("commentaire" in body && !isNullableString(body.commentaire)) {
    return "Commentaire invalide";
  }

  return null;
}

function validationOeuvrePatchCoherence(oeuvreFinale) {
  return validateNoteSelonStatut(oeuvreFinale.statut, oeuvreFinale.note);
}

// Exporte les fonctions pour les routes
module.exports = {
  validationOeuvrePost,
  validationOeuvrePut,
  validationOeuvrePatch,
  validationOeuvrePatchCoherence,
};