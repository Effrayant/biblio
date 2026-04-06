window.onload = chargerOeuvres; //Charge le tableau au chargement de la page

// -------- Constante API ---------//
const API_URL = "http://localhost:3000/oeuvres";

// -------- Thème ---------//
function appliquerTheme(theme) {
  html.setAttribute("data-theme", theme);

  const modeSombre = theme === "dark";
  toggleDark.checked = modeSombre;
  themeIcon.textContent = modeSombre ? "🌙" : "☀️";

  document.querySelector(".item-desc").textContent = modeSombre
    ? "Mode sombre activé"
    : "Mode clair activé";
}

document.addEventListener("DOMContentLoaded", () => {
  const themeSauvegarde = localStorage.getItem("theme") || "light";
  appliquerTheme(themeSauvegarde);
});

//-------- Variables globales ---------//
const barreDeRecherche = document.getElementById("headerSearchInput")

//body du tableau d'oeuvre
const tbody = document.getElementById("tableBody");

// Formulaire d'ajout d'œuvre
const formAdd= document.getElementById("formAdd");
const popupAdd = document.getElementById("addModal");
const statutSelectAdd = document.getElementById("statutAdd");
const noteInputAdd = document.getElementById("noteAdd");

// Formulaire de détails d'une oeuvre
const formDetails = document.getElementById("formDetails");
const popupDetails = document.getElementById("detailsModal");
const statutSelectDetails = document.getElementById("statutDetails");
const noteInputDetails = document.getElementById("noteDetails");
let valeurOriginalesDetails;

// petite variable qui aide pour le contrôle de la note
let ancienneValeur = "";

//Options pour la modification inline du tableau
const optionsType = [
  "Film", "Serie", "Jeu", "Manga",
  "Manhwa", "Webcomic", "Video", "Autre"
];

const optionsStatut = [
  "Termine",
  "En cours",
  "Abandonne",
  "A faire/voir",
  "Sortie prochaine"
];

let total = document.getElementById("total");
let displayed = document.getElementById("displayed")

const btnSettings = document.getElementById("btnSettings");
const panelSettings = document.getElementById("settingsPanel");
const toggleDark = document.getElementById("toggleDark");
const themeIcon = document.getElementById("themeIcon");
const html = document.documentElement;

let trieTitre = 0;
let trieNote = 0;
let ordreOriginal = [];

// -------- Fonctions principales ---------//

