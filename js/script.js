// ─── GitHub Config ─────────────────────────────────────────────────────────
const GITHUB_USER = 'MartinPentito';

// ─── Tech Icon Map (Boxicons) ───────────────────────────────────────────────────
const TECH_ICON_MAP = {
    'html':        'bx bxl-html5',
    'css':         'bx bxl-css3',
    'javascript':  'bx bxl-javascript',
    'python':      'bx bxl-python',
    'sql':         'bx bxs-data',
    'wordpress':   'bx bxl-wordpress',
    'git':         'bx bxl-git',
    'github':      'bx bxl-github',
    'vscode':      'bx bxl-visual-studio',
    'visual studio code': 'bx bxl-visual-studio',
    'xampp':       'bx bx-server',
    'phpmyadmin':  'bx bx-table',
    'windows':     'bx bxl-windows',
    'mobile':      'bx bx-mobile-alt',
    'tailwind':    'bx bxl-tailwind-css',
    'react':       'bx bxl-react',
    'nodejs':      'bx bxl-nodejs',
    'php':         'bx bxl-php',
};

// ─── DOM References ──────────────────────────────────────────────────────────
const stateElements = {
    sidebar: document.getElementById('sidebar-content'),
    main: document.getElementById('main-content'),
    loading: document.getElementById('loading-state'),
    profileImage: document.getElementById('profile-image'),
    profileFallback: document.getElementById('profile-fallback'),
    sectionNav: document.getElementById('section-nav'),
    statusbar: document.getElementById('statusbar')
};

document.addEventListener('DOMContentLoaded', () => {
    initializeProfileImageFallback();
    loadPortfolio();
});

async function loadPortfolio() {
    try {
        const dataPromise = fetchData();
        const reposPromise = fetchGitHubRepos();
        await animateBootSequence();
        const [data, repos] = await Promise.all([dataPromise, reposPromise.catch(() => [])]);
        renderPortfolio(data, repos);
    } catch (error) {
        showError(error);
        console.error('Error al cargar el portfolio:', error);
    }
}

async function fetchData() {
    const response = await fetch('data/data.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`No se pudo cargar data.json (${response.status})`);
    }
    return response.json();
}

async function fetchGitHubRepos() {
    const response = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
    );
    if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
    return response.json();
}

function getPublicRepos(repos) {
    return repos.filter(r => !r.private && r.has_pages);
}

async function animateBootSequence() {
    const el = stateElements.loading;
    el.innerHTML = '';

    const messages = [
        { text: '$ python portfolio.py',       cls: 'boot-line' },
        { text: 'Loading modules...',           cls: 'boot-line' },
        { text: 'Fetching profile data...',     cls: 'boot-line' },
        { text: 'Connecting to GitHub API...',  cls: 'boot-line' },
        { text: '\u2713  Ready',               cls: 'boot-line done' }
    ];

    for (const { text, cls } of messages) {
        const line = document.createElement('div');
        line.className = cls;
        el.appendChild(line);
        await typeText(line, text);
        await sleep(70);
    }
}

