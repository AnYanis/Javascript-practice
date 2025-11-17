import { products } from '../../data/products.js';

export function searchBarAll(){
  // Search wiring: case-insensitive search by product name and scroll to the first match
  const input = document.querySelector('.js-search-bar');
  const btn = document.querySelector('.js-search-button');
  const box = document.querySelector('.js-search-suggestions');
  let currentIndex = -1; // highlighted suggestion index
  let currentResults = [];

  function performSearch() {
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const match = products.find(p => (p.name || '').toLowerCase().includes(q));
    if (!match) return;
    const el = document.querySelector(`[data-product-id="${match.id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('search-hit');
    setTimeout(() => el.classList.remove('search-hit'), 1500);
  }

  function clearSuggestions() {
    if (box) {
      box.style.display = 'none';
      box.innerHTML = '';
    }
    currentIndex = -1;
    currentResults = [];
  }

  function renderSuggestions(query) {
    if (!box) return;
    const q = query.trim().toLowerCase();
    if (!q) { clearSuggestions(); return; }
    // Top 8 matches by name contains
    currentResults = products.filter(p => (p.name || '').toLowerCase().includes(q)).slice(0, 8);
    if (!currentResults.length) { clearSuggestions(); return; }
    const itemsHTML = currentResults.map((p, i) => `
      <div class="suggestion-item" data-index="${i}" data-product-id="${p.id}" style="padding:10px 12px; cursor:pointer; display:flex; align-items:center; gap:8px; background:white;">
        <img src="${p.image}" alt="" style="width:28px; height:28px; object-fit:contain;">
        <span style="flex:1;">${p.name}</span>
      </div>
    `).join('');
    box.innerHTML = itemsHTML;
    box.style.display = 'block';

    // Mouse interactions
    box.querySelectorAll('.suggestion-item').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const idx = Number(el.getAttribute('data-index'));
        highlightIndex(idx);
      });
      el.addEventListener('mousedown', (e) => { // use mousedown to fire before input blur
        e.preventDefault();
        const idx = Number(el.getAttribute('data-index'));
        selectByIndex(idx);
      });
    });
    // When cursor leaves the dropdown, clear highlight
    box.addEventListener('mouseleave', () => {
      highlightIndex(-1);
    }, { once: true });
  }

  function highlightIndex(idx) {
    const nodes = box ? box.querySelectorAll('.suggestion-item') : [];
    nodes.forEach((n, i) => {
      n.style.background = i === idx ? '#b5c7d8ff' : 'white';
    });
    currentIndex = idx;
  }

  function selectByIndex(idx) {
    if (idx < 0 || idx >= currentResults.length) return;
    const p = currentResults[idx];
    input.value = p.name;
    clearSuggestions();
    const el = document.querySelector(`[data-product-id="${p.id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('search-hit');
    setTimeout(() => el.classList.remove('search-hit'), 1500);
  }

  if (btn) btn.addEventListener('click', () => {
    if (currentIndex >= 0) selectByIndex(currentIndex); else performSearch();
  });
  if (input) {
    input.addEventListener('input', () => renderSuggestions(input.value));
    input.addEventListener('focus', () => renderSuggestions(input.value));
    input.addEventListener('blur', () => setTimeout(clearSuggestions, 150));
    input.addEventListener('keydown', (e) => {
      const count = currentResults.length;
      if (e.key === 'ArrowDown' && count) {
        e.preventDefault();
        const next = currentIndex < count - 1 ? currentIndex + 1 : 0;
        highlightIndex(next);
      } else if (e.key === 'ArrowUp' && count) {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : count - 1;
        highlightIndex(prev);
      } else if (e.key === 'Enter') {
        if (currentIndex >= 0) selectByIndex(currentIndex); else performSearch();
      } else if (e.key === 'Escape') {
        clearSuggestions();
      }
    });
  }
}