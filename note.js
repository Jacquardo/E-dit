const notes = JSON.parse(localStorage.getItem('notes')) || [];
let isEditing = false;
let currentEditIndex = null;


const getById = id => document.getElementById(id);

function sanitizeHTML(input) {
    const temp = document.createElement('div');
    temp.innerHTML = input;

    const allowedTags = ['b', 'i', 'u', 'ul', 'li', 'input', 'br'];
    const allowedAttributes = ['type'];

    temp.querySelectorAll('*').forEach(node => {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
            node.replaceWith(...node.childNodes);
        } else {
            [...node.attributes].forEach(attr => {
                if (!allowedAttributes.includes(attr.name)) {
                    node.removeAttribute(attr.name);
                }
            });
        }
    });

    return temp.innerHTML.trim();
}

function afficherTexteAvecSautsDeLigne(texte) {
    return sanitizeHTML(texte).replace(/\n/g, '<br>'); // Gère les sauts de ligne
}

function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function addNote() {
    const title = sanitizeHTML(getById('noteTitle').value);
    const content = sanitizeHTML(getById('noteContent').innerHTML);

    if (title && content) {
        const id = Date.now(); // Génère un identifiant unique
        if (!isEditing) {
            notes.push({ id, title, content }); // Ajoute l'ID aux données
        } else {
            notes[currentEditIndex] = { id: notes[currentEditIndex].id, title, content }; // Conserve l'ID
            isEditing = false;
            currentEditIndex = null;
        }
        updateList();
        saveToLocalStorage();
        updateFile(); // Sauvegarde dans le fichier automatiquement
        clearFields();
        displayError(false);
    } else {
        displayError(true);
    }
}


function displayError(show) {
    const errorMessage = getById('errorMessage');
    if (show) {
        errorMessage.style.display = 'block';
        getById('noteTitle').classList.add('error');
        getById('noteContent').classList.add('error');
    } else {
        errorMessage.style.display = 'none';
        getById('noteTitle').classList.remove('error');
        getById('noteContent').classList.remove('error');
    }
}

function editNote(index) {
    isEditing = true;
    currentEditIndex = index;
    getById('noteTitle').value = sanitizeHTML(notes[index].title); // Garde le titre propre
    getById('noteContent').innerHTML = sanitizeHTML(notes[index].content); // Utilise innerHTML pour afficher correctement le contenu
    getById('actionButton').textContent = 'Mettre à jour';
    getById('cancelButton').style.display = 'inline-block';
    getById('searchBar').disabled = true;
}

function cancelEdit() {
    isEditing = false;
    currentEditIndex = null;
    getById('actionButton').textContent = 'Ajouter';
    getById('cancelButton').style.display = 'none';
    getById('searchBar').disabled = false;
    clearFields();
}

function deleteNote(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        notes.splice(index, 1);
        updateList();
        saveToLocalStorage();
    }
}