async function typeText(el, text) {
    for (const char of text) {
        el.textContent += char;
        await sleep(10);
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function renderPortfolio(data, repos = []) {
    document.title = `${data.personal.name} - Portfolio`;
    stateElements.profileImage.alt = data.personal.name;
    stateElements.profileImage.src = data.personal.photo || 'profile.jpg';
    stateElements.profileFallback.textContent = getInitials(data.personal.name);

    stateElements.sidebar.innerHTML = buildSidebar(data);
    stateElements.main.innerHTML = buildMainContent(data, repos);
    stateElements.loading.hidden = true;
    stateElements.main.hidden = false;

    animateCodeLines();
    initStatusBar();
    initializeInteractions();
    startTypingAnimation(data);
    initCounterAnimation();
}

function buildSidebar(data) {
    const name = escapeHtml(data.personal.name);

    const nameBlock = `
        <div class="sidebar-name">${name}</div>
        <div class="sidebar-title"><span class="typing-text"></span><span class="typing-cursor">|</span></div>
    `;

    return nameBlock + createMediaSection(data.media);
}

// ─── Typing Animation (sidebar title) ──────────────────
function startTypingAnimation(data) {
    const textEl = document.querySelector('.typing-text');
    if (!textEl) return;

    const roles = (data.personal.title || '')
        .split('·')
        .map(r => r.trim())
        .filter(Boolean);

    if (!roles.length) return;

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
        const current = roles[roleIndex];
        if (isDeleting) {
            charIndex--;
            textEl.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(tick, 400);
                return;
            }
            setTimeout(tick, 40);
        } else {
            charIndex++;
            textEl.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(tick, 1800);
                return;
            }
            setTimeout(tick, 70);
        }
    }

    setTimeout(tick, 500);
}

// ─── Animated Counters ──────────────────────────────────
function initCounterAnimation() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
        const target = parseInt(el.dataset.countTo, 10);
        if (!Number.isFinite(target) || target <= 0) {
            el.textContent = target || 0;
            return;
        }
        let current = 0;
        const step = Math.max(Math.ceil(target / 60), 1);
        const update = () => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current < target) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    });
}

// ─── Main Content ────────────────────────────────────────
function buildMainContent(data, repos = []) {
    const publicRepos = getPublicRepos(repos);
    const sections = [
        { id: 'profile',    label: 'PROFILE',    lines: buildProfileLines(data) },
        { id: 'stack',      label: 'STACK',      lines: buildStackLines(data) },
        { id: 'stats',      label: 'STATS',      lines: buildStatsLines(data, publicRepos) },
        { id: 'experience', label: 'EXPERIENCE', lines: buildExperienceLines(data) },
        { id: 'education',  label: 'EDUCATION',  lines: buildEducationLines(data) },
        { id: 'services',   label: 'SERVICES',   lines: buildServicesLines(data) },
        { id: 'projects',   label: 'PROJECTS',   lines: buildProjectsLines(data, publicRepos) }
    ];

    stateElements.sectionNav.innerHTML = sections
        .map(s => `<a class="nav-tab" href="#${s.id}">${s.label}</a>`)
        .join('');
    stateElements.sectionNav.hidden = false;

    return sections
        .map(s => `<div class="code-section" id="${s.id}">${s.lines.join('')}</div>`)
        .join('');
}

function buildProfileLines(data) {
    const lines = [];
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Profile</span><span class="operator">:</span>'));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"""${escapeHtml(data.summary)}"""</span>`));
    lines.push(blankLine());
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">NAME</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.name)}"</span>`));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">TITLE</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.title)}"</span>`));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">FOCUS</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.focus)}"</span>`));

    if (data.personal.location) {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">LOCATION</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.location)}"</span>`));
    }

    if (data.personal.email) {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">EMAIL</span> <span class="operator">=</span> <span class="string copyable" data-copy="${escapeAttribute(data.personal.email)}">"${escapeHtml(data.personal.email)}"</span>`));
    }

    if (data.profile && data.profile.length) {
        lines.push(blankLine());
        const traits = data.profile.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">traits</span> <span class="operator">=</span> <span class="bracket">[</span>${traits}<span class="bracket">]</span>`));
    }

    if (data.languages && data.languages.length) {
        lines.push(blankLine());
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">languages</span> <span class="operator">=</span> <span class="bracket">{</span>`));
        data.languages.forEach((lang) => {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"${escapeHtml(lang.name)}"</span><span class="operator">:</span> <span class="string">"${escapeHtml(lang.level)}"</span><span class="operator">,</span>`));
        });
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="bracket">}</span>`));
    }

    return lines;
}

function buildStackLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Stack</span><span class="operator">:</span>'));

    if (data.techStack && data.techStack.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Lenguajes y tecnologías'));
        const tech = data.techStack.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tech_stack</span> <span class="operator">=</span> <span class="bracket">[</span>${tech}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.techStack));
    }

    if (data.platforms && data.platforms.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Plataformas'));
        const plat = data.platforms.map(p => `<span class="string">"${escapeHtml(p)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">platforms</span> <span class="operator">=</span> <span class="bracket">[</span>${plat}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.platforms));
    }

    if (data.tools && data.tools.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Herramientas'));
        const tools = data.tools.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tools</span> <span class="operator">=</span> <span class="bracket">[</span>${tools}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.tools));
    }

    if (data.media && data.media.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Links'));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">links</span> <span class="operator">=</span> <span class="bracket">{</span>`));
        data.media.forEach((item) => {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"${escapeHtml(item.label)}"</span><span class="operator">:</span> <a class="string" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">"${escapeHtml(item.url)}"</a><span class="operator">,</span>`));
        });
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="bracket">}</span>`));
    }

    return lines;
}

function buildStatsLines(data, repos = []) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Stats</span><span class="operator">:</span>'));
    lines.push(blankLine());
    lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Métricas'));
    lines.push(blankLine());

    const yearsExp = new Date().getFullYear() - 2020;
    const techCount = (data.techStack || []).length;
    const projectCount = repos.length || (data.projects || []).length;

    const stats = [
        { icon: 'bx bx-calendar',       label: 'years_of_experience', value: yearsExp },
        { icon: 'bx bx-code-curly',     label: 'technologies',        value: techCount },
        { icon: 'bx bxl-github',        label: 'github_projects',     value: projectCount },
    ];

    lines.push(statGridLine(stats));

    return lines;
}

function buildExperienceLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Experience</span><span class="operator">:</span>'));

    if (!data.experience || !data.experience.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Historial laboral'));

    const cards = data.experience.map(job => `<div class="entry-card">
            <div class="entry-header">
                <span class="entry-title">${escapeHtml(job.role)}</span>
                <span class="entry-period">${escapeHtml(job.period)}</span>
            </div>
            <div class="entry-meta">${escapeHtml(job.company)}</div>
            ${job.description ? `<div class="entry-desc">"${escapeHtml(job.description)}"</div>` : ''}
        </div>`).join('');

    lines.push(cardGridLine(cards));

    return lines;
}

function buildEducationLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Education</span><span class="operator">:</span>'));

    if (!data.education || !data.education.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Formación académica'));

    const cards = data.education.map(edu => `<div class="entry-card">
            <div class="entry-header">
                <span class="entry-title">${escapeHtml(edu.title)}</span>
                <span class="entry-period">${escapeHtml(edu.period)}</span>
            </div>
            <div class="entry-meta">${escapeHtml(edu.institution)}</div>
            ${edu.description ? `<div class="entry-desc"># ${escapeHtml(edu.description)}</div>` : ''}
        </div>`).join('');

    lines.push(cardGridLine(cards));

    return lines;
}

function buildServicesLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Services</span><span class="operator">:</span>'));

    if (!data.services || !data.services.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Servicios ofrecidos'));

    const cards = data.services.map(service => `<div class="entry-card">
            <div class="entry-title">${escapeHtml(service.title)}</div>
            ${service.description ? `<div class="entry-desc" style="margin-top:6px">"${escapeHtml(service.description)}"</div>` : ''}
        </div>`).join('');

    lines.push(cardGridLine(cards));

    return lines;
}

function buildProjectsLines(data, repos = []) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Projects</span><span class="operator">:</span>'));
    lines.push(blankLine());

    const projects = repos.length > 0
        ? repos.map(r => ({
            name: r.name,
            description: r.description || '',
            type: 'GitHub · GitHub Pages',
            stack: r.topics || [],
            url: r.homepage || `https://${GITHUB_USER.toLowerCase()}.github.io/${r.name}/`,
            repoUrl: r.html_url,
            updated: r.updated_at
        }))
        : (data.projects || []);

    if (!projects.length) {
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# No se encontraron proyectos'));
        return lines;
    }

    lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Proyectos públicos'));

    const cards = projects.map(project => {
        const date = project.updated
            ? new Date(project.updated).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
            : '';
        const tags = project.stack && project.stack.length
            ? `<div class="entry-tags">${project.stack.map(t => `<span class="entry-tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';
        const links = [
            project.url ? `<a class="entry-link" href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">_live ↗</a>` : '',
            project.repoUrl ? `<a class="entry-link" href="${escapeAttribute(project.repoUrl)}" target="_blank" rel="noreferrer">_repo ↗</a>` : ''
        ].filter(Boolean).join('');
        return `<div class="entry-card">
            <div class="entry-header">
                <span class="entry-title">${escapeHtml(project.name)}</span>
                ${date ? `<span class="entry-period">${date}</span>` : ''}
            </div>
            ${project.type ? `<div class="entry-meta">${escapeHtml(project.type)}</div>` : ''}
            ${project.description ? `<div class="entry-desc">"${escapeHtml(project.description)}"</div>` : ''}
            ${tags}
            ${links ? `<div class="entry-links">${links}</div>` : ''}
        </div>`;
    }).join('');

    lines.push(cardGridLine(cards));

    return lines;
}

