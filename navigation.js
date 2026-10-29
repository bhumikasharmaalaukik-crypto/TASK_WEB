// =====================================================
// login.js: view switching + form validation
// =====================================================

// ---------- 1. Views (sign in / register) ----------
const views = {
  login: {
    element: document.getElementById("login-view"),
    title: "Sign in | TaskFlow",
  },
  register: {
    element: document.getElementById("register-view"),
    title: "Create account | TaskFlow",
  },
};

const DEFAULT_VIEW = "login";

function getViewFromHash() {
  const name = location.hash.slice(1);                       // "#register" -> "register"
  return Object.hasOwn(views, name) ? name : DEFAULT_VIEW;
}

// Conditional rendering: show one view, hide the other
function showView(name, { focus = false } = {}) {
  for (const [key, view] of Object.entries(views)) {
    view.element.hidden = key !== name;
  }

  document.title = views[name].title;

  if (focus) {
    views[name].element.querySelector("input").focus();
  }
}

// Change view without reloading, and keep the browser's back button working
function goToView(name) {
  history.pushState({ view: name }, "", `#${name}`);
  showView(name, { focus: true });
}

function handleNavClick(event) {
  const link = event.target.closest("[data-view]");
  if (!link) return;

  event.preventDefault();
  goToView(link.dataset.view);
}

function handleHistoryChange() {
  showView(getViewFromHash(), { focus: true });
}

// ---------- 2. Validation rules ----------
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

// Each validator returns an error message, or "" when the value is valid.
// `form` is passed in so a rule can look at other fields (see "confirm").
const validators = {
  name(value) {
    const name = value.trim();
    if (!name) return "Please enter your full name.";
    if (name.length < MIN_NAME_LENGTH) {
      return `Your name must be at least ${MIN_NAME_LENGTH} characters.`;
    }
    return "";
  },

  email(value) {
    const email = value.trim();
    if (!email) return "Please enter your email address.";
    if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like name@example.com.";
    return "";
  },

  password(value) {
    if (!value) return "Please enter your password.";
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }
    return "";
  },

  confirm(value, form) {
    const password = form.querySelector('[data-rule="password"]').value;
    if (!value) return "Please confirm your password.";
    if (value !== password) return "Passwords do not match.";
    return "";
  },
};

// ---------- 3. Showing and clearing errors ----------
function showError(input, message) {
  document.getElementById(input.getAttribute("aria-describedby")).textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");   // CSS styles this
}

function clearField(input) {
  document.getElementById(input.getAttribute("aria-describedby")).textContent = "";
  input.removeAttribute("aria-invalid");
}

function setStatus(form, message) {
  form.querySelector(".form-status").textContent = message;
}

// Runs the right validator for a field. Returns true when the field is valid.
function validateField(input) {
  const message = validators[input.dataset.rule](input.value, input.form);
  showError(input, message);
  return message === "";
}

// ---------- 4. Form event handlers ----------
function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = [...form.querySelectorAll("[data-rule]")];

  const results = fields.map(validateField);                 // check every field so all errors show
  const firstInvalid = fields[results.indexOf(false)];

  if (firstInvalid) {
    setStatus(form, "");
    firstInvalid.focus();
    return;
  }

  // Demo only: pretend to contact a server for a moment
  const button = form.querySelector(".btn-submit");
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Please wait...";

  setTimeout(() => {
    button.disabled = false;
    button.textContent = label;
    form.reset();
    fields.forEach(clearField);

    if (form.id === "register-form") {
      setStatus(form, "Account created! Taking you to sign in...");
      setTimeout(() => {
        setStatus(form, "");
        goToView("login");
      }, 1400);
    } else {
      setStatus(form, "Signed in successfully. (Demo only: no server yet.)");
    }
  }, 1200);
}

// When the user leaves a field, check it (but don't nag about untouched empty fields)
function handleFocusOut(event) {
  const input = event.target;
  if (!input.matches("[data-rule]")) return;

  const alreadyChecked = input.hasAttribute("aria-invalid");
  if (input.value === "" && !alreadyChecked) return;
  validateField(input);
}

// While typing: once a field has been checked, re-check it so errors clear as soon as they are fixed
function handleInput(event) {
  const input = event.target;
  if (!input.matches("[data-rule]")) return;

  setStatus(input.form, "");
  if (input.hasAttribute("aria-invalid")) validateField(input);

  // Changing the password can change whether "confirm password" matches
  if (input.dataset.rule === "password") {
    const confirm = input.form.querySelector('[data-rule="confirm"]');
    if (confirm && confirm.hasAttribute("aria-invalid")) validateField(confirm);
  }
}

// Show / hide password (works for every password field through data-target)
function handlePasswordToggle(event) {
  const button = event.target.closest(".toggle-password");
  if (!button) return;

  const input = document.getElementById(button.dataset.target);
  const show = input.type === "password";

  input.type = show ? "text" : "password";
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  button.querySelector("use").setAttribute("href", show ? "#icon-eye-off" : "#icon-eye");
}

// ---------- 5. Attach listeners ----------
document.addEventListener("click", handleNavClick);
document.addEventListener("click", handlePasswordToggle);
window.addEventListener("popstate", handleHistoryChange);

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("focusout", handleFocusOut);         // focusout bubbles, so one listener covers all fields
  form.addEventListener("input", handleInput);
});

// ---------- 6. Decorative background: twinkling stars ----------
function random(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function createStars(count = 70) {
  const container = document.getElementById("stars");
  if (!container) return;

  const fragment = document.createDocumentFragment();     // build off-screen, add once

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    const size = Math.random() < 0.12 ? 3 : Math.random() < 0.5 ? 2 : 1;   // mostly small, a few big

    star.className = size === 3 ? "star star--glow" : "star";
    star.style.cssText = `
      left: ${random(0, 100)}%;
      top: ${random(0, 100)}%;
      width: ${size}px;
      height: ${size}px;
      --o: ${random(0.3, 0.9)};
      --d: ${random(2.5, 6)}s;
      --delay: ${random(0, 5)}s;
    `;
    fragment.append(star);
  }

  container.append(fragment);
}

// ---------- 7. Initial render ----------
showView(getViewFromHash());
createStars();
// ---------- Theme toggle ----------
const themeToggle = document.getElementById("theme-toggle");

function updateToggleLabel() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem("theme", next);             // remember the choice
  } catch {
    // storage blocked: the toggle still works, it just won't be remembered
  }
  updateToggleLabel();
});

updateToggleLabel();