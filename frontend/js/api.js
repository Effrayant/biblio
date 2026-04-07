const API_URL = "http://localhost:3000/oeuvres";
 
async function ajouterOeuvre(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Erreur API pour l'ajout d'oeuvre");
  return res;
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
 
async function supprimerOeuvreAPI(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Échec suppression");
}

export { API_URL, ajouterOeuvre, modifierOeuvre, supprimerOeuvreAPI}