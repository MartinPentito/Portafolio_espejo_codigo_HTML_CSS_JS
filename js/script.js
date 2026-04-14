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
        await animateBootSequence();
        const data = await dataPromise;
        renderPortfolio(data);
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

async function animateBootSequence() {
    const el = stateElements.loading;
    el.innerHTML = '';

    const messages = [
        { text: '$ python portfolio.py', cls: 'boot-line' },
        { text: 'Loading modules...', cls: 'boot-line' },
        { text: 'Fetching profile data...', cls: 'boot-line' },
        { text: '\u2713  Ready', cls: 'boot-line done' }
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

function renderPortfolio(data) {
    document.title = `${data.personal.name} - Portfolio`;
    stateElements.profileImage.alt = data.personal.name;
    stateElements.profileImage.src = data.personal.photo || 'profile.jpg';
    stateElements.profileFallback.textContent = getInitials(data.personal.name);

    stateElements.sidebar.innerHTML = buildSidebar(data);
    stateElements.main.innerHTML = buildMainContent(data);
    stateElements.loading.hidden = true;
    stateElements.main.hidden = false;

    animateCodeLines();
    initStatusBar();
    initializeInteractions();
}

function buildSidebar(data) {
    const name = escapeHtml(data.personal.name);
    const title = escapeHtml(data.personal.title);

    const nameBlock = `
        <div class="sidebar-name">${name}</div>
        <div class="sidebar-title">${title}</div>
    `;

    return nameBlock + createMediaSection(data.media);
}

function buildMainContent(data) {
    const sections = [
        { id: 'profile',    label: 'PROFILE',    lines: buildProfileLines(data) },
        { id: 'stack',      label: 'STACK',      lines: buildStackLines(data) },
        { id: 'experience', label: 'EXPERIENCE', lines: buildExperienceLines(data) },
        { id: 'education',  label: 'EDUCATION',  lines: buildEducationLines(data) },
        { id: 'services',   label: 'SERVICES',   lines: buildServicesLines(data) },
        { id: 'projects',   label: 'PROJECTS',   lines: buildProjectsLines(data) }
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
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Lenguajes y tecnolog\u00edas'));
        const tech = data.techStack.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tech_stack</span> <span class="operator">=</span> <span class="bracket">[</span>${tech}<span class="bracket">]</span>`));
    }

    if (data.platforms && data.platforms.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Plataformas'));
        const plat = data.platforms.map(p => `<span class="string">"${escapeHtml(p)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">platforms</span> <span class="operator">=</span> <span class="bracket">[</span>${plat}<span class="bracket">]</span>`));
    }

    if (data.tools && data.tools.length) {
        lines.push(blankLine());
        lines.push(commentLine('&nbsp;&nbsp;&nbsp;&nbsp;# Herramientas'));
        const tools = data.tools.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tools</span> <span class="operator">=</span> <span class="bracket">[</span>${tools}<span class="bracket">]</span>`));
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

function buildExperienceLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Experience</span><span class="operator">:</span>'));

    if (!data.experience || !data.experience.length) return lines;

    data.experience.forEach((job, index) => {
        if (index > 0) lines.push(blankLine());
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">def</span> <span class="function">${escapeHtml(toSnakeCaseName(job.role))}</span><span class="bracket">(</span><span class="keyword">self</span><span class="bracket">)</span><span class="operator">:</span>`));
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(job.company)} | ${escapeHtml(job.period)}`));
        if (job.description) {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"""${escapeHtml(job.description)}"""</span>`));
        }
    });

    return lines;
}

function buildEducationLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Education</span><span class="operator">:</span>'));

    if (!data.education || !data.education.length) return lines;

    data.education.forEach((edu, index) => {
        if (index > 0) lines.push(blankLine());
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">def</span> <span class="function">${escapeHtml(toSnakeCaseName(edu.institution))}</span><span class="bracket">(</span><span class="keyword">self</span><span class="bracket">)</span><span class="operator">:</span>`));
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(edu.period)}`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">_title</span> <span class="operator">=</span> <span class="string">"${escapeHtml(edu.title)}"</span>`));
        if (edu.description) {
            lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(edu.description)}`));
        }
    });

    return lines;
}

function buildServicesLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Services</span><span class="operator">:</span>'));

    if (!data.services || !data.services.length) return lines;

    data.services.forEach((service, index) => {
        if (index > 0) lines.push(blankLine());
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">def</span> <span class="function">${escapeHtml(toSnakeCaseName(service.title))}</span><span class="bracket">(</span><span class="keyword">self</span><span class="bracket">)</span><span class="operator">:</span>`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"""${escapeHtml(service.description)}"""</span>`));
    });

    return lines;
}

function buildProjectsLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Projects</span><span class="operator">:</span>'));

    data.projects.forEach((project, index) => {
        if (index > 0) lines.push(blankLine());
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">def</span> <span class="function">${escapeHtml(toSnakeCaseName(project.name))}</span><span class="bracket">(</span><span class="keyword">self</span><span class="bracket">)</span><span class="operator">:</span>`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"""${escapeHtml(project.description)}"""</span>`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">_type</span> <span class="operator">=</span> <span class="string">"${escapeHtml(project.type)}"</span>`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">_stack</span> <span class="operator">=</span> ${buildStringArray(project.stack)}`));

        if (project.url) {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">_url</span> <span class="operator">=</span> <a class="string" href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">"${escapeHtml(project.url)}"</a>`));
        }
    });

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

function commentLine(text) {
    return codeLine(`<span class="comment">${text}</span>`);
}

function blankLine() {
    return codeLine('');
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
        let activeId = sections[0]?.id;
        for (const section of sections) {
            if (section.getBoundingClientRect().top - containerTop <= 60) {
                activeId = section.id;
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
