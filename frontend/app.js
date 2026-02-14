window.onload = chargerOeuvres;

async function chargerOeuvres() {
  const res = await fetch("http://localhost:3000/oeuvres");
  const oeuvres = await res.json();

  const tbody = document.querySelector("#tableauOeuvres tbody");
  tbody.innerHTML = "";

  oeuvres.forEach(o => {
    const tr = document.createElement('tr');
    const tdTitre = document.createElement('td');
    tdTitre.textContent = o.titre;
    tr.appendChild(tdTitre);

    const tdType = document.createElement("td");
    tdType.textContent = o.type;
    tr.appendChild(tdType);

    const tdStatut = document.createElement("td");
    tdStatut.textContent = o.statut;
    tr.appendChild(tdStatut);

    const tdNote = document.createElement("td");
    tdNote.textContent = o.note;
    tr.appendChild(tdNote);

    const tdProg = document.createElement("td");
    tdProg.textContent = o.progression;
    tr.appendChild(tdProg);

    const tdOption = document.createElement("td");
    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "Supprimer";
    btnSupprimer.addEventListener("click", () => {
      supprimerOeuvre(o.id);
    });
    tdOption.appendChild(btnSupprimer);
    tr.appendChild(tdOption);

    tbody.appendChild(tr);
  });
};

const barreDeRecherche = document.querySelector(".header__search-input")

function rechercheOeuvre() {
  const recherche = barreDeRecherche.value.toLowerCase();
  const lignes = document.querySelectorAll("#tableauOeuvres tbody tr");
  lignes.forEach(ligne => {
    if (!ligne.cells[0].textContent.toLowerCase().includes(recherche) && !ligne.cells[1].textContent.includes(recherche)){
      ligne.style.display = "none";
    } else{
      ligne.style.display = "";
    }
  });
}

barreDeRecherche.addEventListener("input", rechercheOeuvre);

const noteInput = document.getElementById("note");
let ancienneValeur = "";

noteInput.addEventListener("input", (e) => {
  const v = e.target.value;

  // chiffres obligatoires avant virgule, 2 décimales max
  if (/^\d+([.,]\d{0,2})?$/.test(v) || v === "") {
    ancienneValeur = v;
  } else {
    e.target.value = ancienneValeur;
  }
});

const formAjout = document.querySelector("#formAjouterOeuvre");

async function ajouterOeuvre(){
  console.log(formAjout.note.value);
  if (formAjout.checkValidity()){
    const noteClean = formAjout.note.value.replace(",", ".");
    const data = {
      titre: formAjout.titre.value, 
      type: formAjout.type.value, 
      statut: formAjout.statut.value, 
      note: Number(noteClean),
      progression: formAjout.progression.value || null,
      commentaire: formAjout.commentaire.value || null
    }

    console.log(data.note);

    await fetch("http://localhost:3000/oeuvres", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    formAjout.reset();
    chargerOeuvres();
  }
}

document.querySelector("#btnAjouterOeuvrePopup").addEventListener("click", ajouterOeuvre)

async function supprimerOeuvre(id){
  await fetch(`http://localhost:3000/oeuvres/${id}`, {
    method: "DELETE"
  });
  chargerOeuvres();
}
