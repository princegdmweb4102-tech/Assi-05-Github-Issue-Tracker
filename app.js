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

  if (!data.length) {
    container.classList.add("hidden");
    noData.classList.remove("hidden");
    noData.classList.add("flex");
    if (countEl) countEl.textContent = "0 Issues";
    return;
  }

  noData.classList.add("hidden");
  noData.classList.remove("flex");
  container.classList.remove("hidden");

  if (countEl) {
    countEl.innerHTML = `
      <img src="./assets/Aperture.png" class="w-5 h-5 mr-1 inline-block" alt="Issues">
      ${data.length} Issue${data.length > 1 ? "s" : ""}
    `;
  }

  data.forEach((item) => {
    const isClosed = item.status?.toLowerCase() === "closed";
    const title = item.title || "No Title";
    const description = item.description || "No description provided...";
    const shortDesc = description.length > 80 ? description.substring(0, 80) + "..." : description;

    const card = `
      <div class="bg-white rounded-md shadow-sm border-t-4 ${isClosed ? "border-[#8b5cf6]" : "border-[#10b981]"} border-x border-b border-gray-200 p-6 hover:shadow transition-shadow cursor-pointer flex flex-col h-full" onclick="openModal('${item.id}')">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center justify-center w-8 h-8 rounded-full ${isClosed ? "bg-[#f3e8ff]" : "bg-[#d1fae5]"}">
            <img src="${isClosed ? "./assets/Closed- Status .png" : "./assets/Open-Status.png"}" class="w-4 h-4" alt="${item.status || "Open"}">
          </div>
          ${renderPriorityBadge(item.priority)}
        </div>
        <h4 class="font-bold text-[#1f2937] text-[18px] mb-3 line-clamp-2 leading-snug">${title}</h4>
        <p class="text-[#64748b] text-[14px] mb-5 flex-grow line-clamp-3 leading-relaxed">${shortDesc}</p>
        <div class="flex flex-wrap gap-2 mb-6">${renderLabels(item.label || item.labels)}</div>
        <div class="pt-4 border-t border-gray-200 mt-auto flex flex-col gap-1.5 text-sm text-[#64748b]">
          <span class="font-medium">#${item.id || Math.floor(Math.random() * 1000)} by ${item.author || "User"}</span>
          <span class="font-medium">${new Date(item.createdAt || Date.now()).toLocaleDateString("en-US")}</span>
        </div>
      </div>`;

    container.innerHTML += card;
  });
}

function renderPriorityBadge(priority) {
  const prio = (priority || "Medium").toUpperCase();
  const styles = {
    HIGH: "bg-[#fee2e2] text-[#ef4444]",
    MEDIUM: "bg-[#fef3c7] text-[#d97706]",
    LOW: "bg-[#f1f5f9] text-[#64748b]",
  };
  return `<span class="${styles[prio] || styles.MEDIUM} px-4 py-1 rounded-full text-xs font-semibold tracking-wide">${prio}</span>`;
}

function renderLabels(labelsStr) {
  const labels = Array.isArray(labelsStr)
    ? labelsStr
    : typeof labelsStr === "string"
    ? labelsStr.split(",")
    : ["bug"];

  return labels.slice(0, 2).map((l) => {
    const label = l.toLowerCase();
    if (label === "bug") {
      return `<span class="text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 uppercase tracking-wide">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        ${l}</span>`;
    }
    if (label.includes("help")) {
      return `<span class="text-[#d97706] bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 uppercase tracking-wide">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ${l}</span>`;
    }
    return `<span class="text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 uppercase tracking-wide">${l}</span>`;
  }).join("");
}
