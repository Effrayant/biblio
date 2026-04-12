import { appliquerTheme } from "./Theme.js";
import { ajouterOeuvre, modifierOeuvre } from "./Api.js";
import {
  chargerOeuvres, supprimerOeuvre, rechercheOeuvre,
  sortTableTitre, sortTableNote,
  ouvrirSelectDansCellule, modificationCelluleText,
  optionsType, optionsStatut
} from "./Table.js";
import { showModalDetails } from "./Modals.js";
import { state } from "./State.js";
 
// -------- DOM ---------
const tbody = document.getElementById("tableBody");
const barreDeRecherche = document.getElementById("headerSearchInput");
const formAdd = document.getElementById("formAdd");
const popupAdd = document.getElementById("addModal");
const noteInputAdd = document.getElementById("noteAdd");
const formDetails = document.getElementById("formDetails");
const popupDetails = document.getElementById("detailsModal");
const noteInputDetails = document.getElementById("noteDetails");
const btnSettings = document.getElementById("btnSettings");
const panelSettings = document.getElementById("settingsPanel");
const toggleDark = document.getElementById("toggleDark");

// -------- Initialisation ---------
window.onload = chargerOeuvres;
 
document.addEventListener("DOMContentLoaded", () => {
  const themeSauvegarde = localStorage.getItem("theme") || "light";
  appliquerTheme(themeSauvegarde);
});
 
// -------- Recherche ---------
barreDeRecherche.addEventListener("input", (e) => rechercheOeuvre(e.target.value));
 
// -------- Tri ---------
document.getElementById("colTitre").addEventListener("click", sortTableTitre);
document.getElementById("colNote").addEventListener("click", sortTableNote);
 
// -------- Modal ajout ---------
document.querySelector("#btnAddHeader").addEventListener("click", () => {
  popupAdd.showModal();
});
 
document.querySelector("#btnCloseAddModal").addEventListener("click", () => {
  popupAdd.close();
  formAdd.reset();
});
 
document.querySelector("#btnCancelAdd").addEventListener("click", () => {
  popupAdd.close();
  formAdd.reset();
});
 
formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!formAdd.checkValidity()) return;
 
  const noteValue = formAdd.note.value;
  const data = {
    titre: formAdd.titre.value.trim(),
    type: formAdd.type.value,
    statut: formAdd.statut.value,
    note: noteValue ? Number(noteValue.replace(",", ".")) : null,
    progression: formAdd.progression.value.trim() || null,
    commentaire: formAdd.commentaire.value.trim() || null
  };
 
  await ajouterOeuvre(data);
  popupAdd.close();
  formAdd.reset();
  await chargerOeuvres();
});
 
noteInputAdd.addEventListener("input", (e) => {
  const v = e.target.value;
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    state.ancienneValeur = v;
  } else {
    e.target.value = state.ancienneValeur;
  }
});
 
noteInputAdd.addEventListener("blur", (e) => {
  const cleaned = e.target.value.replace(/[.,]$/, "");
  e.target.value = cleaned;
  state.ancienneValeur = cleaned;
});
 
// -------- Modal détails ---------
document.getElementById("btnCloseDetailsModal").addEventListener("click", () => {
  popupDetails.close();
  state.valeurOriginalesDetails = {};
});
 
document.getElementById("btnCancelDetailsModal").addEventListener("click", () => {
  popupDetails.close();
  formDetails.reset();
  state.valeurOriginalesDetails = {};
});
 
formDetails.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = popupDetails.dataset.id;
 
  const nouvellesValeurs = {
    titre: formDetails.titre.value.trim(),
    type: formDetails.type.value,
    statut: formDetails.statut.value,
    note: formDetails.note.value || "-",
    progression: formDetails.progression.value.trim() || "-",
    commentaire: formDetails.commentaire.value.trim() || "-"
  };
 
  const data = {};
  for (const champ in nouvellesValeurs) {
    if (nouvellesValeurs[champ] !== state.valeurOriginalesDetails[champ]) {
      data[champ] = nouvellesValeurs[champ] === "-" ? null : nouvellesValeurs[champ];
    }
  }
 
  if (Object.keys(data).length === 0) {
    popupDetails.close();
    return;
  }
 
  if (data.note !== undefined && data.note !== null) {
    data.note = Number(String(data.note).replace(",", "."));
  }
 
  try {
    await modifierOeuvre(id, data);
    popupDetails.close();
    state.valeurOriginalesDetails = {};
    await chargerOeuvres();
  } catch (error) {
    console.error("Erreur API:", error);
  }
});
 
noteInputDetails.addEventListener("input", (e) => {
  const v = e.target.value;
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    state.ancienneValeur = v;
  } else {
    e.target.value = state.ancienneValeur;
  }
});
 
noteInputDetails.addEventListener("blur", (e) => {
  const cleaned = e.target.value.replace(/[.,]$/, "");
  e.target.value = cleaned;
  state.ancienneValeur = cleaned;
});
 
// -------- Clics sur le tableau ---------
tbody.addEventListener("click", (e) => {
 
  const btnSuppr = e.target.closest(".btnSuppr");
  if (btnSuppr) {
    supprimerOeuvre(btnSuppr.dataset.id);
    return;
  }
 
  const btnInfo = e.target.closest(".btnInfo");
  if (btnInfo) {
    showModalDetails(btnInfo.dataset.id);
    return;
  }
 
  const btnRecherche = e.target.closest(".btnRecherche");
  if (btnRecherche) {
    const tr = btnRecherche.closest("tr");
    if (!tr) return;
    const titre = tr.querySelector(".tdTitre").textContent;
    const progression = tr.querySelector(".tdProgression").textContent;
    let requete = titre;
    if (progression && progression !== "-") requete += " " + progression;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(requete)}`, "_blank");
    return;
  }
 
  const td = e.target.closest("td");
  if (!td) return;
 
  if (td.classList.contains("tdType"))   ouvrirSelectDansCellule(td, optionsType);
  if (td.classList.contains("tdStatut")) ouvrirSelectDansCellule(td, optionsStatut);
 
  if (
    td.classList.contains("tdTitre") ||
    td.classList.contains("tdNote") ||
    td.classList.contains("tdProgression") ||
    td.classList.contains("tdCommentaire")
  ) {
    modificationCelluleText(td);
  }
});
 
// -------- Panel paramètres ---------
btnSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = panelSettings.classList.toggle("open");
  btnSettings.classList.toggle("active", isOpen);
});
 
document.addEventListener("click", (e) => {
  if (!panelSettings.contains(e.target) && e.target !== btnSettings) {
    panelSettings.classList.remove("open");
    btnSettings.classList.remove("active");
  }
});
 
toggleDark.addEventListener("change", () => {
  const nouveauTheme = toggleDark.checked ? "dark" : "light";
  appliquerTheme(nouveauTheme);
  localStorage.setItem("theme", nouveauTheme);
});