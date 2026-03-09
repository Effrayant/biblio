window.onload = chargerOeuvres; //Charge le tableau au chargement de la page

//-------- Variables globales ---------//
// Barre de recherche dans le header
const barreDeRecherche = document.getElementById("headerSearchInput")

//body du tableau d'oeuvre
const tbody = document.getElementById("tableBody");

// Formulaire d'ajout d'œuvre
const formAjout = document.getElementById("formAddWork");

// Popup qui contient le formulaire d'ajout d'oeuvre
const popupAjout = document.getElementById("addWorkModal");

// Champ du statut dans le formulaire d'ajout d'oeuvre
const statutSelect = document.getElementById('statut');

// Champ de note dans le formulaire d'ajout d'œuvre
const noteInput = document.getElementById("note");
let ancienneValeur = "";

//Option de type pour la modification inline du tableau
const optionsType = [
  "Film", "Serie", "Jeu", "Manga",
  "Manhwa", "Webcomic", "Video", "Autre"
];
//Option de statut pour la modification inline du tableau
const optionsStatut = [
  "Termine",
  "En cours",
  "Abandonne",
  "A faire/voir",
  "Sortie prochaine"
];

let total = document.getElementById("total");
let displayed = document.getElementById("displayed")

// DARK MODE / LIGHT MODE // 
const btnSettings = document.getElementById("btnSettings");
const panelSettings = document.getElementById("settingsPanel");
const toggleDark = document.getElementById("toggleDark");
const themeIcon = document.getElementById("themeIcon");
const html = document.documentElement;

// -------- Fonctions principales ---------//

async function chargerOeuvres() {
  try {
    // Appel de l'API pour récupérer la liste des œuvres
    const res = await fetch("http://localhost:3000/oeuvres");
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
            <td><button class="btn-suppr" data-id="${o.id}">Supprimer</button></td>
        `;

        // Ajout de l'action de suppression sur le bouton
        tr.querySelector(".btn-suppr").onclick = () => supprimerOeuvre(o.id);

        tbody.appendChild(tr);
    });
    displayed.textContent = tbody.querySelectorAll("tr").length;
  } catch (e) {
    console.error("Erreur API:", e);
  }
};

// Fonction pour ajouter une œuvre
async function ajouterOeuvre(){
  // Vérifie que tous les champs obligatoires sont remplis
  if (formAjout.checkValidity()) {
    const noteValue = formAjout.note.value;
    
    const data = {
      titre: formAjout.titre.value,
      type: formAjout.type.value,
      statut: formAjout.statut.value,
      note: noteValue ? Number(noteValue.replace(",", ".")) : null,
      progression: formAjout.progression.value || null,
      commentaire: formAjout.commentaire.value || null
    };

    if (data.statut === "A faire/voir" || data.statut === "Sortie prochaine") {data.note = null} 

    await fetch("http://localhost:3000/oeuvres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }
}

async function supprimerOeuvre(id){
  await fetch(`http://localhost:3000/oeuvres/${id}`, {
    method: "DELETE"
  });
  
  // Supprime uniquement la ligne concernée
  const ligne = document.querySelector(`tr[data-id="${id}"]`);
  if (ligne) ligne.remove();

  majCompteurs();
}

// -------- Fonctions d'interface ---------//

// Fonction de recherche d'œuvre dans le tableau
function rechercheOeuvre() {

  // Récupère le texte dans la barre de recherche puis transformation en minuscules
  const recherche = barreDeRecherche.value.toLowerCase();

  // Sélectionne les lignes du tableau
  const lignes = document.querySelectorAll("#tableBody tr");

  lignes.forEach(ligne => {
    // Fait disparaître les lignes qui ne contiennent pas le texte ni dans leur titre ni dans leur type
    if (
      !ligne.cells[0].textContent.toLowerCase().includes(recherche) &&
      !ligne.cells[1].textContent.toLowerCase().includes(recherche)
    ){
      ligne.style.display = "none";
    } else{
      ligne.style.display = "";
    }
  });
  majCompteurs();
}

function majCompteurs() {
  const lignes = document.querySelectorAll('#tableBody tr');
  const visibles = document.querySelectorAll('#tableBody tr:not([style*="display: none"])');

  total.textContent = lignes.length;
  displayed.textContent = visibles.length;
}

