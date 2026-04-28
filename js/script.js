/**
 * @file script.js
 * @description Lógica central del portfolio de Martín Pentito.
 *   Carga `data/data.json`, consume la GitHub API y renderiza el contenido
 *   como código estilizado tipo editor (VSCode). Gestiona temas, idiomas,
 *   command palette, animaciones y el registro del Service Worker (PWA).
 * @author Martín Pentito
 */

// ─── GitHub Config ─────────────────────────────────────────────────────────
const GITHUB_USER = 'MartinPentito';
const THEME_STORAGE_KEY = 'portfolio-theme';
const LANG_STORAGE_KEY = 'portfolio-language';
const MOBILE_SIDEBAR_STORAGE_KEY = 'portfolio-mobile-sidebar-collapsed';
const DEFAULT_THEME = 'vscode-dark-plus';
const DEFAULT_LANG = 'es';
const SUPPORTED_LANGS = ['es', 'en', 'de', 'ja'];
const CERTIFICATES_PDF_URL = 'assets/Certificados.pdf';

/** Mapeo de código de idioma a locale BCP 47 para formateo de fechas con Intl. */
const LOCALE_BY_LANG = {
    es: 'es-AR',
    en: 'en-US',
    de: 'de-DE',
    ja: 'ja-JP'
};

// ─── Traducciones (i18n) ─────────────────────────────────────────────────────
/**
 * Diccionario de traducciones de la interfaz.
 * Contiene las 4 variantes de idioma soportadas: es, en, de, ja.
 * Se accede a través de la función t(key).
 */
const I18N = {
    es: {
        page_title_suffix: 'Portfolio',
        theme_title: 'theme:',
        language_title: 'lang:',
        theme_aria: 'Temas inspirados en Visual Studio Code',
        lang_aria: 'Idioma de la web',
        nav_aria: 'Secciones del portfolio',
        boot_loading_modules: 'Cargando modulos...',
        boot_fetching_profile: 'Obteniendo datos del perfil...',
        boot_connecting_github: 'Conectando con GitHub API...',
        boot_ready: 'Listo',
        section_profile: 'PROFILE',
        section_stack: 'STACK',
        section_stats: 'STATS',
        section_experience: 'EXPERIENCE',
        section_education: 'EDUCATION',
        section_services: 'SERVICES',
        section_projects: 'PROJECTS',
        nav_certificates: 'CERTIFICADOS',
        stack_languages: 'Lenguajes y tecnologias',
        stack_platforms: 'Plataformas',
        stack_tools: 'Herramientas',
        stack_links: 'Links',
        stats_metrics: 'Metricas',
        exp_history: 'Historial laboral',
        edu_history: 'Formacion academica',
        services_offered: 'Servicios ofrecidos',
        projects_none: 'No se encontraron proyectos',
        projects_public: 'Proyectos publicos',
        case_problem: 'Problema',
        case_solution: 'Solucion',
        case_result: 'Resultado',
        link_live: '_live ↗',
        link_repo: '_repo ↗',
        media_title: 'media:',
        copied_to_clipboard: 'Dato copiado al portapapeles',
        copy_error: 'No se pudo copiar el dato:',
        status_lines: 'lineas',
        load_error_console: 'Error al cargar el portfolio:',
        load_error_ui: 'No se pudo cargar el portfolio',
        load_error_hint: ' Abrilo con Live Server o un servidor local para permitir la carga de data.json.',
        data_error: 'No se pudo cargar data.json',
        projects_search_placeholder: 'Buscar proyecto o stack...',
        projects_all_types: 'Todos los tipos',
        projects_all_tech: 'Todas las tecnologias',
        projects_matches: 'resultados',
        projects_no_match: 'No hay proyectos que coincidan con el filtro.',
        cmd_placeholder: 'Escribi un comando...',
        cmd_open_palette: 'Abrir command palette',
        cmd_theme_next: 'Cambiar al siguiente tema',
        cmd_lang_next: 'Cambiar al siguiente idioma',
        cmd_go_section: 'Ir a',
        cmd_copy_email: 'Copiar email',
        cmd_download_cv: 'Descargar CV',
        cmd_open_certificates: 'Ver certificados',
        cmd_keywords_certificates: 'certificados pdf',
        cmd_keywords_cv: 'cv descargar lebenslauf resume download',
        sidebar_show: 'Mostrar perfil',
        sidebar_hide: 'Ocultar perfil',
        profile_cv: 'CV',
        cmd_no_results: 'Sin comandos coincidentes.',
        seo_title: 'Portfolio de Martin Pentito',
        seo_description: 'Portfolio tecnico de Martin Pentito: desarrollo web, soporte tecnico y proyectos reales.',
        print_pdf: 'Imprimir / PDF',
        project_type_github: 'Proyecto open source · GitHub Pages',
        project_no_description: 'Repositorio publico en GitHub.',
        years_of_experience: 'Años de experiencia',
        technologies: 'Tecnologías',
        github_projects: 'Proyectos'
    },
    en: {
        page_title_suffix: 'Portfolio',
        theme_title: 'theme:',
        language_title: 'lang:',
        theme_aria: 'Visual Studio Code inspired themes',
        lang_aria: 'Website language',
        nav_aria: 'Portfolio sections',
        boot_loading_modules: 'Loading modules...',
        boot_fetching_profile: 'Fetching profile data...',
        boot_connecting_github: 'Connecting to GitHub API...',
        boot_ready: 'Ready',
        section_profile: 'PROFILE',
        section_stack: 'STACK',
        section_stats: 'STATS',
        section_experience: 'EXPERIENCE',
        section_education: 'EDUCATION',
        section_services: 'SERVICES',
        section_projects: 'PROJECTS',
        nav_certificates: 'CERTIFICATES',
        stack_languages: 'Languages and technologies',
        stack_platforms: 'Platforms',
        stack_tools: 'Tools',
        stack_links: 'Links',
        stats_metrics: 'Metrics',
        exp_history: 'Work history',
        edu_history: 'Education',
        services_offered: 'Services',
        projects_none: 'No projects found',
        projects_public: 'Public projects',
        case_problem: 'Problem',
        case_solution: 'Solution',
        case_result: 'Result',
        link_live: '_live ↗',
        link_repo: '_repo ↗',
        media_title: 'media:',
        copied_to_clipboard: 'Copied to clipboard',
        copy_error: 'Could not copy data:',
        status_lines: 'lines',
        load_error_console: 'Error loading portfolio:',
        load_error_ui: 'Could not load portfolio',
        load_error_hint: ' Open it with Live Server or a local server to allow loading data.json.',
        data_error: 'Could not load data.json',
        projects_search_placeholder: 'Search project or stack...',
        projects_all_types: 'All types',
        projects_all_tech: 'All technologies',
        projects_matches: 'results',
        projects_no_match: 'No projects match the current filter.',
        cmd_placeholder: 'Type a command...',
        cmd_open_palette: 'Open command palette',
        cmd_theme_next: 'Switch to next theme',
        cmd_lang_next: 'Switch to next language',
        cmd_go_section: 'Go to',
        cmd_copy_email: 'Copy email',
        cmd_download_cv: 'Download CV',
        cmd_open_certificates: 'View certificates',
        cmd_keywords_certificates: 'certificates pdf',
        cmd_keywords_cv: 'cv descargar lebenslauf resume download',
        sidebar_show: 'Show profile',
        sidebar_hide: 'Hide profile',
        profile_cv: 'CV',
        cmd_no_results: 'No matching commands.',
        seo_title: 'Martin Pentito Portfolio',
        seo_description: 'Technical portfolio of Martin Pentito: web development, technical support, and real projects.',
        print_pdf: 'Print / PDF',
        project_type_github: 'Open source project · GitHub Pages',
        project_no_description: 'Public repository on GitHub.',
        years_of_experience: 'Years of experience',
        technologies: 'Technologies',
        github_projects: 'Projects'
    },
    de: {
        page_title_suffix: 'Portfolio',
        theme_title: 'theme:',
        language_title: 'lang:',
        theme_aria: 'Von Visual Studio Code inspirierte Themes',
        lang_aria: 'Website-Sprache',
        nav_aria: 'Portfolio-Abschnitte',
        boot_loading_modules: 'Module werden geladen...',
        boot_fetching_profile: 'Profildaten werden geladen...',
        boot_connecting_github: 'Verbindung zur GitHub-API...',
        boot_ready: 'Bereit',
        section_profile: 'PROFILE',
        section_stack: 'STACK',
        section_stats: 'STATS',
        section_experience: 'EXPERIENCE',
        section_education: 'EDUCATION',
        section_services: 'SERVICES',
        section_projects: 'PROJECTS',
        nav_certificates: 'ZERTIFIKATE',
        stack_languages: 'Sprachen und Technologien',
        stack_platforms: 'Plattformen',
        stack_tools: 'Werkzeuge',
        stack_links: 'Links',
        stats_metrics: 'Kennzahlen',
        exp_history: 'Berufserfahrung',
        edu_history: 'Ausbildung',
        services_offered: 'Angebotene Services',
        projects_none: 'Keine Projekte gefunden',
        projects_public: 'Offentliche Projekte',
        case_problem: 'Problem',
        case_solution: 'Losung',
        case_result: 'Ergebnis',
        link_live: '_live ↗',
        link_repo: '_repo ↗',
        media_title: 'media:',
        copied_to_clipboard: 'In die Zwischenablage kopiert',
        copy_error: 'Daten konnten nicht kopiert werden:',
        status_lines: 'Zeilen',
        load_error_console: 'Fehler beim Laden des Portfolios:',
        load_error_ui: 'Portfolio konnte nicht geladen werden',
        load_error_hint: ' Bitte mit Live Server oder lokalem Server offnen, damit data.json geladen werden kann.',
        data_error: 'data.json konnte nicht geladen werden',
        projects_search_placeholder: 'Projekt oder Stack suchen...',
        projects_all_types: 'Alle Typen',
        projects_all_tech: 'Alle Technologien',
        projects_matches: 'Ergebnisse',
        projects_no_match: 'Keine Projekte entsprechen dem aktuellen Filter.',
        cmd_placeholder: 'Befehl eingeben...',
        cmd_open_palette: 'Command Palette offnen',
        cmd_theme_next: 'Zum nachsten Theme wechseln',
        cmd_lang_next: 'Zur nachsten Sprache wechseln',
        cmd_go_section: 'Gehe zu',
        cmd_copy_email: 'E-Mail kopieren',
        cmd_download_cv: 'Lebenslauf herunterladen',
        cmd_open_certificates: 'Zertifikate anzeigen',
        cmd_keywords_certificates: 'zertifikate pdf',
        cmd_keywords_cv: 'cv descargar lebenslauf resume download',
        sidebar_show: 'Profil anzeigen',
        sidebar_hide: 'Profil ausblenden',
        profile_cv: 'Lebenslauf',
        cmd_no_results: 'Keine passenden Befehle.',
        seo_title: 'Portfolio von Martin Pentito',
        seo_description: 'Technisches Portfolio von Martin Pentito: Webentwicklung, technischer Support und reale Projekte.',
        print_pdf: 'Drucken / PDF',
        project_type_github: 'Open-Source-Projekt · GitHub Pages',
        project_no_description: 'Offentliches Repository auf GitHub.',
        years_of_experience: 'Jahre Erfahrung',
        technologies: 'Technologien',
        github_projects: 'Projekte'
    },
    ja: {
        page_title_suffix: 'Portfolio',
        theme_title: 'theme:',
        language_title: 'lang:',
        theme_aria: 'Visual Studio Code風テーマ',
        lang_aria: 'Webサイトの言語',
        nav_aria: 'ポートフォリオのセクション',
        boot_loading_modules: 'モジュールを読み込み中...',
        boot_fetching_profile: 'プロフィールデータを取得中...',
        boot_connecting_github: 'GitHub API に接続中...',
        boot_ready: '準備完了',
        section_profile: 'PROFILE',
        section_stack: 'STACK',
        section_stats: 'STATS',
        section_experience: 'EXPERIENCE',
        section_education: 'EDUCATION',
        section_services: 'SERVICES',
        section_projects: 'PROJECTS',
        nav_certificates: '証明書',
        stack_languages: '言語と技術',
        stack_platforms: 'プラットフォーム',
        stack_tools: 'ツール',
        stack_links: 'リンク',
        stats_metrics: '指標',
        exp_history: '職務経歴',
        edu_history: '学歴',
        services_offered: '提供サービス',
        projects_none: 'プロジェクトが見つかりません',
        projects_public: '公開プロジェクト',
        case_problem: '課題',
        case_solution: '解決策',
        case_result: '結果',
        link_live: '_live ↗',
        link_repo: '_repo ↗',
        media_title: 'media:',
        copied_to_clipboard: 'クリップボードにコピーしました',
        copy_error: 'コピーできませんでした:',
        status_lines: '行',
        load_error_console: 'ポートフォリオの読み込みエラー:',
        load_error_ui: 'ポートフォリオを読み込めませんでした',
        load_error_hint: ' data.json を読み込むため、Live Server かローカルサーバーで開いてください。',
        data_error: 'data.json を読み込めませんでした',
        projects_search_placeholder: 'プロジェクトや技術を検索...',
        projects_all_types: 'すべてのタイプ',
        projects_all_tech: 'すべての技術',
        projects_matches: '件',
        projects_no_match: '現在のフィルターに一致するプロジェクトがありません。',
        cmd_placeholder: 'コマンドを入力...',
        cmd_open_palette: 'コマンドパレットを開く',
        cmd_theme_next: '次のテーマに切り替え',
        cmd_lang_next: '次の言語に切り替え',
        cmd_go_section: '移動先',
        cmd_copy_email: 'メールをコピー',
        cmd_download_cv: '履歴書をダウンロード',
        cmd_open_certificates: '証明書を見る',
        cmd_keywords_certificates: '証明書 pdf',
        cmd_keywords_cv: 'cv descargar lebenslauf resume download',
        sidebar_show: 'プロフィールを表示',
        sidebar_hide: 'プロフィールを非表示',
        profile_cv: '履歴書',
        cmd_no_results: '一致するコマンドがありません。',
        seo_title: 'Martin Pentito のポートフォリオ',
        seo_description: 'Martin Pentito の技術ポートフォリオ。Web開発、技術サポート、実案件。',
        print_pdf: '印刷 / PDF',
        project_type_github: 'オープンソース · GitHub Pages',
        project_no_description: 'GitHubの公開リポジトリ。',
        years_of_experience: '経験年数',
        technologies: '技術',
        github_projects: 'プロジェクト'
    }
};

