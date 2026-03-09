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