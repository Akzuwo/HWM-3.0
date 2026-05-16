// Simple overlay message utility
const OVERLAY_AUTO_HIDE_DELAY = 4000;
let hideTimeoutId = null;

function showOverlay(message, type = 'info') {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        createOverlay();
        overlay = document.getElementById('overlay');
    }
    if (!overlay) {
        console.error('Overlay element konnte nicht erstellt werden.');
        return;
    }

    if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
    }

    const modifierPrefix = 'overlay--';
    const transientClasses = ['overlay--visible', 'overlay--hiding'];
    Array.from(overlay.classList)
        .filter(cls => cls.startsWith(modifierPrefix) && !transientClasses.includes(cls))
        .forEach(cls => overlay.classList.remove(cls));

    overlay.classList.add(`${modifierPrefix}${type}`);
    overlay.classList.remove('overlay--hiding');
    overlay.classList.remove('overlay--visible');
    document.getElementById('overlay-message').textContent = message;
    overlay.style.display = 'block';

    // Force reflow to restart animations when the overlay is shown repeatedly
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.classList.add('overlay--visible');

    hideTimeoutId = window.setTimeout(() => {
        hideOverlay();
    }, OVERLAY_AUTO_HIDE_DELAY);
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (!overlay) {
        return;
    }

    if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
    }

    if (!overlay.classList.contains('overlay--visible')) {
        return;
    }

    overlay.classList.remove('overlay--visible');
    overlay.classList.add('overlay--hiding');

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        overlay.style.display = 'none';
        overlay.classList.remove('overlay--hiding');
    }
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.display = 'none';
    overlay.className = 'overlay';
    overlay.setAttribute('role', 'alert');
    overlay.innerHTML = `
        <div class="overlay-content">
            <p id="overlay-message"></p>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('animationend', (event) => {
        if (event.animationName === 'overlay-toast-out') {
            overlay.style.display = 'none';
            overlay.classList.remove('overlay--hiding');
        }
    });
}

document.addEventListener('DOMContentLoaded', createOverlay);

// expose globally
window.showOverlay = showOverlay;
window.hideOverlay = hideOverlay;