/** Estado global de la aplicación. Almacena datos cargados, repos y el estado de la UI. */
const appState = {
    data: null,
    repos: [],
    projectFilters: {
        query: '',
        type: '',
        tech: ''
    },
    commandEntries: [],
    commandIndex: 0,
    commandOpen: false,
    lastActiveElement: null,
    mobileSidebarResizeBound: false
};

let currentLang = DEFAULT_LANG;

/**
 * Definición de los temas visuales disponibles, inspirados en temas de Visual Studio Code.
 * Cada tema define las variables CSS que se aplican en `:root` y los meta tags de color.
 */
const VS_CODE_THEMES = {
    'vscode-dark-plus': {
        colorScheme: 'dark',
        themeColor: '#1e1e1e',
        vars: {
            '--bg-main': '#1e1e1e',
            '--bg-panel': '#252526',
            '--bg-card': '#2d2d30',
            '--border': '#3e3e42',
            '--text-main': '#d4d4d4',
            '--text-muted': '#858585',
            '--accent': '#4ade80',
            '--accent-strong': '#86efac',
            '--comment': '#6a9955',
            '--keyword': '#569cd6',
            '--string': '#ce9178',
            '--number': '#b5cea8',
            '--function': '#dcdcaa',
            '--accent-rgb': '74, 222, 128',
            '--accent-strong-rgb': '134, 239, 172',
            '--keyword-rgb': '86, 156, 214',
            '--statusbar-bg': '#0e639c',
            '--statusbar-text': '#ffffff'
        }
    },
    'vscode-monokai': {
        colorScheme: 'dark',
        themeColor: '#272822',
        vars: {
            '--bg-main': '#272822',
            '--bg-panel': '#2d2e27',
            '--bg-card': '#32332c',
            '--border': '#49483e',
            '--text-main': '#f8f8f2',
            '--text-muted': '#a59f85',
            '--accent': '#a6e22e',
            '--accent-strong': '#e6db74',
            '--comment': '#75715e',
            '--keyword': '#f92672',
            '--string': '#e6db74',
            '--number': '#ae81ff',
            '--function': '#66d9ef',
            '--accent-rgb': '166, 226, 46',
            '--accent-strong-rgb': '230, 219, 116',
            '--keyword-rgb': '249, 38, 114',
            '--statusbar-bg': '#5b5c55',
            '--statusbar-text': '#ffffff'
        }
    },
    'vscode-abyss': {
        colorScheme: 'dark',
        themeColor: '#000c18',
        vars: {
            '--bg-main': '#000c18',
            '--bg-panel': '#001221',
            '--bg-card': '#001a2f',
            '--border': '#00314f',
            '--text-main': '#c7e7ff',
            '--text-muted': '#6ca6cd',
            '--accent': '#00a6ff',
            '--accent-strong': '#48c6ff',
            '--comment': '#4c93c3',
            '--keyword': '#ff9d00',
            '--string': '#8bd649',
            '--number': '#ff628c',
            '--function': '#ffd866',
            '--accent-rgb': '0, 166, 255',
            '--accent-strong-rgb': '72, 198, 255',
            '--keyword-rgb': '255, 157, 0',
            '--statusbar-bg': '#0078d4',
            '--statusbar-text': '#ffffff'
        }
    }
};

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

