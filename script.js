const stateElements = {
    sidebar: document.getElementById('sidebar-content'),
    main: document.getElementById('main-content'),
    loading: document.getElementById('loading-state'),
    profileImage: document.getElementById('profile-image'),
    profileFallback: document.getElementById('profile-fallback')
};

document.addEventListener('DOMContentLoaded', () => {
    initializeProfileImageFallback();
    loadPortfolio();
});

async function loadPortfolio() {
    try {
        const response = await fetch('data.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`No se pudo cargar data.json (${response.status})`);
        }

        const data = await response.json();
        renderPortfolio(data);
    } catch (error) {
        showError(error);
        console.error('Error al cargar el portfolio:', error);
    }
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

    initializeInteractions();
    animateCodeLines();
}

function buildSidebar(data) {
    const sections = [
        createSection('PLATFORMS()', data.platforms),
        createSection('STACK()', data.techStack),
        createSection('TOOLS()', data.tools),
        createMediaSection(data.media),
        createLanguageSection(data.languages),
        createSection('PROFILE()', data.profile)
    ];

    return sections.join('');
}

function buildMainContent(data) {
    const lines = [];

    lines.push(commentLine('/// <summary>'));
    lines.push(commentLine(`/// ${escapeHtml(data.summary)}`));
    lines.push(commentLine('/// </summary>'));
    lines.push(codeLine('<span class="keyword">public class</span> <span class="class-name">PROFILE</span>'));
    lines.push(codeLine('<span class="bracket">{</span>'));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public string</span> <span class="property">NAME</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.name)}"</span><span class="operator">;</span>`));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public string</span> <span class="property">TITLE</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.title)}"</span><span class="operator">;</span>`));
    lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public string</span> <span class="property">FOCUS</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.focus)}"</span><span class="operator">;</span>`));

    if (data.personal.location) {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public string</span> <span class="property">LOCATION</span> <span class="operator">=</span> <span class="string">"${escapeHtml(data.personal.location)}"</span><span class="operator">;</span>`));
    }

    if (data.personal.email) {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public string</span> <span class="property">EMAIL</span> <span class="operator">=</span> <span class="string copyable" data-copy="${escapeAttribute(data.personal.email)}">"${escapeHtml(data.personal.email)}"</span><span class="operator">;</span>`));
    }

    lines.push(codeLine('<span class="bracket">}</span>'));
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">public static class</span> <span class="class-name">HIGHLIGHTS</span>'));
    lines.push(codeLine('<span class="bracket">{</span>'));

    data.highlights.forEach((item) => {
        lines.push(commentLine(`// ${escapeHtml(item)}`));
    });

    lines.push(codeLine('<span class="bracket">}</span>'));
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">public static class</span> <span class="class-name">PROJECTS</span>'));
    lines.push(codeLine('<span class="bracket">{</span>'));

    data.projects.forEach((project) => {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">public void</span> <span class="property">${escapeHtml(toMethodName(project.name))}</span><span class="bracket">()</span>`));
        lines.push(codeLine('&nbsp;&nbsp;&nbsp;&nbsp;<span class="bracket">{</span>'));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">var</span> <span class="property">_Type</span> <span class="operator">=</span> <span class="string">"${escapeHtml(project.type)}"</span><span class="operator">;</span>`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">var</span> <span class="property">_Stack</span> <span class="operator">=</span> ${buildStringArray(project.stack)}<span class="operator">;</span>`));
        lines.push(commentLine(`        ${escapeHtml(project.description)}`));

        if (project.url) {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">var</span> <span class="property">_Url</span> <span class="operator">=</span> <a class="string" href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">"${escapeHtml(project.url)}"</a><span class="operator">;</span>`));
        }

        lines.push(codeLine('&nbsp;&nbsp;&nbsp;&nbsp;<span class="bracket">}</span>'));
        lines.push(blankLine());
    });

    lines.push(codeLine('<span class="bracket">}</span>'));

    return lines.join('');
}

function createSection(title, items = []) {
    if (!items || !items.length) {
        return '';
    }

    const content = items.map((item) => `<div class="enum-item">${escapeHtml(item)}</div>`).join('');
    return `<div class="section"><div class="section-title">${title}</div><div class="enum-content">${content}</div></div>`;
}

function createMediaSection(media = []) {
    if (!media.length) {
        return '';
    }

    const content = media.map((item) => {
        const label = escapeHtml(item.label);
        const url = escapeAttribute(item.url);
        return `<div class="enum-item"><a href="${url}" target="_blank" rel="noreferrer">${label}</a></div>`;
    }).join('');

    return `<div class="section"><div class="section-title">MEDIA()</div><div class="enum-content">${content}</div></div>`;
}

function createLanguageSection(languages = []) {
    if (!languages.length) {
        return '';
    }

    const content = languages.map((item) => `<div class="enum-item">${escapeHtml(item.name)}${item.level ? ` <span class="comment">// ${escapeHtml(item.level)}</span>` : ''}</div>`).join('');
    return `<div class="section"><div class="section-title">LANGUAGES()</div><div class="enum-content">${content}</div></div>`;
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
}

function initializeProfileImageFallback() {
    stateElements.profileImage.addEventListener('error', () => {
        stateElements.profileImage.closest('.profile-frame').classList.add('missing-image');
    });
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

function toMethodName(value = '') {
    const cleaned = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    const parts = cleaned.split(' ').filter(Boolean);

    if (!parts.length) {
        return 'Project';
    }

    return parts.map((part) => part[0].toUpperCase() + part.slice(1)).join('');
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
