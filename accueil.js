document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn");

    // Effet de zoom au survol du bouton
    btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.1)";
    });

    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
    });

    // Effet de texte dynamique
    const text = document.querySelector("p");
    const phrases = [
        "Organisez vos idées en un clic.",
        "Boostez votre productivité.",
        "Une gestion de notes simplifiée.",
        "Un éditeur de code simple.",
        "Tout à portée de main."
    ];
    
    let index = 0;
    setInterval(() => {
        text.textContent = phrases[index];
        index = (index + 1) % phrases.length;
    }, 3000);
});


document.addEventListener("DOMContentLoaded", () => {
    const rainContainer = document.querySelector(".rain-container");

    function createDrop() {
        const drop = document.createElement("div");
        drop.classList.add("drop");
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${2 + Math.random() * 2}s`; // Vitesse variable
        drop.style.opacity = Math.random();
        rainContainer.appendChild(drop);

        setTimeout(() => {
            drop.remove(); // Supprime la goutte après l'animation
        }, 4000);
    }

    setInterval(createDrop, 200); // Ajoute une goutte toutes les 200ms
});