// ─── Inicialización ──────────────────────────────────────────────────────────
// Se ejecuta cuando el DOM está listo. Arranca todos los subsistemas del portfolio.
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSwitcher();
    initializeThemeSwitcher();
    initializeCommandPalette();
    initializeProfileImageFallback();
    initializeMobileSidebarToggle();
    loadPortfolio();
});

// ─── Idioma ──────────────────────────────────────────────────────────────────
/**
 * Inicializa el selector de idioma.
 * Registra el listener de clic en los botones y aplica el idioma guardado en
 * localStorage, o el idioma por defecto si no hay preferencia guardada.
 */
function initializeLanguageSwitcher() {
    const langButtonsContainer = document.getElementById('lang-buttons');
    if (!langButtonsContainer) return;

    langButtonsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.lang-btn');
        if (!button) return;
        const nextLang = button.dataset.lang;
        setLanguage(nextLang);
    });

    const savedLang = getSavedLanguage();
    const initialLang = SUPPORTED_LANGS.includes(savedLang) ? savedLang : DEFAULT_LANG;
    setLanguage(initialLang, { persist: false, rerender: false });
}

/**
 * Cambia el idioma activo, actualiza el DOM, persiste la preferencia
 * y vuelve a renderizar el portfolio si ya existen datos cargados.
 * @param {string} lang - Código de idioma ('es'|'en'|'de'|'ja').
 * @param {{ persist?: boolean, rerender?: boolean }} [options]
 */
function setLanguage(lang, options = {}) {
    const { persist = true, rerender = true } = options;
    currentLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

    updateLanguageButtons();
    applyLanguageMetadata();

    if (persist) {
        saveLanguage(currentLang);
    }

    if (rerender && appState.data) {
        renderPortfolio(appState.data, appState.repos);
    }
}

/** Lee el idioma guardado en localStorage. Devuelve null si el acceso falla (modo privado). */
function getSavedLanguage() {
    try {
        return localStorage.getItem(LANG_STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

/**
 * Persiste el idioma activo en localStorage.
 * @param {string} lang - Código de idioma a guardar.
 */
function saveLanguage(lang) {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (error) {
        // Ignore storage errors (private mode / blocked storage)
    }
}

/** Sincroniza el estado visual (clase `active` y `aria-pressed`) de los botones de idioma. */
function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach((button) => {
        const isActive = button.dataset.lang === currentLang;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

/**
 * Actualiza atributos de accesibilidad (aria-label, lang en <html>) y textos del DOM
 * que dependen del idioma activo, sin necesidad de re-renderizar el contenido completo.
 */
function applyLanguageMetadata() {
    document.documentElement.setAttribute('lang', currentLang);

    const themeSwitcher = document.querySelector('.theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.setAttribute('aria-label', t('theme_aria'));
    }
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
        langSwitcher.setAttribute('aria-label', t('lang_aria'));
    }
    const sectionNav = document.getElementById('section-nav');
    if (sectionNav) {
        sectionNav.setAttribute('aria-label', t('nav_aria'));
    }

    const themeTitle = document.querySelector('.theme-switcher-title');
    if (themeTitle) themeTitle.textContent = t('theme_title');
    const langTitle = document.querySelector('.lang-switcher-title');
    if (langTitle) langTitle.textContent = t('language_title');

    const commandPalette = document.getElementById('command-palette');
    if (commandPalette) {
        commandPalette.setAttribute('aria-label', t('cmd_open_palette'));
    }
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
        commandInput.setAttribute('placeholder', t('cmd_placeholder'));
        commandInput.setAttribute('aria-label', t('cmd_open_palette'));
    }

    updateMobileSidebarToggleLabel();
}

// ─── Mobile sidebar ──────────────────────────────────────────────────────────
/** Devuelve true si el viewport tiene 768 px de ancho o menos (breakpoint mobile). */
function isMobileViewport() {
    return window.matchMedia('(max-width: 768px)').matches;
}

/** Lee desde localStorage si el sidebar está colapsado en mobile. Devuelve true por defecto. */
function getSavedMobileSidebarCollapsed() {
    try {
        return localStorage.getItem(MOBILE_SIDEBAR_STORAGE_KEY) === '1';
    } catch (error) {
        return true;
    }
}

/**
 * Persiste el estado colapsado/expandido del sidebar mobile en localStorage.
 * @param {boolean} collapsed - true para colapsado, false para expandido.
 */
function saveMobileSidebarCollapsed(collapsed) {
    try {
        localStorage.setItem(MOBILE_SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
    } catch (error) {
        // Ignore storage errors (private mode / blocked storage)
    }
}

/** Actualiza el texto y aria-label del botón toggle del sidebar según el estado actual. */
function updateMobileSidebarToggleLabel() {
    const toggle = document.getElementById('sidebar-toggle');
    if (!toggle) return;

    const collapsed = document.body.classList.contains('mobile-sidebar-collapsed');
    toggle.textContent = collapsed ? `▸ ${t('sidebar_show')}` : `▾ ${t('sidebar_hide')}`;
    toggle.setAttribute('aria-label', collapsed ? t('sidebar_show') : t('sidebar_hide'));
    toggle.setAttribute('aria-expanded', String(!collapsed));
}

/**
 * Aplica o elimina la clase `mobile-sidebar-collapsed` del body según el viewport.
 * Solo colapsa en mobile; en desktop siempre mantiene el sidebar visible.
 * @param {boolean} collapsed
 * @param {{ persist?: boolean }} [options]
 */
function setMobileSidebarCollapsed(collapsed, options = {}) {
    const { persist = true } = options;

    if (isMobileViewport()) {
        document.body.classList.toggle('mobile-sidebar-collapsed', collapsed);
    } else {
        document.body.classList.remove('mobile-sidebar-collapsed');
    }

    if (persist) {
        saveMobileSidebarCollapsed(collapsed);
    }

    updateMobileSidebarToggleLabel();
}

/**
 * Inicializa el botón que colapsa el sidebar en mobile.
 * Aplica el estado guardado en localStorage y registra el listener de resize (una sola vez).
 */
function initializeMobileSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    if (!toggle) return;

    const isMobile = isMobileViewport();
    toggle.hidden = !isMobile;

    const initialCollapsed = isMobile ? getSavedMobileSidebarCollapsed() : false;
    setMobileSidebarCollapsed(initialCollapsed, { persist: false });

    toggle.onclick = () => {
        const collapsed = document.body.classList.contains('mobile-sidebar-collapsed');
        setMobileSidebarCollapsed(!collapsed);
    };

    if (!appState.mobileSidebarResizeBound) {
        window.addEventListener('resize', initializeMobileSidebarToggle, { passive: true });
        appState.mobileSidebarResizeBound = true;
    }
}

// ─── Tema ────────────────────────────────────────────────────────────────────
/**
 * Inicializa el selector de tema.
 * Registra el listener de clic y aplica el tema guardado en localStorage (o el default).
 */
function initializeThemeSwitcher() {
    const themeButtonsContainer = document.getElementById('theme-buttons');
    if (!themeButtonsContainer) return;

    themeButtonsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.theme-btn');
        if (!button) return;
        const themeName = button.dataset.theme;
        applyTheme(themeName);
    });

    const savedTheme = getSavedTheme();
    const initialTheme = VS_CODE_THEMES[savedTheme] ? savedTheme : DEFAULT_THEME;
    applyTheme(initialTheme, { persist: false });
}

/** Lee el tema guardado en localStorage. Devuelve null si el acceso falla. */
function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

/**
 * Persiste el nombre del tema activo en localStorage.
 * @param {string} themeName - Clave del tema (e.g. 'vscode-dark-plus').
 */
function saveTheme(themeName) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
        // Ignore storage errors (private mode / blocked storage)
    }
}

/**
 * Aplica un tema: inyecta las variables CSS en `:root`, actualiza los meta tags
 * de color-scheme y theme-color, actualiza los botones y persiste la elección.
 * @param {string} themeName - Clave del tema a aplicar.
 * @param {{ persist?: boolean }} [options]
 */
function applyTheme(themeName, options = {}) {
    const { persist = true } = options;
    const selectedTheme = VS_CODE_THEMES[themeName] || VS_CODE_THEMES[DEFAULT_THEME];
    const appliedThemeName = VS_CODE_THEMES[themeName] ? themeName : DEFAULT_THEME;

    Object.entries(selectedTheme.vars).forEach(([name, value]) => {
        document.documentElement.style.setProperty(name, value);
    });

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
        colorSchemeMeta.setAttribute('content', selectedTheme.colorScheme);
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', selectedTheme.themeColor);
    }

    updateThemeButtons(appliedThemeName);

    if (persist) {
        saveTheme(appliedThemeName);
    }
}

