import { initAStar } from './algorithms/astar.js';
import { initMinimax } from './algorithms/minimax.js';
import { initGraphColoring } from './algorithms/graph.js';

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

    // Initialize algorithms
    initAStar();
    try { initMinimax(); } catch (e) { console.log('Minimax not ready yet'); }
    try { initGraphColoring(); } catch (e) { console.log('Graph not ready yet'); }

    setupThemeSwitcher();
});

function setupThemeSwitcher() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    const body = document.body;

    // Load saved theme if any
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            localStorage.setItem('app-theme', theme);
        });
    });

    function setTheme(id) {
        // Remove existing theme classes
        body.classList.remove('theme-2', 'theme-3');

        // Update active button state
        themeBtns.forEach(b => {
            b.classList.remove('active');
            b.style.border = 'none'; // Reset border
        });

        const activeBtn = document.querySelector(`.theme-btn[data-theme="${id}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.border = '2px solid white';
        }

        // Apply new theme class if not default (1)
        if (id === '2') body.classList.add('theme-2');
        if (id === '3') body.classList.add('theme-3');
    }
}

function setupNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.algo-section');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // Update active button
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active section
            sections.forEach(s => {
                s.classList.add('hidden');
                s.classList.remove('active');
                if (s.id === targetId) {
                    s.classList.remove('hidden');
                    // Small timeout to allow display:block to apply before opacity transition
                    setTimeout(() => s.classList.add('active'), 10);
                }
            });
        });
    });
}