async function chargerOeuvres() {
  try {
    // Réinitialisation des tris
    trieTitre = 0;
    trieNote = 0;
    document.getElementById("titreAsc").classList.remove("active");
    document.getElementById("titreDesc").classList.remove("active");
    document.getElementById("noteAsc").classList.remove("active");
    document.getElementById("noteDesc").classList.remove("active");

    // Appel de l'API pour récupérer la liste des œuvres
    const res = await fetch(API_URL);
    const oeuvres = await res.json();

    tbody.innerHTML = "";
    total.textContent = oeuvres.length;

    // Création d'une ligne de tableau par œuvre
    oeuvres.forEach(o => {
        const tr = document.createElement('tr');
        tr.dataset.id = o.id;

        // Remplissage des cellules avec les données de l'œuvre
        tr.innerHTML = `
            <td class="tdTitre">${o.titre}</td>
            <td class="tdType">${o.type}</td>
            <td class="tdStatut">${o.statut}</td>
            <td class="tdNote">${o.note ?? '-'}</td>
            <td class="tdProgression">${o.progression || '-'}</td>
            <td class="tdCommentaire">${o.commentaire || '-'}</td>
            <td>
                <button class="btn-option btnInfo" data-id="${o.id}" title="Détails">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11"/>
                    <path d="M8 8l4 0"/>
                    <path d="M8 12l4 0"/>
                    <path d="M8 16l4 0"/>
                  </svg>
                </button>
                <button class="btn-option btnRecherche" data-id="${o.id}" title="Rechercher">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M21 12a9 9 0 1 0 -9 9"/>
                    <path d="M3.6 9h16.8"/>
                    <path d="M3.6 15h7.9"/>
                    <path d="M11.5 3a17 17 0 0 0 0 18"/>
                    <path d="M12.5 3a16.984 16.984 0 0 1 2.574 8.62"/>
                    <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                    <path d="M20.2 20.2l1.8 1.8"/>
                  </svg>
                </button>
                <button class="btn-option btnSuppr" data-id="${o.id}" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 7l16 0"/>
                    <path d="M10 11l0 6"/>
                    <path d="M14 11l0 6"/>
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                  </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Sauvegarde de l'ordre original pour le tri
    ordreOriginal = Array.from(tbody.querySelectorAll("tr")).map(tr => tr.dataset.id);
    displayed.textContent = tbody.querySelectorAll("tr").length;
  } catch (e) {
    console.error("Erreur lors du chargement des œuvres :", e);
  }
};

// Fonction pour ajouter une œuvre
async function ajouterOeuvre(){
  // Vérifie que tous les champs obligatoires sont remplis
  if (formAdd.checkValidity()) {
    const noteValue = formAdd.note.value;
    
    const data = {
      titre: formAdd.titre.value.trim(),
      type: formAdd.type.value,
      statut: formAdd.statut.value,
      note: noteValue ? Number(noteValue.replace(",", ".")) : null,
      progression: formAdd.progression.value.trim() || null,
      commentaire: formAdd.commentaire.value.trim() || null
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if(!res.ok) throw new Error("Erreur API pour l'ajout d'oeuvre");
    return res;
  }
}

async function supprimerOeuvre(id) {
  if (!confirm("Supprimer cette œuvre ?")) return;
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

  if (!res.ok) { console.error("Échec suppression"); return; }
  document.querySelector(`tr[data-id="${id}"]`)?.remove();
  majCompteurs();
}

async function modifierOeuvre(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Erreur API");
  return res;
}

// -------- Fonctions d'interface ---------//

// Fonction de recherche d'œuvre dans le tableau (titre et s)
function rechercheOeuvre() {
  const recherche = barreDeRecherche.value.toLowerCase();
  const lignes = document.querySelectorAll("#tableBody tr");

  lignes.forEach(ligne => {
    const correspondTitre = ligne.cells[0].textContent.toLowerCase().includes(recherche);
    const correspondType  = ligne.cells[1].textContent.toLowerCase().includes(recherche);
    ligne.style.display = correspondTitre || correspondType ? "" : "none";
  });

  majCompteurs();
}

function majCompteurs() {
  const lignes = document.querySelectorAll('#tableBody tr');
  const visibles = document.querySelectorAll('#tableBody tr:not([style*="display: none"])');

  total.textContent = lignes.length;
  displayed.textContent = visibles.length;
}

// Réinitialise les flèches de tri sauf pour la colonne en cours
function resetFleches(sauf) {
  if (sauf !== "titre") {
    document.getElementById("titreAsc").classList.remove("active");
    document.getElementById("titreDesc").classList.remove("active");
    trieTitre = 0;
  }
  if (sauf !== "note") {
    document.getElementById("noteAsc").classList.remove("active");
    document.getElementById("noteDesc").classList.remove("active");
    trieNote = 0;
  }
}

function sortTableTitre() {
  resetFleches("titre");
  trieTitre = (trieTitre + 1) % 3;

  // Retour à l'ordre original
  if (trieTitre === 0) {
    ordreOriginal.forEach(id => {
      const ligne = tbody.querySelector(`tr[data-id="${id}"]`);
      if (ligne) tbody.appendChild(ligne);
    });
    document.getElementById("titreAsc").classList.remove("active");
    document.getElementById("titreDesc").classList.remove("active");
    return;
  }

  const lignes = Array.from(tbody.querySelectorAll("tr"));
  lignes.sort((a, b) => {
    const titreA = a.cells[0].textContent.trim().toLowerCase();
    const titreB = b.cells[0].textContent.trim().toLowerCase();
    return trieTitre === 1
      ? titreA.localeCompare(titreB)
      : -titreA.localeCompare(titreB);
  });

  document.getElementById("titreAsc").classList.toggle("active", trieTitre === 1);
  document.getElementById("titreDesc").classList.toggle("active", trieTitre === 2);
  lignes.forEach(ligne => tbody.appendChild(ligne));
}

function sortTableNote() {
  resetFleches("note");
  trieNote = (trieNote + 1) % 3;

  // Retour à l'ordre original
  if (trieNote === 0) {
    ordreOriginal.forEach(id => {
      const ligne = tbody.querySelector(`tr[data-id="${id}"]`);
      if (ligne) tbody.appendChild(ligne);
    });
    document.getElementById("noteAsc").classList.remove("active");
    document.getElementById("noteDesc").classList.remove("active");
    return;
  }

  const lignes = Array.from(tbody.querySelectorAll("tr"));
  lignes.sort((a, b) => {
    const noteA = a.cells[3].textContent.trim();
    const noteB = b.cells[3].textContent.trim();

    // Les œuvres sans note sont toujours placées en dernier
    if (noteA === "-") return 1;
    if (noteB === "-") return -1;

    const diff = parseFloat(noteA) - parseFloat(noteB);
    return trieNote === 1 ? diff : -diff;
  });

  document.getElementById("noteAsc").classList.toggle("active", trieNote === 1);
  document.getElementById("noteDesc").classList.toggle("active", trieNote === 2);
  lignes.forEach(ligne => tbody.appendChild(ligne));
}

// Rend la note obligatoire ou non selon le statut 
function gererNoteObligatoire(statutSelect, noteInputAdd, spanId) {
  const statutsSansNote = ["En cours", "A faire/voir", "Sortie prochaine"];

  if (statutsSansNote.includes(statutSelect.value)) {
    noteInputAdd.removeAttribute('required');
    document.getElementById(spanId).style.visibility = "hidden";
  } else {
    noteInputAdd.setAttribute('required', '');
    document.getElementById(spanId).style.visibility = "visible";
  }
}

// Ouvre le modal détails et pré-remplit les champs avec les valeurs de la ligne
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

  // Sauvegarde des valeurs originales pour détecter les modifications au submit
  valeurOriginalesDetails = { titre, type, statut, note, progression, commentaire };

  // Réinitialise l'ancienne valeur de note pour la validation
  ancienneValeur = note === "-" ? "" : note;

  gererNoteObligatoire(statutSelectDetails, noteInputDetails, "spanRequiredNoteDetails");
}

// -------- Table de correspondance classe CSS → nom du champ ---------//
const CHAMP_PAR_CLASSE = {
  tdTitre: "titre",
  tdType: "type",
  tdStatut: "statut",
  tdNote: "note",
  tdProgression: "progression",
  tdCommentaire: "commentaire"
};

function getChampDepuisTd(td) {
  for (const [cls, champ] of Object.entries(CHAMP_PAR_CLASSE)) {
    if (td.classList.contains(cls)) return champ;
  }
  return null;
}

// Ouvre un SELECT dans une cellule pour la modification inline (type, statut)
function ouvrirSelectDansCellule(td, options) {
  if (td.querySelector("select")) return;

  const valeurInitiale = td.textContent.trim();
  const select = document.createElement("select");

  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === valeurInitiale) option.selected = true;
    select.appendChild(option);
  });

  td.textContent = "";
  td.appendChild(select);
  select.focus();

  const annuler = () => {
    td.textContent = valeurInitiale;
  };

  const valider = async () => {
    const nouvelleValeur = select.value.trim();
    td.textContent = nouvelleValeur;

    if (nouvelleValeur === valeurInitiale) return;

    const id = td.closest("tr").dataset.id;
    const champ = getChampDepuisTd(td);

    if (!champ) {
      console.warn("Classe tdType ou tdStatut manquante sur la cellule");
      td.textContent = valeurInitiale;
      return;
    }

    try {
      await modifierOeuvre(id, { [champ]: nouvelleValeur });
    } catch {
      td.textContent = valeurInitiale;
    }
  };

  select.addEventListener("change", () => valider().catch(console.error));

  select.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      annuler();
      select.removeEventListener("blur", valider);
    }
  });

  select.addEventListener("blur", () => {
    if (select.value === valeurInitiale) td.textContent = valeurInitiale;
  });
}

// Ouvre un INPUT dans une cellule pour la modification inline (titre, note, progression, commentaire)
async function modificationCelluleText(td) {
  if (td.querySelector("input")) return;

  const valeurInitiale = td.textContent.trim();

  const input = document.createElement("input");
  input.type = "text";
  input.value = valeurInitiale === "-" ? "" : valeurInitiale;
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  td.textContent = "";
  td.appendChild(input);
  input.focus();
  input.select();

  if (td.classList.contains("tdNote")) {
    input.addEventListener("input", () => {
      let v = input.value.replace(/[^\d.,]/g, "");
      const parts = v.split(/([.,])/);
      if (parts.length >= 3) {
        const decimales = parts.slice(2).join("").replace(/[.,]/g, "").slice(0, 2);
        v = parts[0] + parts[1] + decimales;
      }
      input.value = v;
    });
  }

  let cancelled = false;

  const validerTexte = async () => {
    if (cancelled) return;
    let nouvelleValeur = input.value.trim();

    // Cas "-" en base = champ vide dans l'input : aucun changement réel
    const valeurEffective = nouvelleValeur === "" ? "-" : nouvelleValeur;
    if (valeurEffective === valeurInitiale) {
      td.textContent = valeurInitiale;
      return;
    }

    const id = td.closest("tr").dataset.id;
    const champ = getChampDepuisTd(td);

    if (!champ) {
      console.warn("Classe manquante sur la cellule");
      td.textContent = valeurInitiale;
      return;
    }

    if (champ === "titre" && nouvelleValeur === "") {
      td.textContent = valeurInitiale;
      return;
    }

    // Format déjà garanti par le filtre "input" temps réel → pas de re-validation ici
    if (champ === "note") {
      nouvelleValeur = nouvelleValeur === "" ? null : Number(nouvelleValeur.replace(",", "."));
    }

    if ((champ === "progression" || champ === "commentaire") && nouvelleValeur === "") {
      nouvelleValeur = null;
    }

    try {
      await modifierOeuvre(id, { [champ]: nouvelleValeur });
      td.textContent = nouvelleValeur ?? "-";
    } catch (error) {
      console.error("Erreur API:", error);
      td.textContent = valeurInitiale;
    }
  };

  // Référence nommée pour pouvoir retirer le listener proprement après Escape
  const onBlur = () => {
    input.removeEventListener("blur", onBlur);
    validerTexte().catch(console.error);
  };

  input.addEventListener("blur", onBlur);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      cancelled = true;
      input.removeEventListener("blur", onBlur);
      td.textContent = valeurInitiale;
    }
  });
}

// -------- Gestion des événements ---------//

barreDeRecherche.addEventListener("input", rechercheOeuvre);

document.getElementById("colTitre").addEventListener("click", sortTableTitre);
document.getElementById("colNote").addEventListener("click", sortTableNote);

// Ouverture du modal d'ajout
document.querySelector("#btnAddHeader").addEventListener("click", () => {
  popupAdd.showModal();
});

// Fermeture du modal d'ajout via la croix
document.querySelector("#btnCloseAddModal").addEventListener("click", () => {
  popupAdd.close();
});

// Annulation du formulaire d'ajout
document.querySelector("#btnCancelAdd").addEventListener("click", () => {
  popupAdd.close();
  formAdd.reset();
  noteInputAdd.setAttribute('required', '');
});

// Soumission du formulaire d'ajout
formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();
  await ajouterOeuvre();
  popupAdd.close();
  formAdd.reset();
  noteInputAdd.setAttribute('required', '');
  await chargerOeuvres();
});

// Fermeture du modal détails via la croix
document.getElementById("btnCloseDetailsModal").addEventListener("click", () => {
  popupDetails.close();
  valeurOriginalesDetails = {};
});

// Annulation du modal détails
document.getElementById("btnCancelDetailsModal").addEventListener("click", () => {
  popupDetails.close();
  formDetails.reset();
  valeurOriginalesDetails = {};
});

// Soumission du formulaire détails (modification)
formDetails.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = popupDetails.dataset.id;

  const nouvellesValeurs = {
    titre:       formDetails.titre.value.trim(),
    type:        formDetails.type.value,
    statut:      formDetails.statut.value,
    note:        formDetails.note.value || "-",
    progression: formDetails.progression.value.trim() || "-",
    commentaire: formDetails.commentaire.value.trim() || "-"
  };

  // Ne garde que les champs qui ont réellement changé
  const data = {};
  for (const champ in nouvellesValeurs) {
    if (nouvellesValeurs[champ] !== valeurOriginalesDetails[champ]) {
      data[champ] = nouvellesValeurs[champ] === "-" ? null : nouvellesValeurs[champ];
    }
  }

  // Aucune modification → fermeture sans appel API
  if (Object.keys(data).length === 0) {
    popupDetails.close();
    return;
  }

  // Conversion de la note en nombre si elle a été modifiée
  if (data.note !== undefined && data.note !== null) {
    data.note = Number(String(data.note).replace(",", "."));
  }

  try {
    await modifierOeuvre(id, data);
    popupDetails.close();
    valeurOriginalesDetails = {};
    await chargerOeuvres();
  } catch (error) {
    console.error("Erreur API:", error);
  }
});

// Rend la note obligatoire ou non selon le statut (formulaire ajout)
statutSelectAdd.addEventListener('change', () => {
  gererNoteObligatoire(statutSelectAdd, noteInputAdd, "spanRequiredNoteAdd");
});

// Rend la note obligatoire ou non selon le statut (formulaire détails)
statutSelectDetails.addEventListener('change', () => {
  gererNoteObligatoire(statutSelectDetails, noteInputDetails, "spanRequiredNoteDetails");
});

// Validation de la saisie note (formulaire ajout)
noteInputAdd.addEventListener("input", (e) => {
  const v = e.target.value;
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    ancienneValeur = v;
  } else {
    e.target.value = ancienneValeur;
  }
});

noteInputAdd.addEventListener("blur", (e) => {
  const cleaned = e.target.value.replace(/[.,]$/, "");
  e.target.value = cleaned;
  ancienneValeur = cleaned;
});

// Validation de la saisie note (formulaire détails) — même logique que le formulaire ajout
noteInputDetails.addEventListener("input", (e) => {
  const v = e.target.value;
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    ancienneValeur = v;
  } else {
    e.target.value = ancienneValeur;
  }
});

noteInputDetails.addEventListener("blur", (e) => {
  const cleaned = e.target.value.replace(/[.,]$/, "");
  e.target.value = cleaned;
  ancienneValeur = cleaned;
});

// Gestion des clics sur le tableau (boutons d'options + modification inline)
tbody.addEventListener("click", (e) => {

  // Bouton supprimer
  const btnSuppr = e.target.closest(".btnSuppr");
  if (btnSuppr) {
    supprimerOeuvre(btnSuppr.dataset.id);
    return;
  }

  // Bouton détails
  const btnInfo = e.target.closest(".btnInfo");
  if (btnInfo) {
    showModalDetails(btnInfo.dataset.id);
    return;
  }

  // Bouton recherche Google
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

  // Modification inline
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
    modificationCelleluleText(td);
  }
});

// Ouvrir / fermer le panel paramètres
btnSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = panelSettings.classList.toggle("open");
  btnSettings.classList.toggle("active", isOpen);
});

// Fermer le panel paramètres en cliquant en dehors
document.addEventListener("click", (e) => {
  if (!panelSettings.contains(e.target) && e.target !== btnSettings) {
    panelSettings.classList.remove("open");
    btnSettings.classList.remove("active");
  }
});

// Basculer entre dark et light mode
toggleDark.addEventListener("change", () => {
  const nouveauTheme = toggleDark.checked ? "dark" : "light";
  appliquerTheme(nouveauTheme);
  localStorage.setItem("theme", nouveauTheme);
});