const MEDIA_ICONS = {
    linkedin: `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    github:   `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    default:  `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 3a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 2 0v1h2V4a1 1 0 0 1 1-1zM7 9v9h10V9H7z"/></svg>`
};

function getMediaIcon(item) {
    const key = (item.label + item.url).toLowerCase();
    if (key.includes('linkedin')) return MEDIA_ICONS.linkedin;
    if (key.includes('github'))   return MEDIA_ICONS.github;
    return MEDIA_ICONS.default;
}

function createMediaSection(media = []) {
    if (!media.length) {
        return '';
    }

    const content = media.map((item) => {
        const label = escapeHtml(item.label);
        const url = escapeAttribute(item.url);
        const icon = getMediaIcon(item);
        return `<div class="enum-item"><a class="media-link" href="${url}" target="_blank" rel="noreferrer">${icon}<span>${label}</span></a></div>`;
    }).join('');

    return `<div class="section"><div class="section-title">media:</div><div class="enum-content">${content}</div></div>`;
}

function codeLine(content) {
    return `<div class="code-line"><div class="line-number"></div><div class="code">${content}</div></div>`;
}

function skillGridLine(items) {
    const badges = items.map(name => {
        const key = name.toLowerCase();
        const iconClass = TECH_ICON_MAP[key] || 'bx bx-code-alt';
        return `<div class="skill-badge"><i class="${iconClass} skill-icon"></i><span class="skill-label">${escapeHtml(name)}</span></div>`;
    }).join('');
    return `<div class="code-line skill-grid-line"><div class="line-number"></div><div class="code skill-grid">${badges}</div></div>`;
}

function statGridLine(stats) {
    const cards = stats.map(({ icon, label, value }) =>
        `<div class="stat-card">
            <i class="${icon} stat-icon"></i>
            <span class="stat-number" data-count-to="${value}">0</span>
            <span class="stat-label">${escapeHtml(label)}</span>
        </div>`
    ).join('');
    return `<div class="code-line stat-grid-line"><div class="line-number"></div><div class="code stat-grid">${cards}</div></div>`;
}

function commentLine(text) {
    return codeLine(`<span class="comment">${text}</span>`);
}

function blankLine() {
    return codeLine('');
}

function cardGridLine(cardsHtml) {
    return `<div class="code-line card-grid-line"><div class="line-number"></div><div class="code card-grid">${cardsHtml}</div></div>`;
}

