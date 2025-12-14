// Project data structure
const projects = {
    games: [
        {
            id: 'ai-story',
            title: 'AI-Generated Story',
            description: 'An interactive narrative experience powered by AI',
            skills: ['writing', 'web', 'game-design'],
            type: 'interactive',
            path: './Content/interactive stories/AI-Generated-Story.html'
        },
        {
            id: 'library',
            title: 'The Library',
            description: 'An immersive story-driven interactive experience',
            skills: ['writing', 'web', 'game-design'],
            type: 'interactive',
            path: './Content/interactive stories/The-Library.html'
        }
    ],
    writing: [
        {
            id: 'building-character',
            title: 'Building Character',
            description: 'Prose on character development and narrative design',
            skills: ['writing'],
            type: 'pdf',
            path: './Content/PDFs/BuildingCharacter_prose.pdf'
        }
    ],
    other: []
};

// State
const state = {
    currentProject: null,
    currentCategory: null,
    scrollDepth: 0
};

// DOM Elements
const contentViewer = document.getElementById('content-viewer');
const viewerContent = document.getElementById('viewer-content');
const closeButton = document.getElementById('close-viewer');
const footer = document.getElementById('footer');
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    setupEventListeners();
    setupKeyboardNavigation();
    setupScrollObserver();
    setupFooterBlending();
});

// Render projects dynamically
function renderProjects() {
    Object.entries(projects).forEach(([category, items]) => {
        const grid = document.getElementById(`${category}-grid`);
        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = '<p class="empty-state">Coming soon...</p>';
            return;
        }

        grid.innerHTML = items.map(project => `
            <article 
                class="project-card" 
                data-project-id="${project.id}"
                tabindex="0"
                role="button"
                aria-label="${project.title}: ${project.description}"
            >
                <div>
                    <h4 class="project-title">${project.title}</h4>
                    <p class="project-description">${project.description}</p>
                </div>
                <div class="project-skills">
                    ${project.skills.map(skill => `<span class="skill-tag">${getSkillLabel(skill)}</span>`).join('')}
                </div>
            </article>
        `).join('');

        // Attach click and keyboard handlers
        grid.querySelectorAll('.project-card').forEach((card, index) => {
            const project = items[index];
            card.addEventListener('click', () => openProject(project));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProject(project);
                }
            });
        });
    });
}

// Get human-readable skill labels
function getSkillLabel(skillId) {
    const labels = {
        'writing': 'Writing',
        'web': 'Web Dev',
        'game-design': 'Game Design',
        'video': 'Video'
    };
    return labels[skillId] || skillId;
}

// Open project in viewer
function openProject(project) {
    state.currentProject = project;
    contentViewer.classList.add('active');
    header.style.opacity = '0.5';
    header.style.pointerEvents = 'none';
    document.body.style.overflow = 'hidden';

    // Load content
    if (project.type === 'interactive') {
        viewerContent.innerHTML = `<iframe src="${project.path}" title="${project.title}"></iframe>`;
    } else if (project.type === 'pdf') {
        viewerContent.innerHTML = `<iframe src="${project.path}" title="${project.title}"></iframe>`;
    }

    // Focus management
    closeButton.focus();
    
    // Announce to screen readers
    contentViewer.setAttribute('aria-live', 'polite');
    contentViewer.setAttribute('aria-label', `Viewing ${project.title}`);
}

// Close viewer
function closeViewer() {
    contentViewer.classList.remove('active');
    viewerContent.innerHTML = '';
    header.style.opacity = '1';
    header.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    state.currentProject = null;
    
    // Return focus to the card that was opened
    document.querySelector('.project-card[data-project-id]')?.focus();
}

// Setup event listeners
function setupEventListeners() {
    closeButton.addEventListener('click', closeViewer);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = document.querySelector(link.getAttribute('href'));
            section?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Close viewer with Escape
        if (e.key === 'Escape' && state.currentProject) {
            closeViewer();
        }

        // Skip to main content with keyboard shortcut
        if (e.key === 's' && e.ctrlKey) {
            document.querySelector('main')?.focus();
        }

        // Section navigation with Alt+number
        if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
            const sections = ['hero', 'projects', 'skills', 'about'];
            const sectionId = sections[parseInt(e.key) - 1];
            const section = document.getElementById(sectionId);
            section?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Arrow key navigation within project grids
    document.addEventListener('keydown', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        
        const activeElement = document.activeElement;
        if (!activeElement?.classList.contains('project-card')) return;

        e.preventDefault();
        const grid = activeElement.closest('.project-grid');
        const cards = Array.from(grid.querySelectorAll('.project-card'));
        const currentIndex = cards.indexOf(activeElement);
        
        let nextCard = null;
        const cols = Math.ceil(grid.offsetWidth / (300 + 32)); // approximate column count

        if (e.key === 'ArrowRight') {
            nextCard = cards[currentIndex + 1];
        } else if (e.key === 'ArrowLeft') {
            nextCard = cards[currentIndex - 1];
        } else if (e.key === 'ArrowDown') {
            nextCard = cards[currentIndex + cols];
        } else if (e.key === 'ArrowUp') {
            nextCard = cards[currentIndex - cols];
        }

        nextCard?.focus();
    });
}

// Smooth scroll observer for interactive elements
function setupScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll('.project-card, .skill-group, .about-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Footer blending effect - appears as user scrolls down
function setupFooterBlending() {
    const scrollThreshold = document.documentElement.scrollHeight - window.innerHeight - 200;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Show footer when near bottom
        if (scrolled > scrollThreshold) {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }

        // Track scroll depth for analytics
        state.scrollDepth = Math.round((scrolled / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    });
}

// 404 Fallback
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IFRAME') {
        e.target.outerHTML = `
            <article class="error-state">
                <h3>Unable to load content</h3>
                <p>The requested file could not be found. It may have been moved or deleted.</p>
                <button onclick="closeViewer()" class="error-retry">Close</button>
            </article>
        `;
    }
}, true);

// Expose closeViewer globally for error fallback
window.closeViewer = closeViewer;
