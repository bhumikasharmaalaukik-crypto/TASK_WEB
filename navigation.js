
const views = {
  login: {
    element: document.getElementById("login-view"),
    title: "Login",
  },
  register: {
    element: document.getElementById("register-view"),
    title: "Register",
  },
};

const DEFAULT_VIEW = "login";

// ---------- 2. Helper: which view does the URL ask for? ----------
function getViewFromHash() {
  const name = location.hash.slice(1);               // "#register" -> "register"
  return Object.hasOwn(views, name) ? name : DEFAULT_VIEW;
}

// ---------- 3. Conditional rendering: show one view, hide the rest ----------
function showView(name, { focus = false } = {}) {
  for (const [key, view] of Object.entries(views)) {
    view.element.hidden = key !== name;
  }

  document.title = views[name].title;

  if (focus) {
    views[name].element.querySelector("input").focus();
  }
}

// ---------- 4. Event handling ----------
// One listener handles every navigation link (event delegation)
function handleNavClick(event) {
  const link = event.target.closest("[data-view]");
  if (!link) return;                                  // click was not on a nav link

  event.preventDefault();                             // stop the page reload
  const name = link.dataset.view;

  history.pushState({ view: name }, "", `#${name}`);  // update the URL, no reload
  showView(name, { focus: true });
}

// Back / forward buttons
function handleHistoryChange() {
  showView(getViewFromHash(), { focus: true });
}

document.addEventListener("click", handleNavClick);
window.addEventListener("popstate", handleHistoryChange);

showView(getViewFromHash());
// Show / hide password (event delegation again)
function handlePasswordToggle(event) {
  const button = event.target.closest(".toggle-password");
  if (!button) return;

  const input = document.getElementById(button.dataset.target);
  const show = input.type === "password";

  input.type = show ? "text" : "password";
  button.setAttribute("aria-pressed", String(show));
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  button.querySelector("use").setAttribute("href", show ? "#icon-eye-off" : "#icon-eye");
}

document.addEventListener("click", handleNavClick);
document.addEventListener("click", handlePasswordToggle);