/**
 * Sincroniza el estado visual (clase `active` y `aria-pressed`) de los botones de tema.
 * @param {string} activeThemeName - Clave del tema actualmente aplicado.
 */
function updateThemeButtons(activeThemeName) {
    document.querySelectorAll('.theme-btn').forEach((button) => {
        const isActive = button.dataset.theme === activeThemeName;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

// ─── Carga de datos ─────────────────────────────────────────────────────────────
/**
 * Orquesta la carga completa del portfolio: inicia las peticiones a data.json
 * y GitHub API en paralelo, ejecuta la animación de boot y llama a renderPortfolio.
 */
async function loadPortfolio() {
    try {
        const dataPromise = fetchData();
        const reposPromise = fetchGitHubRepos();
        await animateBootSequence();
        const [data, repos] = await Promise.all([dataPromise, reposPromise.catch(() => [])]);
        appState.data = data;
        appState.repos = repos;
        renderPortfolio(appState.data, appState.repos);
    } catch (error) {
        showError(error);
        console.error(t('load_error_console'), error);
    }
}

/**
 * Obtiene y parsea `data/data.json`.
 * Lanza un error si la respuesta HTTP no es OK.
 * @returns {Promise<Object>} Datos del portfolio.
 */
async function fetchData() {
    const response = await fetch('data/data.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`${t('data_error')} (${response.status})`);
    }
    return response.json();
}

/**
 * Obtiene hasta 100 repositorios públicos del usuario desde la GitHub API.
 * Aplica un timeout de 5 s y maneja rate-limit (403/429) devolviendo array vacío.
 * @returns {Promise<Array>} Lista de repositorios o [] ante error/timeout.
 */
async function fetchGitHubRepos() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (response.status === 403 || response.status === 429) {
            console.warn('GitHub API rate limited, continuando sin repos.');
            return [];
        }
        if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.warn('GitHub API timeout, continuando sin repos.');
            return [];
        }
        throw error;
    }
}

/**
 * Filtra la lista de repos para devolver solo los públicos con GitHub Pages activo.
 * @param {Array} repos - Array de repositorios de la GitHub API.
 * @returns {Array}
 */
function getPublicRepos(repos) {
    return repos.filter(r => !r.private && r.has_pages);
}

// ─── Animación de boot ──────────────────────────────────────────────────────────
/**
 * Muestra una secuencia de mensajes tipo terminal antes de cargar el contenido.
 * Cada mensaje se escribe carácter a carácter para simular una terminal activa.
 */
async function animateBootSequence() {
    const el = stateElements.loading;
    el.innerHTML = '';

    const messages = [
        { text: '$ python portfolio.py',       cls: 'boot-line' },
        { text: t('boot_loading_modules'),      cls: 'boot-line' },
        { text: t('boot_fetching_profile'),     cls: 'boot-line' },
        { text: t('boot_connecting_github'),    cls: 'boot-line' },
        { text: `\u2713  ${t('boot_ready')}`,  cls: 'boot-line done' }
    ];

    for (const { text, cls } of messages) {
        const line = document.createElement('div');
        line.className = cls;
        el.appendChild(line);
        await typeText(line, text);
        await sleep(70);
    }
}

/**
 * Escribe un texto carácter a carácter en un elemento DOM con un delay de 10 ms.
 * @param {HTMLElement} el - Elemento destino.
 * @param {string} text - Texto a escribir.
 */
async function typeText(el, text) {
    for (const char of text) {
        el.textContent += char;
        await sleep(10);
    }
}

/**
 * Promesa que resuelve tras `ms` milisegundos. Útil en async/await para pausas.
 * @param {number} ms - Milisegundos de espera.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Renderizado ───────────────────────────────────────────────────────────────
/**
 * Renderiza el portfolio completo: localiza los datos, construye sidebar y main,
 * actualiza SEO, inicia animaciones y registra las interacciones de usuario.
 * @param {Object} data - Datos crudos de data.json.
 * @param {Array} [repos=[]] - Repositorios de GitHub (sin filtrar).
 */
function renderPortfolio(data, repos = []) {
    const localizedData = localizeDeep(data);

    stateElements.profileImage.alt = localizedData.personal.name;
    stateElements.profileImage.src = localizedData.personal.photo || 'profile.jpg';
    stateElements.profileFallback.textContent = getInitials(localizedData.personal.name);

    stateElements.sidebar.innerHTML = buildSidebar(localizedData);
    stateElements.main.innerHTML = buildMainContent(localizedData, repos);
    stateElements.loading.hidden = true;
    stateElements.main.hidden = false;

    applyLanguageMetadata();
    updateSeo(localizedData);

    animateCodeLines();
    initStatusBar();
    initializeInteractions();
    initializeMobileSidebarToggle();
    initScrollAnimations();
    startTypingAnimation(localizedData);
    initCounterAnimation();
}

/**
 * Construye el HTML del panel lateral: nombre, título animado y sección de media links.
 * @param {Object} data - Datos ya localizados.
 * @returns {string} HTML string del sidebar.
 */
function buildSidebar(data) {
    const name = escapeHtml(data.personal.name);

    const nameBlock = `
        <div class="sidebar-name">${name}</div>
        <div class="sidebar-title"><span class="typing-text"></span><span class="typing-cursor">|</span></div>
    `;

    return nameBlock + createMediaSection(data.media);
}

// ─── Typing Animation (sidebar title) ──────────────────
/**
 * Anima el título en el sidebar con efecto typewriter: escribe y borra cada rol
 * del array `personal.title` en rotación continua.
 * @param {Object} data - Datos ya localizados (se usa data.personal.title).
 */
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
/**
 * Anima con requestAnimationFrame los contadores numéricos marcados con `data-count-to`.
 * Va desde 0 hasta el valor destino en aproximadamente 60 frames.
 */
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

// ─── Contenido principal ─────────────────────────────────────────────────────
/**
 * Construye el HTML de todas las secciones del portfolio, inyecta la barra de tabs
 * y devuelve el HTML combinado para insertar en `#main-content`.
 * @param {Object} data - Datos ya localizados.
 * @param {Array} [repos=[]] - Array completo de repos de GitHub.
 * @returns {string} HTML string del contenido principal.
 */
function buildMainContent(data, repos = []) {
    const publicRepos = getPublicRepos(repos);
    const certificatesUrl = CERTIFICATES_PDF_URL;
    const sections = [
        { id: 'profile',    label: getSectionLabel('profile'),    lines: buildProfileLines(data) },
        { id: 'stack',      label: getSectionLabel('stack'),      lines: buildStackLines(data) },
        { id: 'stats',      label: getSectionLabel('stats'),      lines: buildStatsLines(data, publicRepos) },
        { id: 'experience', label: getSectionLabel('experience'), lines: buildExperienceLines(data) },
        { id: 'education',  label: getSectionLabel('education'),  lines: buildEducationLines(data) },
        { id: 'services',   label: getSectionLabel('services'),   lines: buildServicesLines(data) },
        { id: 'projects',   label: getSectionLabel('projects'),   lines: buildProjectsLines(data, publicRepos) }
    ];

    const navItems = sections
        .map(s => `<a class="nav-tab" href="#${s.id}">${s.label}</a>`);

    if (certificatesUrl) {
        navItems.push(`<a class="nav-tab" href="${escapeAttribute(certificatesUrl)}" target="_blank" rel="noreferrer" data-external="true">${escapeHtml(t('nav_certificates'))}</a>`);
    }

    stateElements.sectionNav.innerHTML = navItems.join('');
    stateElements.sectionNav.hidden = false;

    return sections
        .map(s => `<div class="code-section" id="${s.id}">${s.lines.join('')}</div>`)
        .join('');
}

