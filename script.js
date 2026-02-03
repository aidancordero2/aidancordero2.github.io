// Smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Add animation on scroll for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements with fade-in class
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.about-card, .research-item, .news-item, .team-card, .research-area-card, .tool-card, .opportunity-card');
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Load team members if on team page
    if (document.getElementById('team-container')) {
        loadTeamMembers();
    }
    
    // Load publications if on publications page
    if (document.getElementById('publications-container')) {
        loadPublications();
    }
});

// ===== TEAM PAGE DYNAMIC LOADING =====

// SVG icons for social links
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;

const scholarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>`;

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    return data;
}

// Parse a single CSV line (handles commas in quoted fields)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Create HTML for a team member
function createTeamMemberHTML(member, isPI = false) {
    const name = member['Name'] || '';
    const position = member['Position'] || '';
    const photo = member['Photo'] || '';
    const github = member['GitHub'] || '';
    const scholar = member['GoogleScholar'] || '';
    
    // Create photo HTML
    let photoHTML;
    if (photo) {
        photoHTML = `<img src="${photo}" alt="${name}">`;
    } else {
        photoHTML = `<div class="photo-placeholder">👤</div>`;
    }
    
    // Create social links HTML - always show both icons
    let githubHTML, scholarHTML;
    
    if (github) {
        githubHTML = `<a href="${github}" class="team-social" title="GitHub" target="_blank">${githubIcon}</a>`;
    } else {
        githubHTML = `<span class="team-social disabled" title="GitHub">${githubIcon}</span>`;
    }
    
    if (scholar) {
        scholarHTML = `<a href="${scholar}" class="team-social" title="Google Scholar" target="_blank">${scholarIcon}</a>`;
    } else {
        scholarHTML = `<span class="team-social disabled" title="Google Scholar">${scholarIcon}</span>`;
    }
    
    return `
        <div class="team-member">
            <div class="member-photo">
                ${photoHTML}
            </div>
            <h3 class="member-name">${name}</h3>
            <p class="member-role">${position}</p>
            <div class="member-links">${githubHTML}${scholarHTML}</div>
        </div>
    `;
}

// Create a section with header and members
function createSectionHTML(sectionName, members, isPI = false) {
    if (members.length === 0) return '';
    
    const gridClass = isPI ? 'team-grid pi-grid' : 'team-grid members-grid';
    const membersHTML = members.map(m => createTeamMemberHTML(m, isPI)).join('');
    
    return `
        <div class="section-header">
            <h2>${sectionName}</h2>
            <div class="header-line"></div>
        </div>
        <div class="${gridClass}">
            ${membersHTML}
        </div>
    `;
}

// Fallback team data (used when CSV can't be loaded, e.g., local file:// access)
// UPDATE THIS when you update people.csv to keep them in sync
const fallbackTeamData = [
    {
        Name: 'Justin Kinney',
        Section: 'Principal Investigator',
        Position: 'Principal Investigator',
        Photo: 'pictures/justin_picture.png',
        GitHub: 'https://github.com/jbkinney',
        GoogleScholar: 'https://scholar.google.com/citations?user=lAS1T9BopYMC&hl=en'
    },
    {
        Name: 'John Desmarais',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: ''
    },
    {
        Name: 'Zhihan Liu',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: 'https://github.com/Zhihan-Leo-Liu',
        GoogleScholar: ''
    },
    {
        Name: 'Kaiser Loell',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: ''
    },
    {
        Name: 'Deborah Tenenbaum',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: ''
    },
    {
        Name: 'Andalus Ayaz',
        Section: 'Staff',
        Position: 'Research Technician',
        Photo: '',
        GitHub: '',
        GoogleScholar: ''
    },
    {
        Name: 'Aidan Cordero',
        Section: 'Staff',
        Position: 'Computational Science Developer',
        Photo: 'pictures/aidan_picture.png',
        GitHub: 'https://github.com/aidancordero2',
        GoogleScholar: 'https://scholar.google.com/citations?hl=en&user=No7MvSYAAAAJ'
    }
];

// Render team members from data array
function renderTeamMembers(people) {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    // Group people by section
    const sections = {
        'Principal Investigator': [],
        'Postdoctoral Researchers': [],
        'Staff': []
    };
    
    people.forEach(person => {
        const section = person['Section'];
        if (sections[section]) {
            sections[section].push(person);
        }
    });
    
    // Build HTML for all sections
    let html = '';
    
    // Principal Investigator section
    if (sections['Principal Investigator'].length > 0) {
        html += createSectionHTML('Principal Investigator', sections['Principal Investigator'], true);
    }
    
    // Postdoctoral Researchers section
    if (sections['Postdoctoral Researchers'].length > 0) {
        html += `<div style="margin-top: 4rem;">`;
        html += createSectionHTML('Postdoctoral Researchers', sections['Postdoctoral Researchers'], false);
        html += `</div>`;
    }
    
    // Staff section
    if (sections['Staff'].length > 0) {
        html += `<div style="margin-top: 4rem;">`;
        html += createSectionHTML('Staff', sections['Staff'], false);
        html += `</div>`;
    }
    
    container.innerHTML = html;
    
    // Re-apply animations to new elements
    const newElements = container.querySelectorAll('.team-member');
    newElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Load and display team members
async function loadTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    try {
        const response = await fetch('backend/people.csv');
        if (!response.ok) {
            throw new Error('Failed to load people.csv');
        }
        
        const csvText = await response.text();
        const people = parseCSV(csvText);
        
        if (people.length > 0) {
            renderTeamMembers(people);
        } else {
            // CSV was empty, use fallback
            console.log('CSV empty, using fallback data');
            renderTeamMembers(fallbackTeamData);
        }
        
    } catch (error) {
        // Fetch failed (likely due to CORS/file:// protocol), use fallback data
        console.log('Could not fetch CSV, using fallback data:', error.message);
        renderTeamMembers(fallbackTeamData);
    }
}

// ===== PUBLICATIONS PAGE DYNAMIC LOADING =====

// Fallback publications data (used when CSV can't be loaded)
// UPDATE THIS when you update citations.csv to keep them in sync
const fallbackPublicationsData = [
    { Authors: "Martí-Gómez, Carlos; McCandlish, David M; Kinney, Justin B", Title: "GaugeFixer: overcoming parameter non-identifiability in models of sequence-function relationships", Publication: "bioRxiv", Volume: "", Number: "", Pages: "2025.12.08.693054", Year: "2025", Paper: "", PDF: "", Code: "https://github.com/jbkinney/gaugefixer" },
    { Authors: "Seitz, Evan E; McCandlish, David M; Kinney, Justin B; Koo, Peter K", Title: "Uncovering the mechanistic landscape of regulatory DNA with deep learning", Publication: "bioRxiv", Volume: "", Number: "", Pages: "2025.10.07.681052", Year: "2025", Paper: "", PDF: "", Code: "" },
    { Authors: "Rousseau, Rebecca J; Kinney, Justin B", Title: "Algebraic and Diagrammatic Methods for the Rule-Based Modeling of Multiparticle Complexes", Publication: "PRX Life", Volume: "3", Number: "2", Pages: "023004", Year: "2025", Paper: "", PDF: "", Code: "" },
    { Authors: "Posfai, Anna; McCandlish, David M; Kinney, Justin B", Title: "Symmetry, gauge freedoms, and the interpretability of sequence-function relationships", Publication: "Physical Review Research", Volume: "7", Number: "2", Pages: "023005", Year: "2025", Paper: "", PDF: "", Code: "" },
    { Authors: "Posfai, Anna; Zhou, Juannan; McCandlish, David M; Kinney, Justin B", Title: "Gauge fixing for sequence-function relationships", Publication: "PLoS Computational Biology", Volume: "21", Number: "3", Pages: "e1012818", Year: "2025", Paper: "", PDF: "", Code: "" },
    { Authors: "Seitz, Evan E; McCandlish, David M; Kinney, Justin B; Koo, Peter K", Title: "Interpreting cis-regulatory mechanisms from genomic deep neural networks using surrogate models", Publication: "Nature Machine Intelligence", Volume: "6", Number: "6", Pages: "701-713", Year: "2024", Paper: "", PDF: "", Code: "" },
    { Authors: "Tareen, Ammar; Kooshkbaghi, Mahdi; Posfai, Anna; Ireland, William T; McCandlish, David M; Kinney, Justin B", Title: "MAVE-NN: learning genotype-phenotype maps from multiplex assays of variant effect", Publication: "Genome Biology", Volume: "23", Number: "1", Pages: "98", Year: "2022", Paper: "", PDF: "", Code: "https://github.com/jbkinney/mavenn" },
    { Authors: "Tareen, Ammar; Kinney, Justin B", Title: "Logomaker: beautiful sequence logos in Python", Publication: "Bioinformatics", Volume: "36", Number: "7", Pages: "2272-2274", Year: "2020", Paper: "", PDF: "", Code: "https://github.com/jbkinney/logomaker" },
    { Authors: "Kinney, Justin B; McCandlish, David M", Title: "Massively parallel assays and quantitative sequence–function relationships", Publication: "Annual Review of Genomics and Human Genetics", Volume: "20", Number: "1", Pages: "99-127", Year: "2019", Paper: "", PDF: "", Code: "" },
    { Authors: "Tareen, Ammar; Kinney, Justin B", Title: "Biophysical models of cis-regulation as interpretable neural networks", Publication: "arXiv preprint arXiv:2001.03560", Volume: "", Number: "", Pages: "", Year: "2019", Paper: "", PDF: "", Code: "" },
    { Authors: "Chen, Wei-Chia; Tareen, Ammar; Kinney, Justin B", Title: "Density estimation on small data sets", Publication: "Physical Review Letters", Volume: "121", Number: "16", Pages: "160605", Year: "2018", Paper: "", PDF: "", Code: "" },
    { Authors: "Wong, Mandy S; Kinney, Justin B; Krainer, Adrian R", Title: "Quantitative Activity Profile and Context Dependence of All Human 5′ Splice Sites", Publication: "Molecular Cell", Volume: "71", Number: "6", Pages: "1012-1026.e3", Year: "2018", Paper: "", PDF: "", Code: "" },
    { Authors: "Forcier, Talitha L; Ayaz, Andalus; Gill, Manraj S; Jones, Daniel; Phillips, Rob; Kinney, Justin B", Title: "Measuring cis-regulatory energetics in living cells using allelic manifolds", Publication: "eLife", Volume: "7", Number: "", Pages: "e40618", Year: "2018", Paper: "", PDF: "", Code: "" },
    { Authors: "Adams, Rhys M; Mora, Thierry; Walczak, Aleksandra M; Kinney, Justin B", Title: "Measuring the sequence-affinity landscape of antibodies with massively parallel titration curves", Publication: "eLife", Volume: "5", Number: "", Pages: "e23156", Year: "2016", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B", Title: "Unification of field theory and maximum entropy methods for learning probability densities", Publication: "Physical Review E", Volume: "92", Number: "", Pages: "032107", Year: "2015", Paper: "", PDF: "", Code: "" },
    { Authors: "Atwal, Gurinder S; Kinney, Justin B", Title: "Learning quantitative sequence–function relationships from massively parallel experiments", Publication: "Journal of Statistical Physics", Volume: "", Number: "", Pages: "1-41", Year: "2015", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B", Title: "Estimation of probability densities using scale-free field theories", Publication: "Physical Review E", Volume: "90", Number: "", Pages: "011301(R)", Year: "2014", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B; Atwal, Gurinder S", Title: "Parametric inference in the large data limit using maximally informative models", Publication: "Neural Computation", Volume: "26", Number: "4", Pages: "637-665", Year: "2014", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B; Atwal, Gurinder S", Title: "Equitability, mutual information, and the maximal information coefficient", Publication: "Proceedings of the National Academy of Sciences USA", Volume: "111", Number: "9", Pages: "3354-3359", Year: "2014", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B; Murugan, Anand; Callan, Curtis G; Cox, Edward C", Title: "Using deep sequencing to characterize the biophysical mechanism of a transcriptional regulatory sequence", Publication: "Proceedings of the National Academy of Sciences USA", Volume: "107", Number: "20", Pages: "9158-9163", Year: "2010", Paper: "", PDF: "", Code: "" },
    { Authors: "Kinney, Justin B; Tkačik, Gašper; Callan, Curtis G", Title: "Precise physical models of protein–DNA interaction from high-throughput data", Publication: "Proceedings of the National Academy of Sciences USA", Volume: "104", Number: "2", Pages: "501-506", Year: "2007", Paper: "", PDF: "", Code: "" }
];

// Format authors to highlight Kinney
function formatAuthors(authorsStr) {
    if (!authorsStr) return '';
    
    // Split authors and format
    const authors = authorsStr.split(';').map(a => a.trim()).filter(a => a);
    
    return authors.map(author => {
        // Check if this is Kinney (various formats)
        if (author.toLowerCase().includes('kinney')) {
            return `<strong>${author}</strong>`;
        }
        return author;
    }).join(', ');
}

// Format journal citation
function formatJournalCitation(pub) {
    let citation = `<em>${pub.Publication || ''}</em>`;
    
    if (pub.Volume) {
        citation += ` ${pub.Volume}`;
        if (pub.Number) {
            citation += `(${pub.Number})`;
        }
    }
    
    if (pub.Pages) {
        citation += `: ${pub.Pages}`;
    }
    
    citation += ` (${pub.Year})`;
    
    return citation;
}

// Create HTML for a single publication
function createPublicationHTML(pub) {
    const title = pub.Title || '';
    const authors = formatAuthors(pub.Authors);
    const journal = formatJournalCitation(pub);
    
    // Build links HTML
    const paperLink = pub.Paper ? `<a href="${pub.Paper}" class="pub-link" target="_blank">Paper</a>` : '';
    const pdfLink = pub.PDF ? `<a href="${pub.PDF}" class="pub-link" target="_blank">PDF</a>` : '';
    const codeLink = pub.Code ? `<a href="${pub.Code}" class="pub-link" target="_blank">Code</a>` : '';
    
    const linksHTML = [paperLink, pdfLink, codeLink].filter(l => l).join('');
    const linksSection = linksHTML ? `<div class="pub-links">${linksHTML}</div>` : '';
    
    return `
        <div class="pub-item">
            <h3 class="pub-title">${title}</h3>
            <p class="pub-authors">${authors}</p>
            <p class="pub-journal">${journal}</p>
            ${linksSection}
        </div>
    `;
}

// Create HTML for a year section
function createYearSectionHTML(year, publications) {
    const pubsHTML = publications.map(p => createPublicationHTML(p)).join('');
    
    return `
        <div class="pub-year">
            <h2>${year}</h2>
            <div class="pub-list">
                ${pubsHTML}
            </div>
        </div>
    `;
}

// Render publications grouped by year
function renderPublications(publications) {
    const container = document.getElementById('publications-container');
    if (!container) return;
    
    // Group by year
    const byYear = {};
    publications.forEach(pub => {
        const year = pub.Year || 'Unknown';
        if (!byYear[year]) {
            byYear[year] = [];
        }
        byYear[year].push(pub);
    });
    
    // Sort years descending (newest first)
    const sortedYears = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));
    
    // Build HTML
    let html = '';
    sortedYears.forEach(year => {
        html += createYearSectionHTML(year, byYear[year]);
    });
    
    container.innerHTML = html;
    
    // Re-apply animations
    const newElements = container.querySelectorAll('.pub-item');
    newElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Load and display publications
async function loadPublications() {
    const container = document.getElementById('publications-container');
    if (!container) return;
    
    try {
        const response = await fetch('backend/citations.csv');
        if (!response.ok) {
            throw new Error('Failed to load citations.csv');
        }
        
        const csvText = await response.text();
        const publications = parseCSV(csvText);
        
        if (publications.length > 0) {
            renderPublications(publications);
        } else {
            console.log('CSV empty, using fallback data');
            renderPublications(fallbackPublicationsData);
        }
        
    } catch (error) {
        console.log('Could not fetch CSV, using fallback data:', error.message);
        renderPublications(fallbackPublicationsData);
    }
}
