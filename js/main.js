import { initAStar } from './algorithms/astar.js';
import { initMinimax } from './algorithms/minimax.js';
import { initGraphColoring } from './algorithms/graph.js';

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    
    // Initialize algorithms
    initAStar();
    try { initMinimax(); } catch (e) { console.log('Minimax not ready yet'); }
    try { initGraphColoring(); } catch (e) { console.log('Graph not ready yet'); }
});

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