// ─── Secciones: builders ──────────────────────────────────────────────────────────
/**
 * Genera las líneas HTML de la sección PROFILE (nombre, título, email, CV, traits, idiomas).
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]} Array de strings HTML (code-lines).
 */
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
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">EMAIL</span> <span class="operator">=</span> <span class="string copyable" role="button" tabindex="0" data-copy="${escapeAttribute(data.personal.email)}" title="${escapeHtml(t('copied_to_clipboard'))}" aria-label="${escapeHtml(data.personal.email)}">"${escapeHtml(data.personal.email)}"</span> <a class="inline-mailto" href="mailto:${escapeAttribute(data.personal.email)}" title="Abrir cliente de correo" aria-label="Enviar email">&#9993;</a>`));
    }

    if (data.personal.cv) {
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">${escapeHtml(t('profile_cv'))}</span> <span class="operator">=</span> <a class="string entry-link" href="${escapeAttribute(data.personal.cv)}" download aria-label="${escapeHtml(t('cmd_download_cv'))}">"${escapeHtml(t('cmd_download_cv'))} ↓"</a>`));
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

/**
 * Genera las líneas HTML de la sección STACK (techStack, platforms, tools, media links).
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]}
 */
/**
 * Genera las líneas HTML de la sección STACK (techStack, platforms, tools, media links).
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]}
 */
function buildStackLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Stack</span><span class="operator">:</span>'));

    if (data.techStack && data.techStack.length) {
        lines.push(blankLine());
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('stack_languages'))}`));
        const tech = data.techStack.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tech_stack</span> <span class="operator">=</span> <span class="bracket">[</span>${tech}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.techStack));
    }

    if (data.platforms && data.platforms.length) {
        lines.push(blankLine());
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('stack_platforms'))}`));
        const plat = data.platforms.map(p => `<span class="string">"${escapeHtml(p)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">platforms</span> <span class="operator">=</span> <span class="bracket">[</span>${plat}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.platforms));
    }

    if (data.tools && data.tools.length) {
        lines.push(blankLine());
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('stack_tools'))}`));
        const tools = data.tools.map(t => `<span class="string">"${escapeHtml(t)}"</span>`).join('<span class="operator">, </span>');
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">tools</span> <span class="operator">=</span> <span class="bracket">[</span>${tools}<span class="bracket">]</span>`));
        lines.push(skillGridLine(data.tools));
    }

    if (data.media && data.media.length) {
        lines.push(blankLine());
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('stack_links'))}`));
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="property">links</span> <span class="operator">=</span> <span class="bracket">{</span>`));
        data.media.forEach((item) => {
            lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">"${escapeHtml(item.label)}"</span><span class="operator">:</span> <a class="string" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">"${escapeHtml(item.url)}"</a><span class="operator">,</span>`));
        });
        lines.push(codeLine(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="bracket">}</span>`));
    }

    return lines;
}

/**
 * Genera las líneas HTML de la sección STATS con contadores animados:
 * años de experiencia, tecnologías y proyectos en GitHub.
 * @param {Object} data - Datos ya localizados.
 * @param {Array} [repos=[]] - Repositorios públicos de GitHub.
 * @returns {string[]}
 */
function buildStatsLines(data, repos = []) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Stats</span><span class="operator">:</span>'));
    lines.push(blankLine());
    lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('stats_metrics'))}`));
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

/**
 * Genera las líneas HTML de la sección EXPERIENCE con tarjetas por cada trabajo.
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]}
 */
function buildExperienceLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Experience</span><span class="operator">:</span>'));

    if (!data.experience || !data.experience.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('exp_history'))}`));

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

/**
 * Genera las líneas HTML de la sección EDUCATION con tarjetas por cada título/curso.
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]}
 */
function buildEducationLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Education</span><span class="operator">:</span>'));

    if (!data.education || !data.education.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('edu_history'))}`));

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

/**
 * Genera las líneas HTML de la sección SERVICES con tarjetas por cada servicio ofrecido.
 * @param {Object} data - Datos ya localizados.
 * @returns {string[]}
 */
function buildServicesLines(data) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Services</span><span class="operator">:</span>'));

    if (!data.services || !data.services.length) return lines;

    lines.push(blankLine());
    lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('services_offered'))}`));

    const cards = data.services.map(service => `<div class="entry-card">
            <div class="entry-title">${escapeHtml(service.title)}</div>
            ${service.description ? `<div class="entry-desc" style="margin-top:6px">"${escapeHtml(service.description)}"</div>` : ''}
        </div>`).join('');

    lines.push(cardGridLine(cards));

    return lines;
}

/**
 * Genera las líneas HTML de la sección PROJECTS.
 * Fusiona proyectos definidos en data.json con repos públicos de GitHub
 * y agrega los controles de filtrado (búsqueda, tipo, tecnología).
 * @param {Object} data - Datos ya localizados.
 * @param {Array} [repos=[]] - Repositorios públicos de GitHub.
 * @returns {string[]}
 */
function buildProjectsLines(data, repos = []) {
    const lines = [];
    lines.push(blankLine());
    lines.push(codeLine('<span class="keyword">class</span> <span class="class-name">Projects</span><span class="operator">:</span>'));
    lines.push(blankLine());

    const manualProjects = data.projects || [];
    const githubProjects = repos.map((r) => ({
        name: r.name,
        description: r.description || t('project_no_description'),
        type: t('project_type_github'),
        stack: r.topics || [],
        url: r.homepage || `https://${GITHUB_USER.toLowerCase()}.github.io/${r.name}/`,
        repoUrl: r.html_url,
        updated: r.updated_at
    }));
    const projects = mergeProjects(manualProjects, githubProjects);

    if (!projects.length) {
        lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('projects_none'))}`));
        return lines;
    }

    lines.push(commentLine(`&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('projects_public'))}`));
    lines.push(buildProjectControlsLine(projects));

    const cards = projects.map((project) => {
        const date = project.updated
            ? new Date(project.updated).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'short', day: 'numeric' })
            : '';
        const roleAndDuration = [project.role, project.duration].filter(Boolean).join(' · ');
        const caseStudy = [
            buildCaseStudyRow(t('case_problem'), project.challenge),
            buildCaseStudyRow(t('case_solution'), project.solution),
            buildCaseStudyRow(t('case_result'), project.result)
        ].filter(Boolean).join('');
        const tags = project.stack && project.stack.length
            ? `<div class="entry-tags">${project.stack.map((item) => `<span class="entry-tag">${escapeHtml(item)}</span>`).join('')}</div>`
            : '';
        const links = [
            project.url ? `<a class="entry-link" href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">${escapeHtml(t('link_live'))}</a>` : '',
            project.repoUrl ? `<a class="entry-link" href="${escapeAttribute(project.repoUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t('link_repo'))}</a>` : ''
        ].filter(Boolean).join('');

        const searchBlob = normalizeSearchText([
            project.name,
            project.description,
            project.type,
            project.role,
            project.challenge,
            project.solution,
            project.result,
            ...(project.stack || [])
        ].filter(Boolean).join(' '));
        const normalizedType = normalizeSearchText(project.type || '');
        const normalizedStack = normalizeSearchText((project.stack || []).join('|'));

        return `<div class="entry-card project-card" data-project-search="${escapeAttribute(searchBlob)}" data-project-type="${escapeAttribute(normalizedType)}" data-project-stack="${escapeAttribute(normalizedStack)}">
            <div class="entry-header">
                <span class="entry-title">${escapeHtml(project.name)}</span>
                ${date ? `<span class="entry-period">${date}</span>` : ''}
            </div>
            ${project.type ? `<div class="entry-meta">${escapeHtml(project.type)}</div>` : ''}
            ${roleAndDuration ? `<div class="entry-context">${escapeHtml(roleAndDuration)}</div>` : ''}
            ${project.description ? `<div class="entry-desc">"${escapeHtml(project.description)}"</div>` : ''}
            ${caseStudy ? `<div class="case-study">${caseStudy}</div>` : ''}
            ${tags}
            ${links ? `<div class="entry-links">${links}</div>` : ''}
        </div>`;
    }).join('');

    lines.push(cardGridLine(cards));
    lines.push(codeLine(`<span class="comment project-filter-empty" id="project-filter-empty" hidden>&nbsp;&nbsp;&nbsp;&nbsp;# ${escapeHtml(t('projects_no_match'))}</span>`));

    return lines;
}

/**
 * Genera el HTML del panel de controles de filtrado de proyectos:
 * input de búsqueda, selects de tipo y tecnología, y contador de resultados.
 * @param {Array} [projects=[]] - Lista completa de proyectos para extraer opciones.
 * @returns {string} HTML string de la fila de controles.
 */
function buildProjectControlsLine(projects = []) {
    const typeOptions = Array.from(new Set(projects.map((project) => project.type).filter(Boolean))).sort((a, b) => a.localeCompare(b, getCurrentLocale()));
    const techOptions = Array.from(new Set(projects.flatMap((project) => project.stack || []).filter(Boolean))).sort((a, b) => a.localeCompare(b, getCurrentLocale()));

    const typeOptionsHtml = [`<option value="">${escapeHtml(t('projects_all_types'))}</option>`]
        .concat(typeOptions.map((value) => {
            const normalized = normalizeSearchText(value);
            const selected = appState.projectFilters.type === normalized ? ' selected' : '';
            return `<option value="${escapeAttribute(normalized)}"${selected}>${escapeHtml(value)}</option>`;
        }))
        .join('');

    const techOptionsHtml = [`<option value="">${escapeHtml(t('projects_all_tech'))}</option>`]
        .concat(techOptions.map((value) => {
            const normalized = normalizeSearchText(value);
            const selected = appState.projectFilters.tech === normalized ? ' selected' : '';
            return `<option value="${escapeAttribute(normalized)}"${selected}>${escapeHtml(value)}</option>`;
        }))
        .join('');

    const searchValue = escapeAttribute(appState.projectFilters.query || '');

    return `<div class="code-line project-controls-line"><div class="line-number"></div><div class="code"><div class="project-controls"><input class="project-search" id="project-search" type="search" placeholder="${escapeAttribute(t('projects_search_placeholder'))}" value="${searchValue}" aria-label="${escapeAttribute(t('projects_search_placeholder'))}"><select class="project-select" id="project-type">${typeOptionsHtml}</select><select class="project-select" id="project-tech">${techOptionsHtml}</select><span class="project-results" id="project-results"></span></div></div></div>`;
}

