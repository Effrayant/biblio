import { API_URL, modifierOeuvre, supprimerOeuvreAPI } from "./Api.js";
 
// -------- DOM ---------
const tbody = document.getElementById("tableBody");
const total = document.getElementById("total");
const displayed = document.getElementById("displayed");
 
// -------- Options modification inline ---------
export const optionsType = ["Film", "Série", "Jeu", "Manga", "Manhwa", "Webcomic", "Vidéo", "Autre"];
export const optionsStatut = ["Terminé", "En cours", "Abandonné", "À faire/voir", "Sortie prochaine"];
 
// -------- État privé du tri ---------
let trieTitre = 0;
let trieNote = 0;
let ordreOriginal = [];
 
// -------- Chargement ---------
 
export async function chargerOeuvres() {
  try {
    trieTitre = 0;
    trieNote = 0;
    document.getElementById("titreAsc").classList.remove("active");
    document.getElementById("titreDesc").classList.remove("active");
    document.getElementById("noteAsc").classList.remove("active");
    document.getElementById("noteDesc").classList.remove("active");
 
    const res = await fetch(API_URL);
    const oeuvres = await res.json();
 
    tbody.innerHTML = "";
    total.textContent = oeuvres.length;
 
    oeuvres.forEach(o => {
      const tr = document.createElement("tr");
      tr.dataset.id = o.id;
      tr.innerHTML = `
        <td class="tdTitre">${o.titre}</td>
        <td class="tdType">${o.type}</td>
        <td class="tdStatut">${o.statut}</td>
        <td class="tdNote">${o.note ?? "-"}</td>
        <td class="tdProgression">${o.progression || "-"}</td>
        <td class="tdCommentaire">${o.commentaire || "-"}</td>
        <td>
          <button class="btn-option btnInfo" data-id="${o.id}" title="Détails">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11"/>
              <path d="M8 8l4 0"/><path d="M8 12l4 0"/><path d="M8 16l4 0"/>
            </svg>
          </button>
          <button class="btn-option btnRecherche" data-id="${o.id}" title="Rechercher">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M21 12a9 9 0 1 0 -9 9"/><path d="M3.6 9h16.8"/><path d="M3.6 15h7.9"/>
              <path d="M11.5 3a17 17 0 0 0 0 18"/>
              <path d="M12.5 3a16.984 16.984 0 0 1 2.574 8.62"/>
              <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
              <path d="M20.2 20.2l1.8 1.8"/>
            </svg>
          </button>
          <button class="btn-option btnSuppr" data-id="${o.id}" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
            </svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
 
    ordreOriginal = Array.from(tbody.querySelectorAll("tr")).map(tr => tr.dataset.id);
    displayed.textContent = tbody.querySelectorAll("tr").length;
  } catch (e) {
    console.error("Erreur lors du chargement des œuvres :", e);
  }
}
 
export async function supprimerOeuvre(id) {
  if (!confirm("Supprimer cette œuvre ?")) return;
  try {
    const res = await supprimerOeuvreAPI(id);
    if (res.ok) {
      document.querySelector(`tr[data-id="${id}"]`)?.remove();
      majCompteurs();
    }
  } catch {
    console.error("Échec suppression");
  }
}
 
// -------- Recherche & compteurs ---------
 
export function rechercheOeuvre(valeur) {
  const recherche = valeur.toLowerCase();
  const lignes = document.querySelectorAll("#tableBody tr");
 
  lignes.forEach(ligne => {
    const correspondTitre = ligne.cells[0].textContent.toLowerCase().includes(recherche);
    const correspondType  = ligne.cells[1].textContent.toLowerCase().includes(recherche);
    ligne.style.display = correspondTitre || correspondType ? "" : "none";
  });
 
  majCompteurs();
}
 
export function majCompteurs() {
  const lignes = document.querySelectorAll("#tableBody tr");
  const visibles = document.querySelectorAll("#tableBody tr:not([style*='display: none'])");
  total.textContent = lignes.length;
  displayed.textContent = visibles.length;
}
 
// -------- Tri ---------
 
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
 
export function sortTableTitre() {
  resetFleches("titre");
  trieTitre = (trieTitre + 1) % 3;
 
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
    return trieTitre === 1 ? titreA.localeCompare(titreB) : -titreA.localeCompare(titreB);
  });
 
  document.getElementById("titreAsc").classList.toggle("active", trieTitre === 1);
  document.getElementById("titreDesc").classList.toggle("active", trieTitre === 2);
  lignes.forEach(ligne => tbody.appendChild(ligne));
}
 
export function sortTableNote() {
  resetFleches("note");
  trieNote = (trieNote + 1) % 3;
 
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
    if (noteA === "-") return 1;
    if (noteB === "-") return -1;
    const diff = parseFloat(noteA) - parseFloat(noteB);
    return trieNote === 1 ? diff : -diff;
  });
 
  document.getElementById("noteAsc").classList.toggle("active", trieNote === 1);
  document.getElementById("noteDesc").classList.toggle("active", trieNote === 2);
  lignes.forEach(ligne => tbody.appendChild(ligne));
}
 
// -------- Modification inline ---------
 
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
 
export function ouvrirSelectDansCellule(td, options) {
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
 
  const annuler = () => { td.textContent = valeurInitiale; };
 
  const valider = async () => {
    const nouvelleValeur = select.value.trim();
    td.textContent = nouvelleValeur;
    if (nouvelleValeur === valeurInitiale) return;
 
    const id = td.closest("tr").dataset.id;
    const champ = getChampDepuisTd(td);
 
    if (!champ) {
      console.warn("Classe manquante sur la cellule");
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
 
export async function modificationCelluleText(td) {
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
      console.error("Erreur API modification d'oeuvre :", error);
      td.textContent = valeurInitiale;
    }
  };
 
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