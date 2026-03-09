const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SEARCH_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

let allIssues = [];
let currentFilter = "All";

document.addEventListener("DOMContentLoaded", () => {
  loadIssues();
  initSearch();
});

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  let timeout = null;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const query = e.target.value.trim();
      query ? searchIssues(query) : loadIssues();
    }, 300);
  });
}


async function loadIssues() {
  showLoading(true);
  try {
    const res = await fetch(API_URL).then((r) => r.json());
    allIssues = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    console.log("Loaded issues:", allIssues);
    filterIssues(currentFilter);
  } catch (err) {
    console.error("Failed to load issues", err);
  }
  showLoading(false);
}

async function searchIssues(query) {
  showLoading(true);
  try {
    const res = await fetch(SEARCH_URL + encodeURIComponent(query)).then((r) => r.json());
    allIssues = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    filterIssues(currentFilter);
  } catch (err) {
    console.error("Search failed", err);
  }
  showLoading(false);
}

function showLoading(isLoading) {
  const spinner = document.getElementById("loadingSpinner");
  const container = document.getElementById("issuesContainer");

  spinner.classList.toggle("hidden", !isLoading);
  spinner.classList.toggle("flex", isLoading);
  container.classList.toggle("hidden", isLoading);
}

function filterIssues(status) {
  currentFilter = status;
  updateTabStyles(status);

  const filtered = status === "All"
    ? allIssues
    : allIssues.filter((item) => item.status?.toLowerCase() === status.toLowerCase());

  renderIssues(filtered);
}

function updateTabStyles(activeStatus) {
  const tabs = ["All", "Open", "Closed"];
  tabs.forEach((t) => {
    const btn = document.getElementById(`tab-${t}`);
    if (!btn) return;

    const isActive = t.toLowerCase() === activeStatus.toLowerCase();
    btn.className = isActive
      ? "tab-btn px-6 py-2 rounded-md font-medium bg-[#4f46e5] text-white whitespace-nowrap transition-colors"
      : "tab-btn px-6 py-2 rounded-md font-medium bg-transparent text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-colors";
  });
}

function renderIssues(data) {
  const container = document.getElementById("issuesContainer");
  const countEl = document.getElementById("issueCount");
  const noData = document.getElementById("noDataMessage");

  container.innerHTML = "";