/**
 * Genera el HTML de una fila de case study (ej. "Problema: ...").
 * Devuelve string vacío si no hay valor.
 * @param {string} label - Etiqueta de la fila (Problema/Solución/Resultado).
 * @param {string} value - Contenido de la fila.
 * @returns {string} HTML string o ''.
 */
function buildCaseStudyRow(label, value) {
    if (!value) return '';
    return `<div class="case-study-row"><span class="case-study-label">${escapeHtml(label)}:</span><span class="case-study-text">${escapeHtml(value)}</span></div>`;
}

// ─── Sistema de proyectos ────────────────────────────────────────────────────────
/**
 * Fusiona proyectos manuales (data.json) con repositorios de GitHub.
 * Los proyectos manuales tienen precedencia: sobrescriben campos del repo equivalente.
 * @param {Array} [manualProjects=[]] - Proyectos definidos en data.json.
 * @param {Array} [githubProjects=[]] - Repos transformados de la GitHub API.
 * @returns {Array} Lista fusionada de proyectos.
 */
function mergeProjects(manualProjects = [], githubProjects = []) {
    const byKey = new Map();

    githubProjects.forEach((project) => {
        byKey.set(getProjectMergeKey(project), project);
    });

    manualProjects.forEach((project) => {
        const key = getProjectMergeKey(project);
        const existing = byKey.get(key);
        byKey.set(key, { ...existing, ...project });
    });

    return Array.from(byKey.values());
}

/**
 * Devuelve una clave normalizada para identificar proyectos al fusionar listas.
 * Usa name → url → repoUrl como cascada, en minúsculas sin espacios.
 * @param {Object} [project={}]
 * @returns {string}
 */
function getProjectMergeKey(project = {}) {
    return (project.name || project.url || project.repoUrl || '')
        .toLowerCase()
        .trim();
}

const MEDIA_ICONS = {
    linkedin: `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    github:   `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    default:  `<svg class="media-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 3a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 2 0v1h2V4a1 1 0 0 1 1-1zM7 9v9h10V9H7z"/></svg>`
};

// ─── Media / links ───────────────────────────────────────────────────────────────
/**
 * Devuelve el SVG inline correspondiente a un enlace de media.
 * Detecta LinkedIn y GitHub por el label o la URL; cualquier otro usa el icóno genérico.
 * @param {{ label: string, url: string }} item
 * @returns {string} SVG HTML string.
 */
function getMediaIcon(item) {
    const key = (item.label + item.url).toLowerCase();
    if (key.includes('linkedin')) return MEDIA_ICONS.linkedin;
    if (key.includes('github'))   return MEDIA_ICONS.github;
    return MEDIA_ICONS.default;
}

/**
 * Genera el HTML de la sección de media links en el sidebar.
 * Devuelve string vacío si el array está vacío.
 * @param {Array} [media=[]] - Array de objetos { label, url }.
 * @returns {string} HTML string.
 */
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

    return `<div class="section"><div class="section-title">${escapeHtml(t('media_title'))}</div><div class="enum-content">${content}</div></div>`;
}

// ─── Helpers de construcción de HTML ─────────────────────────────────────────────────
/**
 * Genera una fila de código con número de línea y contenido HTML.
 * Los números se asignan dinámicamente por animateCodeLines().
 * @param {string} content - HTML interno de la celda de código.
 * @returns {string}
 */
function codeLine(content) {
    return `<div class="code-line"><div class="line-number"></div><div class="code">${content}</div></div>`;
}

/**
 * Genera una fila con una grilla de badges de tecnologías/plataformas/herramientas.
 * Cada badge muestra el icóno de Boxicons correspondiente y el nombre del ítem.
 * @param {string[]} items - Nombres de tecnologías a mostrar.
 * @returns {string}
 */
function skillGridLine(items) {
    const badges = items.map(name => {
        const key = name.toLowerCase();
        const iconClass = TECH_ICON_MAP[key] || 'bx bx-code-alt';
        return `<div class="skill-badge"><i class="${iconClass} skill-icon"></i><span class="skill-label">${escapeHtml(name)}</span></div>`;
    }).join('');
    return `<div class="code-line skill-grid-line"><div class="line-number"></div><div class="code skill-grid">${badges}</div></div>`;
}

/**
 * Genera una fila con la grilla de tarjetas de estadísticas.
 * Los valores usan `data-count-to` para ser animados por initCounterAnimation().
 * @param {{ icon: string, label: string, value: number }[]} stats
 * @returns {string}
 */
function statGridLine(stats) {
    const cards = stats.map(({ icon, label, value }) =>
        `<div class="stat-card">
            <i class="${icon} stat-icon"></i>
            <span class="stat-number" data-count-to="${value}">0</span>
            <span class="stat-label">${escapeHtml(t(label))}</span>
        </div>`
    ).join('');
    return `<div class="code-line stat-grid-line"><div class="line-number"></div><div class="code stat-grid">${cards}</div></div>`;
}

/**
 * Genera una línea con estilo de comentario de código (color `--comment`).
 * @param {string} text - Texto del comentario (puede contener HTML ya escapado).
 * @returns {string}
 */
function commentLine(text) {
    return codeLine(`<span class="comment">${text}</span>`);
}

/** Genera una línea numerada vacía para separar bloques de código. */
function blankLine() {
    return codeLine('');
}

/**
 * Genera una fila contenedora de tarjetas (`.card-grid`) para secciones
 * como EXPERIENCE, EDUCATION, SERVICES y PROJECTS.
 * @param {string} cardsHtml - HTML interno ya construido con las tarjetas.
 * @returns {string}
 */
function cardGridLine(cardsHtml) {
    return `<div class="code-line card-grid-line"><div class="line-number"></div><div class="code card-grid">${cardsHtml}</div></div>`;
}

// ─── Animaciones ──────────────────────────────────────────────────────────────────
/**
 * Registra un IntersectionObserver para animar las secciones con clase `animate-in`
 * cuando entran en el viewport (agrega clase `visible` que dispara la transición CSS).
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.code-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    sections.forEach((section) => {
        section.classList.add('animate-in');
        observer.observe(section);
    });
}

/**
 * Asigna números de línea correlativos a cada `.code-line` y aplica la
 * animación de aparición `slideIn` con delay escalonado. Añade el cursor al final.
 */
function animateCodeLines() {
    const lines = document.querySelectorAll('.code-line');

    lines.forEach((line, index) => {
        const lineNumber = line.querySelector('.line-number');
        if (lineNumber) {
            lineNumber.textContent = index + 1;
        }

        line.style.opacity = '0';
        line.style.animation = `slideIn 0.3s ease-out ${index * 0.008}s forwards`;
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

// ─── Interacciones del usuario ──────────────────────────────────────────────────────
/**
 * Registra todos los listeners de interacción tras cada renderizado:
 * - Copiar al portapapeles (data-copy)
 * - Navegación por tabs y scroll activo
 * - Delegación a filtros de proyectos
 */
function initializeInteractions() {
    document.querySelectorAll('[data-copy]').forEach((element) => {
        const doCopy = async (event) => {
            event.preventDefault();
            try {
                await navigator.clipboard.writeText(element.dataset.copy);
                showToast(t('copied_to_clipboard'));
            } catch (error) {
                console.error(t('copy_error'), error);
            }
        };
        element.addEventListener('click', doCopy);
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                doCopy(event);
            }
        });
    });

    initializeProjectFilters();

    const mainContent = document.querySelector('.main-content');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = Array.from(document.querySelectorAll('.code-section'));

    function isContainerScrollable() {
        return mainContent.scrollHeight > mainContent.clientHeight;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (tab.dataset.external === 'true') {
                e.preventDefault();
                window.open(tab.getAttribute('href'), '_blank', 'noreferrer');
                return;
            }
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
            if (tab.dataset.external === 'true') {
                tab.classList.remove('active');
                tab.setAttribute('aria-current', 'false');
                return;
            }
            const isActive = tab.getAttribute('href') === `#${activeId}`;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        const sbSection = document.getElementById('sb-section');
        if (sbSection && activeId) {
            sbSection.textContent = getSectionLabel(activeId);
        }
    }

    mainContent.addEventListener('scroll', updateActiveTab, { passive: true });
    window.addEventListener('scroll', updateActiveTab, { passive: true });
    updateActiveTab();
}

/**
 * Registra los filtros de la sección PROJECTS: búsqueda por texto, tipo y tecnología.
 * Restaura los filtros guardados en localStorage y actualiza la visibilidad de tarjetas.
 */