function updateList(query = '') {
    const noteList = getById('noteList');
    noteList.innerHTML = ''; // Réinitialise la liste des notes

    notes
        .filter(note => 
            note.title.toLowerCase().includes(query) // Filtre uniquement par le titre
        )
        .forEach((note, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div onclick="openModal(notes[${index}])">
                    <strong>${sanitizeHTML(note.title)}</strong> <!-- Seul le titre est affiché -->
                </div>
                <div>
                    <button class="btn-add" onclick="editNote(${index}); event.stopPropagation();">Modifier</button>
                    <button class="btn-delete" onclick="deleteNote(${index}); event.stopPropagation();">Supprimer</button>
                </div>
            `;
            noteList.appendChild(li); // Ajoute chaque titre à la liste
        });

    if (notes.length === 0 || noteList.innerHTML === '') {
        noteList.innerHTML = '<p>Aucune note trouvée.</p>'; // Message si aucune note
    }
}


function openModal(note) {
    const modal = getById('modal');
    getById('modalTitle').textContent = sanitizeHTML(note.title);
    getById('modalContent').innerHTML = afficherTexteAvecSautsDeLigne(note.content); // Gère les sauts de ligne
    modal.style.display = 'block';
    getById('overlay').style.display = 'block';
}

function openModal(note) {
    const modal = getById('modal');
    const overlay = getById('overlay');

    getById('modalTitle').textContent = sanitizeHTML(note.title);
    getById('modalContent').innerHTML = afficherTexteAvecSautsDeLigne(note.content);

    modal.classList.add('show'); // Ajoute la classe pour afficher la modale
    overlay.style.display = 'block'; // Affiche l'arrière-plan sombre
}



function closeModal() {
    getById('modal').style.display = 'none';
    getById('overlay').style.display = 'none';
}

function applyStyle(style) {
    const editor = getById('noteContent');
    editor.focus();
    document.execCommand(style, false, null);
}

function addBullet() {
    const editor = getById('noteContent');
    document.execCommand('insertUnorderedList', false, null);
}

function addCheckbox() {
    const editor = getById('noteContent');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    editor.appendChild(checkbox);
    editor.innerHTML += ' '; // Ajoute un espace après la case à cocher
}

function searchNotes() {
    const query = getById('searchBar').value.toLowerCase();
    console.log(`Requête de recherche : ${query}`); // Debug
    updateList(query);
}



function clearFields() {
    getById('noteTitle').value = '';
    getById('noteContent').innerHTML = ''; // Réinitialise le contenu riche
}

// Sauvegarde auto
let fileHandle = null;

async function requestFileAccess() {
    try {
        fileHandle = await window.showSaveFilePicker({
            suggestedName: "mes_notes.txt",
            types: [
                {
                    description: "Fichier texte",
                    accept: { "text/plain": [".txt"] }
                }
            ]
        });
        alert("Fichier créé avec succès !");
        updateFile();
    } catch (err) {
        console.error("Accès refusé ou erreur : ", err);
    }
}

async function updateFile() {
    if (!fileHandle) {
        console.error("Aucun fichier sélectionné pour la sauvegarde.");
        return;
    }
    const writable = await fileHandle.createWritable();
    const contenu = notes.map(note => `Titre : ${note.title}\nContenu : ${note.content}\n\n`).join("");
    await writable.write(contenu);
    await writable.close();
    console.log("Fichier mis à jour avec succès !");
}









// Gestion du thème Dark/Clair
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = getById('themeToggle');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Mode clair';
    }
    updateList();
});

getById('themeToggle').addEventListener('click', () => {
    const body = document.body;
    const themeToggle = getById('themeToggle');
    const isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '☀️ Mode clair' : '🌙 Mode sombre';
});

function refreshPage() {
    updateList(); // Met simplement à jour la liste
}

document.addEventListener('DOMContentLoaded', () => {
    getById('refreshButton').addEventListener('click', refreshPage);
});




function closeModal() {
    const modal = getById('modal');
    const overlay = getById('overlay');

    modal.classList.remove('show'); // Retire la classe pour masquer la modale
    overlay.style.display = 'none'; // Cache l'arrière-plan sombre
}


function copyNoteContent() {
    const modalContent = getById('modalContent'); // Récupère le contenu de la modale
    const copyButton = getById('copy'); // Récupère le bouton "Copier le contenu"

    // Crée un élément temporaire pour sélectionner le contenu HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = modalContent.innerHTML; // Copie le HTML enrichi
    tempElement.style.position = 'absolute'; // Position hors du visible
    tempElement.style.left = '-9999px'; // Position hors de la vue
    document.body.appendChild(tempElement); // Ajoute temporairement à la page

    // Sélectionne et copie le contenu
    const range = document.createRange();
    range.selectNodeContents(tempElement); // Sélectionne le contenu HTML
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy'); // Copie dans le presse-papier

        // Change le texte du bouton
        copyButton.textContent = '✅ Copié !!';

        // Réinitialise le texte du bouton après 15 secondes
        setTimeout(() => {
            copyButton.textContent = '📋 Copier';
        }, 2000);
    } catch (err) {
        alert('Échec de la copie. Veuillez réessayer.');
    }

    // Nettoie après la copie
    selection.removeAllRanges();
    tempElement.remove(); // Supprime l'élément temporaire
}



// modal connexion
window.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("loginModal");
  const form = document.getElementById("loginForm");
  const logoutButton = document.getElementById("logoutButton");
  const rememberMeCheckbox = document.getElementById("rememberMe");
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");

  // Afficher la modale au chargement de la page
  modal.style.display = "block";
  document.body.classList.add("modal-active");

  // Charger les identifiants sauvegardés
  const savedUsername = localStorage.getItem("username");
  const savedPassword = localStorage.getItem("password");
  const rememberMe = localStorage.getItem("rememberMe") === "true";

  if (rememberMe && savedUsername && savedPassword) {
    usernameField.value = savedUsername;
    passwordField.value = savedPassword;
    rememberMeCheckbox.checked = true;
  }

  // Gérer la soumission du formulaire
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameField.value;
    const password = passwordField.value;

    if (username === "admin" && password === "edit2025E") {
      alert("Connexion réussie !");
      modal.style.display = "none"; // Fermer la modale
      document.body.classList.remove("modal-active");

      // Sauvegarder les identifiants si "Se souvenir de moi" est coché
      if (rememberMeCheckbox.checked) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem("rememberMe", true);
      } else {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.setItem("rememberMe", false);
      }
    } else {
      alert("Identifiants incorrects. Veuillez réessayer.");
    }
  });

  // Gérer la déconnexion
logoutButton.addEventListener("click", () => {
  modal.style.display = "block"; // Réafficher la modale
  document.body.classList.add("modal-active");

  // Vérification de "Se souvenir de moi"
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  
  if (!rememberMe) {
    usernameField.value = ""; // Réinitialiser le champ utilisateur
    passwordField.value = ""; // Réinitialiser le champ mot de passe
  }
  });
});

      
  

