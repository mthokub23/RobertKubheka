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
        },
        // (external websites moved to 'other' category)
    ],
    writing: [
        {
            id: 'Prose',
            title: 'Building Character',
            description: 'Prose on character development and narrative design',
            skills: ['Fictional Writing'],
            type: 'pdf',
            path: './Content/PDFs/BuildingCharacter_prose.pdf'
        },
        {
             id: 'Script Writing',
             title: 'Metaplogic Script',
             description: 'Script for Metaplogic, a story originally designed as a practice in short story world building, rewritten to be a live action short film script.',
             skills: ['Fictional Writing'],
             type: 'pdf',
             path: './Content/PDFs/Metaplogic_Script.pdf'
        },
        {
            id: 'Short Story Drafting',
            title: 'Metaplogic Draft',
            description: 'Metaplogic base draft.',
            skills: ['Fictional Writing'],
            type: 'pdf',
            path: './Content/PDFs/Metaplogic_Script.pdf'
        },
        // ADDED: informal essay entry (21 March 2025)
        {
            id: 'ai-creativity-2025',
            title: 'How AI Shapes Creativity & Attention (21 Mar 2025)',
            description: 'A reflective, informal essay on AI’s influence on creators and consumers.',
            skills: ['Writing', 'Media Theory'],
            type: 'essay',
            path: './Content/essays/AI-Creativity-Attention-2025.html'
        },
        // NEW: Bloomberg analysis essay
        {
            id: 'bloomberg-bbi-2025',
            title: 'Bloomberg Billionaires: Data, Design & Storytelling (2025)',
            description: 'Analysis of Bloomberg’s Billionaires Index—visualization, interactivity and narrative.',
            skills: ['Data Visualization', 'UX', 'Writing'],
            type: 'essay',
            path: './Content/essays/Bloomberg-Billionaires-Analysis-2025.html'
        }
    ],
    other: [
        {
            id: 'fittrack',
            title: 'FitTrack (FitnessApp Exam)',
            description: 'React fitness & food tracking app — Nutritionix API.',
            skills: ['React','API'],
            type: 'external',
            path: 'https://mthokub23.github.io/fitnessappexam/'
        },
        {
            id: 'gamedex-01',
            title: 'GameDex_01',
            description: 'Gaming database site using RAWG.io API (repo).',
            skills: ['HTML','JS','CSS','API'],
            type: 'external',
            path: 'https://github.com/mthokub23/GameDex_01'
        }
    ]
};

// State
const state = {
    currentProject: null,
    currentCategory: null,
    scrollDepth: 0,
    lastFocusedElement: null // ADDED: track element to restore focus
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
    // If the project is an external link (e.g., a GitHub repo), open in new tab
    if (project.type === 'external') {
        window.open(project.path, '_blank', 'noopener');
        return;
    }
    // ADDED: remember the element that triggered opening so we can restore focus
    state.lastFocusedElement = document.activeElement;

    contentViewer.classList.add('active');
    header.style.opacity = '0.5';
    header.style.pointerEvents = 'none';
    document.body.style.overflow = 'hidden';

    // Load content
    if (project.type === 'interactive' || project.type === 'pdf') {
        viewerContent.innerHTML = `<iframe src="${project.path}" title="${project.title}"></iframe>`;
    } else if (project.type === 'essay') {
        // ADDED: fetch and inject HTML for informal essay (allows custom styles, not a formal article)
        viewerContent.innerHTML = `<div class="loading">Loading…</div>`;
        fetch(project.path)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.text();
            })
            .then(html => {
                // Insert a temporary <base> element so relative URLs inside the
                // fetched essay (images, styles, scripts) resolve against the
                // essay file's directory rather than the host page.
                try {
                    const baseHref = project.path.replace(/[^/]*$/, '');
                    const baseEl = document.createElement('base');
                    baseEl.id = 'injected-base';
                    baseEl.href = baseHref;
                    document.head.appendChild(baseEl);
                } catch (e) {
                    // If anything goes wrong, fall back to injecting without base
                }

                viewerContent.innerHTML = html;
            })
            .catch(() => {
                viewerContent.innerHTML = `
                    <article class="error-state">
                        <h3>Unable to load essay</h3>
                        <p>Sorry — the essay could not be loaded right now.</p>
                        <button id="err-close">Close</button>
                    </article>
                `;
                document.getElementById('err-close')?.addEventListener('click', closeViewer);
            });
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
    // Remove temporary base element if it was added when loading an essay
    const injectedBase = document.getElementById('injected-base');
    if (injectedBase) injectedBase.remove();
    // ADDED: return focus to the previously focused element (the card that opened the viewer)
    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
        state.lastFocusedElement.focus();
    } else {
        // fallback: focus first project card if present
        document.querySelector('.project-card[data-project-id]')?.focus();
    }
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