function initializeProjectFilters() {
    const searchInput = document.getElementById('project-search');
    const typeSelect = document.getElementById('project-type');
    const techSelect = document.getElementById('project-tech');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const results = document.getElementById('project-results');
    const emptyState = document.getElementById('project-filter-empty');

    if (!searchInput || !typeSelect || !techSelect || !cards.length) {
        return;
    }

    let savedFilters = null;
    try {
        const rawSavedFilters = localStorage.getItem('portfolio-filters');
        savedFilters = rawSavedFilters ? JSON.parse(rawSavedFilters) : null;
    } catch (error) {
        savedFilters = null;
    }
    if (savedFilters) {
        searchInput.value = savedFilters.rawQuery || '';
        typeSelect.value = savedFilters.type || '';
        techSelect.value = savedFilters.tech || '';
        appState.projectFilters.query = normalizeSearchText(savedFilters.rawQuery || '');
        appState.projectFilters.type = savedFilters.type || '';
        appState.projectFilters.tech = savedFilters.tech || '';
    }

    const applyFilters = () => {
        appState.projectFilters.query = normalizeSearchText(searchInput.value || '');
        appState.projectFilters.type = typeSelect.value || '';
        appState.projectFilters.tech = techSelect.value || '';

        try {
            localStorage.setItem('portfolio-filters', JSON.stringify({
                rawQuery: searchInput.value || '',
                type: appState.projectFilters.type,
                tech: appState.projectFilters.tech
            }));
        } catch (error) {
            // Ignore storage errors (private mode / blocked storage)
        }

        let visibleCount = 0;

        cards.forEach((card) => {
            const queryMatches = !appState.projectFilters.query || (card.dataset.projectSearch || '').includes(appState.projectFilters.query);
            const typeMatches = !appState.projectFilters.type || card.dataset.projectType === appState.projectFilters.type;
            const techMatches = !appState.projectFilters.tech || (card.dataset.projectStack || '').includes(appState.projectFilters.tech);
            const visible = queryMatches && typeMatches && techMatches;

            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        if (results) {
            results.textContent = `${visibleCount} ${t('projects_matches')}`;
        }
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 250);
    });
    typeSelect.addEventListener('change', applyFilters);
    techSelect.addEventListener('change', applyFilters);

    applyFilters();
}

// ─── Command palette ───────────────────────────────────────────────────────────────
/**
 * Inicializa el command palette (atajo Ctrl+K / ⌘K).
 * Registra los listeners globales de teclado y los de clic en overlay, input y lista.
 * Solo se llama una vez al inicio (DOMContentLoaded).
 */
function initializeCommandPalette() {
    const overlay = document.getElementById('command-overlay');
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const list = document.getElementById('command-list');

    if (!overlay || !palette || !input || !list) {
        return;
    }

    document.addEventListener('keydown', (event) => {
        const isOpenShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

        if (isOpenShortcut) {
            event.preventDefault();
            openCommandPalette();
            return;
        }

        if (!appState.commandOpen) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeCommandPalette();
        }
    });

    overlay.addEventListener('click', closeCommandPalette);

    input.addEventListener('input', () => {
        appState.commandIndex = 0;
        renderCommandEntries();
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const maxIndex = Math.max(appState.commandEntries.length - 1, 0);
            appState.commandIndex = Math.min(appState.commandIndex + 1, maxIndex);
            renderCommandEntries();
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            appState.commandIndex = Math.max(appState.commandIndex - 1, 0);
            renderCommandEntries();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const entry = appState.commandEntries[appState.commandIndex];
            if (entry) {
                entry.action();
                closeCommandPalette();
            }
        }
    });

    list.addEventListener('click', (event) => {
        const item = event.target.closest('.command-item');
        if (!item) return;
        const index = Number(item.dataset.index);
        const entry = appState.commandEntries[index];
        if (!entry) return;
        entry.action();
        closeCommandPalette();
    });
}

/**
 * Abre el command palette: muestra overlay y panel, enfoca el input
 * y renderiza las entradas disponibles. Guarda el elemento activo para restaurarlo.
 */
function openCommandPalette() {
    const overlay = document.getElementById('command-overlay');
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('command-input');

    if (!overlay || !palette || !input) {
        return;
    }

    appState.lastActiveElement = document.activeElement;
    appState.commandOpen = true;
    appState.commandIndex = 0;

    overlay.hidden = false;
    palette.hidden = false;

    input.value = '';
    input.focus();

    renderCommandEntries();
}

/**
 * Cierra el command palette con animación CSS (`closing`).
 * Restaura el foco al elemento que estaba activo antes de abrirlo.
 */
function closeCommandPalette() {
    const overlay = document.getElementById('command-overlay');
    const palette = document.getElementById('command-palette');

    if (!overlay || !palette) {
        return;
    }

    appState.commandOpen = false;
    palette.classList.add('closing');
    palette.addEventListener('animationend', () => {
        palette.classList.remove('closing');
        overlay.hidden = true;
        palette.hidden = true;
        if (appState.lastActiveElement && typeof appState.lastActiveElement.focus === 'function') {
            appState.lastActiveElement.focus();
            appState.lastActiveElement = null;
        }
    }, { once: true });
}

/**
 * Devuelve el array de comandos disponibles en el command palette.
 * Incluye: navegar a sección, cambiar tema/idioma, copiar email, descargar CV, ver certificados.
 * @returns {{ label: string, keywords: string, action: Function }[]}
 */
function getCommandEntries() {
    const sectionIds = ['profile', 'stack', 'stats', 'experience', 'education', 'services', 'projects'];
    const entries = sectionIds.map((sectionId) => ({
        label: `${t('cmd_go_section')} ${getSectionLabel(sectionId)}`,
        keywords: `go section ${sectionId} ${getSectionLabel(sectionId)}`,
        action: () => scrollToSection(sectionId)
    }));

    entries.push({
        label: t('cmd_theme_next'),
        keywords: 'theme color',
        action: cycleTheme
    });

    entries.push({
        label: t('cmd_lang_next'),
        keywords: 'language idioma sprache',
        action: cycleLanguage
    });

    entries.push({
        label: t('cmd_copy_email'),
        keywords: 'email copy clipboard',
        action: async () => {
            const localizedData = appState.data ? localizeDeep(appState.data) : null;
            const email = localizedData?.personal?.email;
            if (!email) return;
            await navigator.clipboard.writeText(email);
            showToast(t('copied_to_clipboard'));
        }
    });

    entries.push({
        label: t('cmd_download_cv'),
        keywords: t('cmd_keywords_cv'),
        action: () => {
            const localizedData = appState.data ? localizeDeep(appState.data) : null;
            const cv = localizedData?.personal?.cv;
            if (!cv) return;
            const a = document.createElement('a');
            a.href = cv;
            a.download = '';
            a.click();
        }
    });

    entries.push({
        label: t('cmd_open_certificates'),
        keywords: t('cmd_keywords_certificates'),
        action: () => {
            window.open(CERTIFICATES_PDF_URL, '_blank', 'noreferrer');
        }
    });

    return entries;
}

/**
 * Filtra los comandos según el texto del input y los renderiza en la lista.
 * Aplica normalización para búsqueda insensible a tildes y mayúsculas.
 */
function renderCommandEntries() {
    const list = document.getElementById('command-list');
    const input = document.getElementById('command-input');
    if (!list || !input) return;

    const rawEntries = getCommandEntries();
    const query = normalizeSearchText(input.value || '');
    const filteredEntries = rawEntries.filter((entry) => {
        if (!query) return true;
        const haystack = normalizeSearchText(`${entry.label} ${entry.keywords || ''}`);
        return haystack.includes(query);
    });

    appState.commandEntries = filteredEntries;

    if (!filteredEntries.length) {
        list.innerHTML = `<li class="command-empty">${escapeHtml(t('cmd_no_results'))}</li>`;
        return;
    }

    if (appState.commandIndex >= filteredEntries.length) {
        appState.commandIndex = 0;
    }

    list.innerHTML = filteredEntries.map((entry, index) => {
        const activeClass = index === appState.commandIndex ? ' active' : '';
        return `<li class="command-item${activeClass}" data-index="${index}" role="option" aria-selected="${index === appState.commandIndex}">${escapeHtml(entry.label)}</li>`;
    }).join('');
}

// ─── Ciclo de tema / idioma ───────────────────────────────────────────────────────────
/** Rota al siguiente tema disponible en orden circular (Dark+ → Monokai → Abyss → ...). */
function cycleTheme() {
    const themes = Object.keys(VS_CODE_THEMES);
    const currentTheme = document.querySelector('.theme-btn.active')?.dataset.theme || DEFAULT_THEME;
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
}

