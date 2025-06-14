const dataUrl = 'Small_Testing.json';

let allData = [];
let selectedCategory = null;
let selectedTypes = new Set();

const categoryButtons = document.querySelectorAll('.category-btn');
const typesContainer = document.getElementById('types-of-assistance-container');
const typesList = document.getElementById('types-of-assistance-list');
const resultsContainer = document.getElementById('results-container');
const resultsList = document.getElementById('results-list');

// Load JSON data statically (simulate)
fetch(dataUrl)
  .then(response => response.json())
  .then(data => {
    allData = data;
    setupCategoryButtons();
  });

function setupCategoryButtons() {
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.category;
      selectedTypes.clear();
      displayTypesOfAssistance();
      clearResults();
    });
  });
}

function displayTypesOfAssistance() {
  // Extract unique Types of Assistance associated with selectedCategory
  const typesSet = new Set();

  allData.forEach(org => {
    const categories = org.Categories || '';
    if (categories.toLowerCase().includes(selectedCategory.toLowerCase())) {
      const types = org['Types of Assistance'] || '';
      types.split(',').forEach(t => {
        if (t.trim()) typesSet.add(t.trim());
      });
    }
  });

  const typesArray = Array.from(typesSet).sort((a, b) => a.localeCompare(b));

  // Render checkboxes
  typesList.innerHTML = '';
  if (typesArray.length === 0) {
    typesContainer.style.display = 'none';
    return;
  }
  typesContainer.style.display = 'block';

  typesArray.forEach(type => {
    const label = document.createElement('label');
    label.className = 'type-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = type;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedTypes.add(type);
      else selectedTypes.delete(type);
      filterAndDisplayResults();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(type));
    typesList.appendChild(label);
  });
}

function filterAndDisplayResults() {
  resultsList.innerHTML = '';

  if (!selectedCategory) {
    resultsContainer.style.display = 'none';
    return;
  }

  // Filter organizations by selectedCategory AND any selectedTypes (if any)
  const filtered = allData.filter(org => {
    const categories = org.Categories || '';
    if (!categories.toLowerCase().includes(selectedCategory.toLowerCase())) return false;

    if (selectedTypes.size === 0) return true; // no type filter means all for category

    const types = org['Types of Assistance'] || '';
    // Check if any selectedTypes are substring of types field (literal match)
    for (const t of selectedTypes) {
      if (types.toLowerCase().includes(t.toLowerCase())) return true;
    }
    return false;
  });

  if (filtered.length === 0) {
    resultsList.innerHTML = '<p>No organizations found.</p>';
    resultsContainer.style.display = 'block';
    return;
  }

  // Render results according to layout rules:
  filtered.forEach(org => {
    const orgDiv = document.createElement('div');
    orgDiv.className = 'organization';

    // Organization Name: 16pt bold, title case, centered
    const orgName = document.createElement('h3');
    orgName.textContent = toTitleCase(org['Organization Name'] || '');
    orgName.className = 'org-name';
    orgDiv.appendChild(orgName);

    // Render other fields line by line with "Field Name – Content" style
    const fieldsToRender = [
      'Veteran Resources',
      'Types of Assistance',
      'Website',
      'Email',
      'Phone',
      'Contact Name',
      'Contact Title',
      'Contact Email',
      'Contact Phone',
      'Eligibility Requirements',
      'Application Process',
      'Documents Required',
      'Notes',
      'Distance from 34470 (mi)',
      'Address',
      'Operating Hours'
    ];

    fieldsToRender.forEach(field => {
      const content = org[field];
      if (content && content.trim() !== '') {
        const line = document.createElement('p');
        line.className = 'field-line';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'field-title';
        titleSpan.textContent = `${field} – `;

        const contentSpan = document.createElement('span');
        contentSpan.className = 'field-content';

        // Make certain fields clickable
        if (['Website', 'Email', 'Phone', 'Contact Email', 'Contact Phone', 'Address'].includes(field)) {
          let link = null;
          if (field === 'Website') {
            link = document.createElement('a');
            link.href = content;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = content;
          } else if (field === 'Email' || field === 'Contact Email') {
            link = document.createElement('a');
            link.href = `mailto:${content}`;
            link.textContent = content;
          } else if (field === 'Phone' || field === 'Contact Phone') {
            link = document.createElement('a');
            link.href = `tel:${content}`;
            link.textContent = content;
          } else if (field === 'Address') {
            link = document.createElement('a');
            link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content)}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = content;
          }
          if (link) contentSpan.appendChild(link);
          else contentSpan.textContent = content;
        } else {
          contentSpan.textContent = content;
        }

        line.appendChild(titleSpan);
        line.appendChild(contentSpan);
        orgDiv.appendChild(line);
      }
    });

    resultsList.appendChild(orgDiv);
  });

  resultsContainer.style.display = 'block';
}

function clearResults() {
  resultsList.innerHTML = '';
  resultsContainer.style.display = 'none';
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}
