// Dark Mode Toggle Functionality
document.getElementById('darkModeToggle').addEventListener('change', function (e) {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load Saved Dark Mode Preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').checked = true;
}

// Dynamic Text Animation
const textElement = document.querySelector('.text-animation');
const texts = ["AutoXploit", "AutoHacker", "Hacking Assistant"]; // Words to cycle through
let index = 0;

function updateText() {
    // Fade out the current text
    textElement.style.opacity = 0;

    setTimeout(() => {
        // Update the text content
        textElement.textContent = texts[index];

        // Restart the animation
        textElement.style.animation = 'none';
        void textElement.offsetWidth; // Trigger reflow to restart animation
        textElement.style.animation = null;

        // Fade in the new text
        textElement.style.opacity = 1;

        // Move to the next word
        index = (index + 1) % texts.length;
    }, 500); // Wait 500ms before updating the text
}

// Change text every 5 seconds
setInterval(updateText, 5000);