function sortTableTitre() {
  let tableTitre = [];
  const lignes = document.querySelectorAll("#tableBody tr");
  lignes.forEach(ligne => {
    tableTitre.push(ligne.cells[0].textContent.toLowerCase());
  });
  tableTitre.sort();
}

// -------- Gestion des événements ---------//

//Déclenche la fonction de recheche a chaque modification dans la barre de recherche
barreDeRecherche.addEventListener("input", rechercheOeuvre);

document.getElementById("colTitre").addEventListener("click", sortTableTitre);

document.querySelector("#btnAddHeader").addEventListener("click", () => {
    popupAjout.showModal();
});

document.querySelector("#btnCloseAddModal").addEventListener("click", () => {
    popupAjout.close();
});

document.querySelector("#btnCancelAddWork").addEventListener("click", () => {
    popupAjout.close();
    formAjout.reset();     // Vide les champs

    noteInput.disabled = false;    // Reset les charactéristiques de la note
    noteInput.setAttribute('required', '');
});

formAjout.addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page et l'erreur de redirection
    
    await ajouterOeuvre(); // Exécute la fonction Fetch
    
    popupAjout.close();    // Ferme le popup
    formAjout.reset();     // Vide les champs

    noteInput.disabled = false;    // Reset les charactéristiques de la note
    noteInput.setAttribute('required', '');

    await chargerOeuvres(); // Rafraîchit le tableau sans recharger la page
});

// Vérification du statut pour bloquer ou non la note
statutSelect.addEventListener('change', () => {
  const statutsSansNote = ['A faire/voir', 'Sortie prochaine'];

  if (statutsSansNote.includes(statutSelect.value)) {
      noteInput.disabled = true;
      noteInput.value = '';         // vide la note si déjà remplie
      noteInput.removeAttribute('required');    
  } else {
      noteInput.disabled = false;
      noteInput.setAttribute('required', '');
  }
})

// Vérification et contrainte pour la note dans le formulaire d'ajout d'œuvre
noteInput.addEventListener("input", (e) => {
  const v = e.target.value;

  // Chiffres obligatoires avant virgule ou point, 2 décimales max et 1 point/virgule max (pas au début), sinon suppression
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    ancienneValeur = v;
  } else {
    e.target.value = ancienneValeur;
  }
});

// Nettoyage pour éviter les notes qui termine par un . ou une , 
noteInput.addEventListener("blur", (e) => {
  const cleaned = e.target.value.replace(/[.,]$/, "");
  e.target.value = cleaned;
  ancienneValeur = cleaned;
});

// Ajout d'un evenement sur les cellules du tableau qui permet d'ouvrir des SELECT ou des INPUT afin de modifier leur contenu
tbody.addEventListener("click", (e) => {
  // Récupère la cellule la plus proche de l'élément cliqué
  // (utile si clique sur le texte ou un élément à l'intérieur)
  const td = e.target.closest("td");
  if (!td) return;

  // si la cellule correspond au type on ouvre un select avec les options (identique au formulaire de création d'oeuvre)
  if (td.classList.contains("tdType")) {
    ouvrirSelectDansCellule(td, optionsType);
  }

  // pareil que le if précedent mais pour le statut
  if (td.classList.contains("tdStatut")) {
    ouvrirSelectDansCellule(td, optionsStatut);
  }

  // Pour la modification des champs qui n'utilisent pas de chois prédéfinis
  if (td.classList.contains("tdTitre") || td.classList.contains("tdNote") || td.classList.contains("tdProgression") || td.classList.contains("tdCommentaire")) {
    modificationCelleluleText(td);
  }
});


