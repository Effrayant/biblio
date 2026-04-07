import { state } from "./State.js";
 
const popupDetails = document.getElementById("detailsModal");
 
function showModalDetails(id) {
  popupDetails.showModal();
  popupDetails.dataset.id = id;
 
  const oeuvre = document.querySelector(`tr[data-id="${id}"]`);
 
  const titre = oeuvre.querySelector(".tdTitre").textContent;
  const type = oeuvre.querySelector(".tdType").textContent;
  const statut = oeuvre.querySelector(".tdStatut").textContent;
  const note = oeuvre.querySelector(".tdNote").textContent;
  const progression = oeuvre.querySelector(".tdProgression").textContent;
  const commentaire = oeuvre.querySelector(".tdCommentaire").textContent;
 
  document.getElementById("titreDetails").value = titre;
  document.getElementById("typeDetails").value = type;
  document.getElementById("statutDetails").value = statut;
  document.getElementById("noteDetails").value = note === "-" ? "" : note;
  document.getElementById("progressionDetails").value = progression === "-" ? "" : progression;
  document.getElementById("commentaireDetails").value = commentaire === "-" ? "" : commentaire;
 
  state.valeurOriginalesDetails = { titre, type, statut, note, progression, commentaire };
  state.ancienneValeur = note === "-" ? "" : note;
}

export {showModalDetails};