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
            <td contenteditable='true'>${o.titre}</td>
            <td class="tdType">${o.type}</td>
            <td class="tdStatut">${o.statut}</td>
            <td contenteditable='true'>${o.note}</td>
            <td contenteditable='true'>${o.progression || '-'}</td>
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

tbody.addEventListener("click", (e) => {
  const td = e.target.closest("td");
  if (!td) return;

  if (td.classList.contains("tdType")) {
    ouvrirSelectDansCellule(td, optionsType);
  }

  if (td.classList.contains("tdStatut")) {
    ouvrirSelectDansCellule(td, optionsStatut);
  }
});

function ouvrirSelectDansCellule(td, options) {
  if (td.querySelector("select")) return;

  const valeurActuelle = td.textContent.trim();
  const select = document.createElement("select");

  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === valeurActuelle) option.selected = true;
    select.appendChild(option);
  });

  td.textContent = "";
  td.appendChild(select);
  select.focus();

  const valider = () => {
    td.textContent = select.value;
  };

  select.addEventListener("change", valider);
  select.addEventListener("blur", valider);
}