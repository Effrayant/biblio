async function afficherOeuvres() {
  const res = await fetch("http://localhost:3000/oeuvres");
  const oeuvres = await res.json();

  const container = document.querySelector('#oeuvres');
  container.innerHTML = "";

  oeuvres.forEach(o => {
    const li = document.createElement('li');
    li.textContent = `${o.titre} (${o.type}) - ${o.statut}`;
    container.appendChild(li);
  });
}

document.getElementById("bouttonChargementOeuvres").onclick = afficherOeuvres;