function ouvrirSelectDansCellule(td, options) {
  if (td.querySelector("select")) return;

  const valeurInitiale = td.textContent.trim();
  const select = document.createElement("select");

  // création des options contenus dans le select
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
  
  let validated = false;

  const valider = async () => {
    if (validated) return;
    validated = true;    
    const nouvelleValeur = select.value.trim();
    td.textContent = nouvelleValeur;

    if (nouvelleValeur === valeurInitiale) return;

    const tr = td.closest("tr");
    const id = tr.dataset.id;

    let champ;
    if (td.classList.contains("tdType")) champ = "type";
    if (td.classList.contains("tdStatut")) champ = "statut";

    if (!champ) {
      console.warn("Classe tdType ou tdStatut manquante sur la cellule");
      td.textContent = valeurInitiale;
      return;
    }

    const response = await fetch(`http://localhost:3000/oeuvres/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [champ]: nouvelleValeur })
    });

    if (!response.ok) {
      td.textContent = valeurInitiale; // rollback si erreur API
    }
  };

  select.addEventListener("blur", valider);
  select.addEventListener("change", valider);
};

async function modificationCelleluleText(td) {

  // Empêche d’ouvrir plusieurs inputs dans la même cellule
  if (td.querySelector("input")) return;

  // Stocke la valeur initiale
  const valeurInitiale = td.textContent.trim();

  // Création d’un input temporaire
  const input = document.createElement("input");
  input.type = "text";
  input.value = valeurInitiale === "-" ? "" : valeurInitiale;
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  td.textContent = "";
  td.appendChild(input);
  input.focus();
  input.select();

  // Filtre la saisie en temps réel pour le champ note
  if (td.classList.contains("tdNote")) {
    input.addEventListener("input", () => {
      let v = input.value.replace(/[^\d.,]/g, ""); // supprime les caractères interdits

      // Sépare sur le premier . ou ,
      const parts = v.split(/([.,])/);
      if (parts.length >= 3) {
        // parts[0] = entier, parts[1] = séparateur, parts[2+] = décimales + parasites
        const decimales = parts.slice(2).join("").replace(/[.,]/g, "").slice(0, 2);
        v = parts[0] + parts[1] + decimales;
      }

      input.value = v;
    });
  }

  let cancelled = false;
  // Fonction de validation (appel API)
  const validerTexte = async () => {
    if (cancelled) return;
    let nouvelleValeur = input.value.trim();

    // Si aucune modification → on restaure
    if (nouvelleValeur === valeurInitiale) {
      td.textContent = valeurInitiale;
      return;
    }

    // Récupération de l'id via la ligne
    const tr = td.closest("tr");
    const id = tr.dataset.id;

    // Identification du champ à modifier
    let champ;
    if (td.classList.contains("tdTitre")) champ = "titre";
    if (td.classList.contains("tdNote")) champ = "note";
    if (td.classList.contains("tdProgression")) champ = "progression";
    if (td.classList.contains("tdCommentaire")) champ = "commentaire";

    if (!champ) {
      console.warn("Classe manquante sur la cellule");
      td.textContent = valeurInitiale;
      return;
    }

    // Validation spécifique pour la note
    if (champ === "note") {
      if (!/^\d+([.,]\d{0,2})?$/.test(nouvelleValeur)) {
        td.textContent = valeurInitiale;
        return;
      }
      nouvelleValeur = Number(nouvelleValeur.replace(",", "."));
    }

    try {
      // Envoi PATCH vers l’API
      const res = await fetch(`http://localhost:3000/oeuvres/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [champ]: nouvelleValeur })
      });

      if (!res.ok) throw new Error();

      // Mise à jour visuelle si succès
      td.textContent = nouvelleValeur === "" ? "-" : nouvelleValeur;

    } catch (error) {
      console.error("Erreur API:", error);
      td.textContent = valeurInitiale;
    }
  };

  // Validation quand on clique ailleurs (une seule fois)
  input.addEventListener("blur", validerTexte, { once: true });

  // Gestion clavier
  input.addEventListener("keydown", (e) => {

    // Entrée → validation
    if (e.key === "Enter") input.blur();

    // Échap → annulation
    if (e.key === "Escape") {
      cancelled = true;
      td.textContent = valeurInitiale;
    }
  });
}

// Ouvrir / fermer
btnSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = panelSettings.classList.toggle("open");
  btnSettings.classList.toggle("active", isOpen);
});

// Fermer en cliquant dehors
document.addEventListener("click", (e) => {
  if (!panelSettings.contains(e.target) && e.target !== btnSettings) {
    panelSettings.classList.remove("open");
    btnSettings.classList.remove("active");
  }
});

// Dark / Light mode
toggleDark.addEventListener("change", () => {
  if (toggleDark.checked) {
    html.setAttribute("data-theme", "dark");
    themeIcon.textContent = "🌙";
    document.querySelector(".item-desc").textContent = "Mode sombre activé";
  } else {
    html.setAttribute("data-theme", "light");
    themeIcon.textContent = "☀️";
    document.querySelector(".item-desc").textContent = "Mode clair activé";
  }
});