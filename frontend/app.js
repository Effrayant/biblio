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

    tbody.appendChild(tr);
  });
};

const barreDeRecherche = document.querySelector(".header__search-input")

function rechercheOeuvre() {
  const recherche = barreDeRecherche.value.toLowerCase();
  console.log(recherche);
  const lignes = document.querySelectorAll("#tableauOeuvres tbody tr");
  lignes.forEach(ligne => {
    if (!ligne.cells[0].textContent.toLowerCase().includes(recherche) && !ligne.cells[1].textContent.includes(recherche)){
      ligne.style.display = "none";
    } else{
      ligne.style.display = "";
    }
  });
}
/*
barreDeRecherche.addEventListener("input", rechercheOeuvre);

function ajouterOeuvre(){
  
}

document.querySelector(".btn-add").addEventListener("click", ajouterOeuvre)*/