/** Rota al siguiente idioma disponible en orden circular (es → en → de → ja → ...). */
function cycleLanguage() {
    const currentIndex = SUPPORTED_LANGS.indexOf(currentLang);
    const nextLang = SUPPORTED_LANGS[(currentIndex + 1) % SUPPORTED_LANGS.length];
    setLanguage(nextLang);
}

/**
 * Desplaza el contenedor `.main-content` hasta la sección identificada por `sectionId`.
 * @param {string} sectionId - ID del elemento destino (e.g. 'profile', 'projects').
 */
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    const mainContent = document.querySelector('.main-content');
    if (!target || !mainContent) return;

    const offset = target.getBoundingClientRect().top
        - mainContent.getBoundingClientRect().top
        + mainContent.scrollTop - 10;

    mainContent.scrollTo({ top: offset, behavior: 'smooth' });
}

// ─── Utilidades ──────────────────────────────────────────────────────────────────
/**
 * Normaliza un string para búsqueda: elimina tildes (NFD), convierte a minúsculas y recorta.
 * Ejemplo: 'Café' → 'cafe'.
 * @param {string} [value='']
 * @returns {string}
 */
function normalizeSearchText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Registra el handler de error en la imagen de perfil.
 * Si la imagen falla al cargar, agrega la clase `missing-image` al frame,
 * lo que hace visible el fallback con las iniciales del nombre (vía CSS).
 */
function initializeProfileImageFallback() {
    stateElements.profileImage.addEventListener('error', () => {
        stateElements.profileImage.closest('.profile-frame').classList.add('missing-image');
    });
}

/**
 * Construye y muestra la barra de estado inferior estilo VSCode.
 * Muestra: lenguaje, encoding, líneas totales, sección activa y atajo del command palette.
 * Inicializa el botón de imprimir/PDF.
 */
function initStatusBar() {
    const totalLines = document.querySelectorAll('.code-line').length;
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const shortcutKeys = isMac
        ? '<kbd>⌘</kbd><kbd>K</kbd>'
        : '<kbd>Ctrl</kbd><kbd>K</kbd>';
    stateElements.statusbar.innerHTML = `
        <div class="statusbar-left">
            <span class="statusbar-item">🐍 Python 3</span>
            <span class="statusbar-item">UTF-8</span>
            <span class="statusbar-item">${totalLines} ${escapeHtml(t('status_lines'))}</span>
        </div>
        <div class="statusbar-right">
            <span class="statusbar-item" id="sb-section">${escapeHtml(getSectionLabel('profile'))}</span>
            <span class="statusbar-item command-hint" id="sb-palette-hint" role="button" tabindex="0" title="${escapeHtml(t('cmd_open_palette'))}">${shortcutKeys}</span>
            <span class="statusbar-item" id="sb-print" role="button" tabindex="0" title="${escapeHtml(t('print_pdf'))}">⎙</span>
        </div>
    `;
    stateElements.statusbar.hidden = false;

    const hint = document.getElementById('sb-palette-hint');
    if (hint) {
        hint.addEventListener('click', openCommandPalette);
        hint.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCommandPalette();
            }
        });
    }

    const printBtn = document.getElementById('sb-print');
    if (printBtn) {
        printBtn.style.cursor = 'pointer';
        const openCvPdf = () => {
            const localizedData = appState.data ? localizeDeep(appState.data) : null;
            const cv = localizedData?.personal?.cv;
            if (cv) {
                window.open(cv, '_blank', 'noreferrer');
            }
        };
        printBtn.addEventListener('click', openCvPdf);
        printBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCvPdf();
            }
        });
    }
}

/**
 * Muestra un mensaje de error en el área de carga del portfolio.
 * Agrega una sugerencia adicional si el protocolo es `file://`.
 * @param {Error} error - Error capturado en loadPortfolio.
 */
function showError(error) {
    const hint = window.location.protocol === 'file:'
        ? t('load_error_hint')
        : '';

    stateElements.loading.textContent = `${t('load_error_ui')}: ${error.message}.${hint}`;
}

/**
 * Muestra un toast flotante con `message` durante ~1.8 s y lo elimina del DOM.
 * @param {string} message - Mensaje a mostrar.
 */
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

/**
 * Actualiza dinámicamente el SEO: `<title>`, meta description,
 * Open Graph, Twitter Cards y el bloque JSON-LD de schema.org (tipo Person).
 * @param {Object} localizedData - Datos ya localizados del portfolio.
 */
function updateSeo(localizedData) {
    const title = `${localizedData.personal.name} - ${t('seo_title')}`;
    const description = localizedData.summary || t('seo_description');

    document.title = title;

    const setMeta = (selector, value) => {
        const meta = document.querySelector(selector);
        if (meta) {
            meta.setAttribute('content', value);
        }
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    const structuredDataNode = document.getElementById('structured-data');
    if (!structuredDataNode) return;

    const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href;
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const absoluteImage = image.startsWith('http') ? image : new URL(image, canonicalUrl).toString();

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: localizedData.personal.name,
        jobTitle: localizedData.personal.title,
        description,
        url: canonicalUrl,
        image: absoluteImage,
        knowsAbout: localizedData.techStack || [],
        sameAs: (localizedData.media || []).map((item) => item.url).filter(Boolean)
    };

    structuredDataNode.textContent = JSON.stringify(structuredData);
}

// ─── Traducciones + localización ─────────────────────────────────────────────────────────
/**
 * Resuelve una clave de traducción en el idioma activo (`currentLang`).
 * Fallback a español y luego a la propia clave si no existe traducción.
 * @param {string} key - Clave de I18N.
 * @returns {string}
 */
function t(key) {
    return I18N[currentLang]?.[key] || I18N.es[key] || key;
}

/**
 * Devuelve la etiqueta traducida de una sección por su ID (e.g. 'profile' → 'PROFILE').
 * @param {string} sectionId
 * @returns {string}
 */
function getSectionLabel(sectionId) {
    return t(`section_${sectionId}`);
}

/**
 * Devuelve el locale BCP 47 del idioma activo (e.g. 'es-AR', 'en-US', 'de-DE', 'ja-JP').
 * @returns {string}
 */
function getCurrentLocale() {
    return LOCALE_BY_LANG[currentLang] || LOCALE_BY_LANG.es;
}

/**
 * Devuelve true si el objeto es un mapa de idiomas (todas sus claves son idiomas soportados).
 * Ejemplo: { es: '...', en: '...', de: '...', ja: '...' } → true.
 * @param {*} value
 * @returns {boolean}
 */
function isLanguageMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const keys = Object.keys(value);
    return keys.length > 0 && keys.every((key) => SUPPORTED_LANGS.includes(key));
}

/**
 * Recorre recursivamente cualquier valor (objeto, array, primitivo) y resuelve
 * todos los language maps al idioma activo. Preserva arrays y objetos no-lingüísticos.
 * @param {*} value - Valor a localizar.
 * @returns {*} Valor con todos los language maps reemplazados por el string del idioma activo.
 */
function localizeDeep(value) {
    if (Array.isArray(value)) {
        return value.map((item) => localizeDeep(item));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    if (isLanguageMap(value)) {
        return value[currentLang] || value.es || Object.values(value)[0] || '';
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, localizeDeep(nestedValue)])
    );
}

/**
 * Genera el HTML de un array estilo Python con sus elementos como strings coloreados.
 * Ejemplo: ["HTML", "CSS"] → `["HTML", "CSS"]` con clases de sintaxis.
 * @param {string[]} [items=[]]
 * @returns {string}
 */
function buildStringArray(items = []) {
    const values = items.map((item) => `<span class="string">"${escapeHtml(item)}"</span>`).join('<span class="operator">, </span>');
    return `<span class="bracket">[</span>${values}<span class="bracket">]</span>`;
}

/**
 * Extrae las dos primeras iniciales en mayúscula de un nombre completo.
 * Ejemplo: "Martín Pentito" → "MP".
 * @param {string} [name='']
 * @returns {string}
 */
function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

/**
 * Convierte un string a snake_case sin tildes ni caracteres especiales.
 * Ejemplo: "Martín Pentito" → "martin_pentito".
 * @param {string} [value='']
 * @returns {string}
 */
function toSnakeCaseName(value = '') {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
}

// ─── Seguridad: escape de HTML ─────────────────────────────────────────────────────────
/**
 * Escapa los 5 caracteres HTML peligrosos (&, <, >, ", ') para prevenir XSS
 * al insertar strings de datos del usuario en el DOM vía innerHTML.
 * @param {string} [value='']
 * @returns {string}
 */
function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Alias semántico de escapeHtml para uso explícito en atributos HTML
 * (e.g. href, data-*, aria-label). Aplica el mismo escapado.
 * @param {string} [value='']
 * @returns {string}
 */
function escapeAttribute(value = '') {
    return escapeHtml(value);
}

// ─── PWA: registro del Service Worker ───────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // SW no disponible (file:// o privado) — ignorar silenciosamente
        });
    });
}
