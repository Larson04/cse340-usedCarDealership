/**
 * nav.js
 *
 * Handles the mobile slide-out menu toggle.
 *
 * What this script does:
 *   - Adds .is-open to .slide-menu and .slide-overlay when the
 *     hamburger button is clicked, triggering your CSS transitions.
 *   - Removes .is-open when the close button or overlay is clicked.
 *   - Toggles aria-expanded on the hamburger button so your CSS
 *     can target [aria-expanded="true"] for the X animation.
 *   - Closes the menu when the viewport widens past 768px so the
 *     menu state does not persist if the user resizes.
 *
 * This file is complete. Do not modify it.
 */

const navToggle = document.querySelector('.nav-toggle');
const slideMenu = document.querySelector('.slide-menu');
const slideOverlay = document.querySelector('.slide-overlay');
const slideClose = document.querySelector('.slide-menu-close');

/**
 * Opens the slide-out menu.
 */
window.openMenu = () => {
    slideMenu.classList.add('is-open');
    slideOverlay.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
};

/**
 * Closes the slide-out menu.
 */
window.closeMenu = () => {
    slideMenu.classList.remove('is-open');
    slideOverlay.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
};

navToggle.addEventListener('click', () => {
    if (navToggle.getAttribute('aria-expanded') === 'true') {
        window.closeMenu();
    } else {
        window.openMenu();
    }
});

slideClose.addEventListener('click', window.closeMenu);
slideOverlay.addEventListener('click', window.closeMenu);

const mediaQuery = window.matchMedia('(min-width: 768px)');

mediaQuery.addEventListener('change', (event) => {
    if (event.matches) {
        window.closeMenu();
    }
});
