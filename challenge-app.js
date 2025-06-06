document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.challenge-step');
    const nextButtons = document.querySelectorAll('.challenge-button.next-step');
    // const readyForMusicButton = document.getElementById('ready-for-music-button'); // On peut le garder pour référence si besoin plus tard
    
    let currentStepIndex = 0;

    function showStep(index) {
        console.log(`Affichage de l'étape data-step="${index + 1}" (index JS: ${index})`);
        steps.forEach((step, i) => {
            if (i === index) {
                step.classList.add('active');
                // Focus sur le premier bouton/lien de l'étape active, sauf pour l'étape vidéo
                if (steps[i] && !steps[i].classList.contains('video-player-step')) {
                    const firstFocusable = step.querySelector('button, a');
                    if (firstFocusable) {
                        // Mettre le focus après un court délai pour s'assurer que l'élément est visible et que la transition CSS est terminée
                        setTimeout(() => firstFocusable.focus(), 50); 
                    }
                } else if (steps[i] && steps[i].classList.contains('video-player-step')) {
                    // Pour l'étape vidéo, on peut mettre le focus sur le texte d'instruction ou l'iframe
                    // Pour l'instant, pas de focus auto pour ne pas scroller bizarrement ou lancer la vidéo.
                    // Si on voulait le focus sur l'iframe :
                    // const iframe = steps[i].querySelector('#youtube-video-iframe');
                    // if (iframe) setTimeout(() => iframe.focus(), 50);
                }
            } else {
                step.classList.remove('active');
            }
        });
        currentStepIndex = index;
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentStep = button.closest('.challenge-step');
            // Trouve l'index actuel dans le NodeList 'steps' basé sur l'élément parent
            let clickedStepIndex = Array.from(steps).indexOf(parentStep);

            const nextStepToShow = clickedStepIndex + 1;
            if (nextStepToShow < steps.length) {
                showStep(nextStepToShow);
            } else {
                console.log("C'était le dernier bouton 'next-step'.");
            }
        });
    });

    // Pas besoin de la logique de l'API YouTube (YT.Player, onReady, onStateChange, etc.)

    // Initialiser la première étape
    if (steps.length > 0) {
        showStep(0);
    }
});