function animateCodeLines() {
    const lines = document.querySelectorAll('.code-line');

    lines.forEach((line, index) => {
        const lineNumber = line.querySelector('.line-number');
        if (lineNumber) {
            lineNumber.textContent = index + 1;
        }

        line.style.opacity = '0';
        line.style.animation = `slideIn 0.35s ease-out ${index * 0.02}s forwards`;
    });

    const lastContentLine = Array.from(lines).reverse()
        .find(l => l.querySelector('.code')?.textContent.trim());
    if (lastContentLine) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '\u258c';
        lastContentLine.querySelector('.code').appendChild(cursor);
    }
}

function initializeInteractions() {
    document.querySelectorAll('[data-copy]').forEach((element) => {
        element.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(element.dataset.copy);
                showToast('Dato copiado al portapapeles');
            } catch (error) {
                console.error('No se pudo copiar el dato:', error);
            }
        });
    });

    const mainContent = document.querySelector('.main-content');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = Array.from(document.querySelectorAll('.code-section'));

    function isContainerScrollable() {
        return mainContent.scrollHeight > mainContent.clientHeight;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(tab.getAttribute('href').slice(1));
            if (!target) return;
            if (isContainerScrollable()) {
                // Scroll interno del contenedor
                const offset = target.getBoundingClientRect().top
                    - mainContent.getBoundingClientRect().top
                    + mainContent.scrollTop - 10;
                mainContent.scrollTo({ top: offset, behavior: 'smooth' });
            } else {
                // Fallback: el body/window scrollea (mobile sin altura acotada)
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 16,
                    behavior: 'smooth'
                });
            }
        });
    });

    function updateActiveTab() {
        const scrollable = isContainerScrollable();
        const containerTop = scrollable ? mainContent.getBoundingClientRect().top : 0;
        const atBottom = scrollable
            ? mainContent.scrollHeight - mainContent.scrollTop - mainContent.clientHeight < 4
            : document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 4;

        let activeId = atBottom
            ? sections[sections.length - 1]?.id
            : sections[0]?.id;

        if (!atBottom) {
            for (const section of sections) {
                if (section.getBoundingClientRect().top - containerTop <= 60) {
                    activeId = section.id;
                }
            }
        }
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('href') === `#${activeId}`);
        });
        const sbSection = document.getElementById('sb-section');
        if (sbSection && activeId) {
            sbSection.textContent = activeId.toUpperCase();
        }
    }

    mainContent.addEventListener('scroll', updateActiveTab);
    window.addEventListener('scroll', updateActiveTab, { passive: true });
    updateActiveTab();
}

function initializeProfileImageFallback() {
    stateElements.profileImage.addEventListener('error', () => {
        stateElements.profileImage.closest('.profile-frame').classList.add('missing-image');
    });
}

function initStatusBar() {
    const totalLines = document.querySelectorAll('.code-line').length;
    stateElements.statusbar.innerHTML = `
        <div class="statusbar-left">
            <span class="statusbar-item">🐍 Python 3</span>
            <span class="statusbar-item">UTF-8</span>
            <span class="statusbar-item">${totalLines} lines</span>
        </div>
        <div class="statusbar-right">
            <span class="statusbar-item" id="sb-section">PROFILE</span>
        </div>
    `;
    stateElements.statusbar.hidden = false;
}

function showError(error) {
    const hint = window.location.protocol === 'file:'
        ? ' Abrilo con Live Server o un servidor local para permitir la carga de data.json.'
        : '';

    stateElements.loading.textContent = `No se pudo cargar el portfolio: ${error.message}.${hint}`;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 200);
    }, 1800);
}

function buildStringArray(items = []) {
    const values = items.map((item) => `<span class="string">"${escapeHtml(item)}"</span>`).join('<span class="operator">, </span>');
    return `<span class="bracket">[</span>${values}<span class="bracket">]</span>`;
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

function toSnakeCaseName(value = '') {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value = '') {
    return escapeHtml(value);
}
