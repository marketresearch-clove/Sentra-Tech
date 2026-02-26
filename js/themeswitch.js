/**
 * Theme Switch Functionality with Rotating Animation
 */

(function () {
    'use strict';

    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const themeSwitch = document.getElementById('themeSwitch');
    const themeIcon = document.getElementById('themeIcon');

    // Apply the saved theme on page load
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Sync with script.js class logic and localStorage key
        if (theme === 'dark') {
            localStorage.removeItem('lightmode');
            if (document.body) {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('lightmode');
            }
        } else {
            localStorage.setItem('lightmode', 'active');
            if (document.body) {
                document.body.classList.add('lightmode');
                document.body.classList.remove('dark-mode');
            }
        }

        // Update icon based on theme
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }

    // Initialize theme
    applyTheme(currentTheme);

    // Theme switch functionality with rotation animation
    if (themeSwitch) {
        themeSwitch.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            // Add rotation animation class
            themeIcon.classList.add('rotating');

            // Apply new theme after a short delay for animation
            setTimeout(() => {
                applyTheme(newTheme);
            }, 200);

            // Remove rotation class after animation completes
            setTimeout(() => {
                themeIcon.classList.remove('rotating');
            }, 600);
        });
    }

    // Add CSS for rotation animation
    const style = document.createElement('style');
    style.textContent = `
        .themeswitch i.rotating {
            animation: themeRotate 0.6s ease-in-out;
        }
        
        @keyframes themeRotate {
            0% {
                transform: rotate(0deg) scale(1);
            }
            50% {
                transform: rotate(180deg) scale(1.2);
            }
            100% {
                transform: rotate(360deg) scale(1);
            }
        }
        
/* ======================================================
   THEME VARIABLES
   ====================================================== */

/* Dark Theme Variables */
[data-theme="dark"] {
    --bg-color: #0e0e0e;
    --text-color: #ffffff;
    --card-bg: #111111;
    --border-color: #404040;
}


/* ======================================================
   THEME SWITCH BUTTON
   ====================================================== */

/* Light Theme – Theme Switch */
[data-theme="light"] .themeswitch {
    background-color: #2d2e2f;
    border: 1px solid #dfcaa0;
    color: #ffffff;
}

[data-theme="light"] .themeswitch:hover {
    background-color: #000000;
    border-color: #dfcaa0;
}


/* Dark Theme – Theme Switch */
[data-theme="dark"] .themeswitch {
    background-color: #121212;
    border: 1px solid #f48120;
    color: #ffffff;
}

[data-theme="dark"] .themeswitch:hover {
    background-color: #1a1a1a;
    border-color: #ff9a3c;
}


/* ======================================================
   CARDS
   ====================================================== */

/* Dark Theme – Cards */
[data-theme="dark"] .card,
[data-theme="dark"] .product-card {
    background-color: var(--card-bg);
    border: 0px solid var(--border-color);
    color: var(--text-color);
}

/* ======================================================
   NAVBAR
   ====================================================== */

/* Active Nav Link – Light Theme */
[data-theme="light"] .navbar-nav .nav-item .nav-link.active {
    color: #ffffffff !important;
}

/* Active Nav Link – Dark Theme */
[data-theme="dark"] .navbar-nav .nav-item .nav-link.active {
    color: #f48120 !important;
}


    `;
    document.head.appendChild(style);

})();