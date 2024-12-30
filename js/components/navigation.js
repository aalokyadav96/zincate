// Navigation Component
import { state } from "../state/state.js";
import { navigate } from "../routes/index.js";
import { logout } from "../services/auth/authService.js";

// Utility Functions
function toggleElement(selector, className) {
    const element = document.querySelector(selector);
    element?.classList.toggle(className);
}

function closeElement(selector, className) {
    const element = document.querySelector(selector);
    element?.classList.remove(className);
}

function handleNavigation(event, href) {
    event.preventDefault();
    navigate(href);
}

function createDropdown(id, label, links) {
    const dropdown = document.createElement("li");
    dropdown.className = "dropdown";

    const button = document.createElement("button");
    button.className = "dropdown-toggle";
    button.id = id;
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");
    button.textContent = label;

    const menu = document.createElement("div");
    menu.className = "dropdown-menu";
    menu.setAttribute("aria-label", `${label} Menu`);

    links.forEach(link => {
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.className = "dropdown-item nav-link";
        anchor.textContent = link.text;
        menu.appendChild(anchor);
    });

    dropdown.appendChild(button);
    dropdown.appendChild(menu);
    return dropdown;
}

function createNavItem(href, label) {
    const li = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.className = "nav-link";
    anchor.textContent = label;
    li.appendChild(anchor);
    return li;
}

function createProfileDropdown(user) {
    const dropdown = document.createElement("li");
    dropdown.className = "dropdown";

    const toggle = document.createElement("div");
    toggle.className = "profile-dropdown-toggle";
    toggle.tabIndex = 0;

    const image = document.createElement("img");
    image.src = `/userpic/thumb/${user || 'default'}.jpg`;
    image.alt = "Profile Picture";
    image.className = "profile-image";

    toggle.appendChild(image);

    const menu = document.createElement("div");
    menu.className = "profile-dropdown-menu";

    const links = [
        { href: "/profile", text: "Profile" },
        { href: "/settings", text: "Settings" },
    ];

    links.forEach(link => {
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.className = "dropdown-item nav-link";
        anchor.textContent = link.text;
        menu.appendChild(anchor);
    });

    const logoutButton = document.createElement("button");
    logoutButton.className = "dropdown-item logout-btn";
    logoutButton.textContent = "Logout";
    menu.appendChild(logoutButton);

    dropdown.appendChild(toggle);
    dropdown.appendChild(menu);
    return dropdown;
}

function createNav() {
    const isLoggedIn = Boolean(state.token);

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
        { href: '/places', label: 'Places' },
        { href: '/feed', label: 'Feed' },
        { href: '/search', label: 'Search' },
    ];

    // Create Header
    const header = document.createElement("header");
    header.className = "navbar";

    const navbarContainer = document.createElement("div");
    navbarContainer.className = "navbar-container";

    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    const logoLink = document.createElement("a");
    logoLink.href = "/";
    logoLink.className = "logo-link";
    logoLink.textContent = "Show Saw";
    logoDiv.appendChild(logoLink);

    const nav = document.createElement("nav");
    nav.className = "nav-menu";

    const ul = document.createElement("ul");
    ul.className = "nav-list";

    // Add Create Dropdown
    const createDrop = createDropdown("create-menu", "Create", [
        { href: "/create-event", text: "Eva" },
        { href: "/create-place", text: "Loca" },
    ]);
    ul.appendChild(createDrop);

    // Add Navigation Items
    navItems.forEach(item => ul.appendChild(createNavItem(item.href, item.label)));

    // Add Auth/Logout/Profile Dropdown
    if (isLoggedIn) {
        ul.appendChild(createProfileDropdown(state.user));
    } else {
        const loginLi = document.createElement("li");
        const loginButton = document.createElement("button");
        loginButton.className = "btn auth-btn nav-link";
        loginButton.textContent = "Login";
        loginLi.appendChild(loginButton);
        ul.appendChild(loginLi);
    }

    nav.appendChild(ul);

    const mobileMenu = document.createElement("div");
    mobileMenu.className = "mobile-menu-icon";
    mobileMenu.innerHTML = `M`;
    nav.appendChild(mobileMenu);

    navbarContainer.appendChild(logoDiv);
    navbarContainer.appendChild(nav);
    header.appendChild(navbarContainer);

    return header;
}

function attachNavEventListeners() {
    // Login button
    document.querySelector('.auth-btn')?.addEventListener('click', () => navigate('/login'));

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => handleNavigation(e, link.getAttribute('href')));
    });

    // Mobile menu toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    mobileMenuIcon?.addEventListener('click', () => {
        const isExpanded = mobileMenuIcon.getAttribute('aria-expanded') === 'true';
        mobileMenuIcon.setAttribute('aria-expanded', !isExpanded);
        toggleElement('.nav-list', 'active');
    });

    // Close mobile menu on navigation
    document.querySelectorAll('.nav-list .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeElement('.nav-list', 'active');
            mobileMenuIcon.setAttribute('aria-expanded', 'false');
        });
    });

    // Create dropdown toggle
    const createToggle = document.getElementById('create-menu');
    createToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleElement('.dropdown-menu', 'show');
    });

    // Profile dropdown toggle
    const profileToggle = document.querySelector('.profile-dropdown-toggle');
    profileToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleElement('.profile-dropdown-menu', 'show');
    });

    // Close profile dropdown on outside click
    document.addEventListener('click', () => closeElement('.profile-dropdown-menu', 'show'));

    // Keyboard accessibility for profile dropdown
    profileToggle?.addEventListener('keydown', (e) => {
        if (['Enter', ' '].includes(e.key)) {
            toggleElement('.profile-dropdown-menu', 'show');
            e.preventDefault();
        }
    });

    // Logout button
    document.querySelector('.logout-btn')?.addEventListener('click', async () => {
        await logout();
    });
}

export { createNav, attachNavEventListeners, createDropdown };
