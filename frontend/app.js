window.onload = chargerOeuvres; //Charge le tableau au chargement de la page

//-------- Variables globales ---------//
// Barre de recherche dans le header
const barreDeRecherche = document.querySelector(".header__search-input")

//body du tableau d'oeuvre
const tbody = document.querySelector("#tableauOeuvres tbody");

// Formulaire d'ajout d'œuvre
const formAjout = document.querySelector("#formAjouterOeuvre");

// Popup qui contient le formulaire d'ajout d'oeuvre
const popupAjout = document.querySelector("#popupAdd");

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


// -------- Fonctions principales ---------//

async function chargerOeuvres() {
  try {
    // Appel de l'API pour récupérer la liste des œuvres
    const res = await fetch("http://localhost:3000/oeuvres");
    
    // Conversion de la réponse en JSON
    const oeuvres = await res.json();

    tbody.innerHTML = "";

    // Création d'une ligne de tableau par œuvre
    oeuvres.forEach(o => {
        const tr = document.createElement('tr');
        tr.dataset.id = o.id;

        // Remplissage des cellules avec les données de l'œuvre
        tr.innerHTML = `
            <td class="tdTitre">${o.titre}</td>
            <td class="tdType">${o.type}</td>
            <td class="tdStatut">${o.statut}</td>
            <td class="tdNote">${o.note}</td>
            <td class="tdProgression">${o.progression || '-'}</td>
            <td><button class="btn-suppr" data-id="${o.id}">Supprimer</button></td>
        `;

        // Ajout de l'action de suppression sur le bouton
        tr.querySelector(".btn-suppr").onclick = () => supprimerOeuvre(o.id);

        tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Erreur API:", e);
  }
};

// Fonction pour ajouter une œuvre
async function ajouterOeuvre(){
  // Vérifie que tous les champs obligatoires sont remplis
  if (formAjout.checkValidity()) {
    const noteClean = formAjout.note.value.replace(",", ".");
    
    const data = {
      titre: formAjout.titre.value,
      type: formAjout.type.value,
      statut: formAjout.statut.value,
      note: Number(noteClean),
      progression: formAjout.progression.value || null,
      commentaire: formAjout.commentaire.value || null
    };

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
}

// -------- Fonctions d'interface ---------//

// Fonction de recherche d'œuvre dans le tableau
function rechercheOeuvre() {

  // Récupère le texte dans la barre de recherche puis transformation en minuscules
  const recherche = barreDeRecherche.value.toLowerCase();

  // Sélectionne les lignes du tableau
  const lignes = document.querySelectorAll("#tableauOeuvres tbody tr");

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
}

// -------- Gestion des événements ---------//

//Déclenche la fonction de recheche a chaque modification dans la barre de recherche
barreDeRecherche.addEventListener("input", rechercheOeuvre);

document.querySelector("#btn-add").addEventListener("click", () => {
    popupAjout.showModal();
});

document.querySelector("#btn-fermer-popup").addEventListener("click", () => {
    popupAjout.close();
});

formAjout.addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page et l'erreur de redirection
    
    await ajouterOeuvre(); // Exécute la fonction Fetch
    
    popupAjout.close();    // Ferme le popup
    formAjout.reset();     // Vide les champs
    await chargerOeuvres(); // Rafraîchit le tableau sans recharger la page
});

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

// Ajout d'un evenement sur les cellules du tableau qui permet d'ouvrir des SELECT afin de modifier leur contenu
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
  if (td.classList.contains("tdTitre") || td.classList.contains("tdNote") || td.classList.contains("tdProgression")) {
    modificationCelleluleText(td);
  }
});


function ouvrirSelectDansCellule(td, options) {
  // interdit l'ouverture d'un select par dessus un autre
  if (td.querySelector("select")) return;

  // récupere la valeur affiché dans la cellule
  const valeurInitiale = td.textContent.trim();
  const select = document.createElement("select");

  // création des options contenus dans le select
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    // préselectionne l'option si elle correspond a la valeur actuelle de la cellule
    if (opt === valeurInitiale) option.selected = true;
    select.appendChild(option);
  });


  td.textContent = "";
  td.appendChild(select);
  // focus sur le select quand il a était ouvert
  select.focus();

  select.dataset.hasListerner = "true";

  const valider = async () => {
    const nouvelleValeur = select.value.trim();
    td.textContent = nouvelleValeur;

    if (nouvelleValeur === valeurInitiale) return;

    const tr = td.closest("tr");
    const id = tr.dataset.id;

    let champ;
    if (td.classList.contains("tdType")) champ = "type";
    if (td.classList.contains("tdStatut")) champ = "statut";

    if (!champ) return;


    await fetch(`http://localhost:3000/oeuvres/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [champ]: nouvelleValeur })
    });
  };

  // appel d'api pour modification quand l'utilisateur click hors du select
  select.addEventListener("blur", valider);
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

  // L’input prend toute la largeur de la cellule
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  // Limitation du nombre de caractères selon la colonne
  if (td.classList.contains("tdTitre")) input.maxLength = 55;
  if (td.classList.contains("tdProgression")) input.maxLength = 30;
  if (td.classList.contains("tdNote")) input.maxLength = 9; // ex: 10.00

  // Remplace le contenu de la cellule par l’input
  td.textContent = "";
  td.appendChild(input);

  // Focus automatique
  input.focus();
  input.select();

  // Fonction de validation (appel API)
  const validerTexte = async () => {

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

    if (!champ) return;

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
      td.textContent = nouvelleValeur || "-";

    } catch (error) {
      console.error("Erreur API:", error);

      // Restaure l’ancienne valeur en cas d’erreur
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
      td.textContent = valeurInitiale;
    }
  });
}