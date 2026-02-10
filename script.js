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
    
    // Load alumni if on team page
    if (document.getElementById('alumni-container')) {
        loadAlumni();
    }
    
    // Load person if on person page
    if (document.getElementById('person-container')) {
        loadPerson();
    }
});

// ===== TEAM PAGE DYNAMIC LOADING =====

// SVG icons for social links
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;

const scholarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>`;

// Parse CSV text into array of objects
function parseCSV(csvText) {
    // Handle Windows line endings
    const lines = csvText.replace(/\r/g, '').trim().split('\n');
    if (lines.length < 2) return [];
    
    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    
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

// Normalize path to be absolute
function normalizePath(path) {
    if (!path) return '';
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return '/' + path;
}

// Create HTML for a team member
function createTeamMemberHTML(member, isPI = false) {
    const name = member['Name'] || '';
    const position = member['Position'] || '';
    const photo = normalizePath(member['Photo'] || '');
    
    // Create photo HTML
    let photoHTML;
    if (photo) {
        photoHTML = `<img src="${photo}" alt="${name}">`;
    } else {
        photoHTML = `<div class="photo-placeholder">👤</div>`;
    }
    
    // All photos link to person page
    const personUrl = `/person/?name=${encodeURIComponent(name)}`;
    const photoSection = `<a href="${personUrl}" class="member-photo-link"><div class="member-photo">${photoHTML}</div></a>`;
    
    return `
        <div class="team-member">
            ${photoSection}
            <h3 class="member-name">${name}</h3>
            <p class="member-role">${position}</p>
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
        Photo: '/pictures/justin_picture.png',
        GitHub: 'https://github.com/jbkinney',
        GoogleScholar: 'https://scholar.google.com/citations?user=lAS1T9BopYMC&hl=en',
        Bio: ''
    },
    {
        Name: 'John Desmarais',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: '',
        Bio: ''
    },
    {
        Name: 'Zhihan Liu',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: 'https://github.com/Zhihan-Leo-Liu',
        GoogleScholar: '',
        Bio: ''
    },
    {
        Name: 'Kaiser Loell',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: '',
        Bio: ''
    },
    {
        Name: 'Deborah Tenenbaum',
        Section: 'Postdoctoral Researchers',
        Position: 'Postdoc',
        Photo: '',
        GitHub: '',
        GoogleScholar: '',
        Bio: ''
    },
    {
        Name: 'Andalus Ayaz',
        Section: 'Staff',
        Position: 'Research Technician',
        Photo: '/pictures/andalus_picture.png',
        GitHub: '',
        GoogleScholar: '',
        Bio: ''
    },
    {
        Name: 'Aidan Cordero',
        Section: 'Staff',
        Position: 'Computational Science Developer',
        Photo: '/pictures/aidan_picture.png',
        GitHub: 'https://github.com/aidancordero2',
        GoogleScholar: 'https://scholar.google.com/citations?hl=en&user=No7MvSYAAAAJ',
        Bio: 'Aidan is a Computational Science Developer in the Kinney Lab.'
    }
];

// Render team members from data array (single grid, no section headers)
function renderTeamMembers(people) {
    const container = document.getElementById('team-container');
    if (!container) return;
    const membersHTML = people.map(m => createTeamMemberHTML(m, false)).join('');
    container.innerHTML = '<div class="team-grid members-grid">' + membersHTML + '</div>';
}

// Load and display team members
async function loadTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    // Try to fetch from CSV first (works on deployed site)
    try {
        const response = await fetch('/backend/people.csv');
        if (!response.ok) {
            throw new Error('Failed to load CSV');
        }
        
        const csvText = await response.text();
        const people = parseCSV(csvText);
        
        if (people.length > 0) {
            renderTeamMembers(people);
            return;
        }
    } catch (error) {
        // Fetch failed (likely local file:// access), use fallback
        console.log('Using embedded team data');
    }
    
    // Fall back to embedded data
    renderTeamMembers(fallbackTeamData);
}

// ===== PUBLICATIONS PAGE DYNAMIC LOADING =====

// Fallback publications data (from scholar_publications.csv)
// Uses paper, preprint, and code columns
const fallbackPublicationsData = [
    { title: "A developmental timer coordinates organism-wide microRNA transcription", authors: "P Wu, J Wang, B Pryor, I Valentino, DF Ritter, K Loel, J Kinney, S Ercan, ...", venue: "bioRxiv, 2026.01. 21.700890, 2026", year: "2026", paper: "", preprint: "https://www.biorxiv.org/content/10.64898/2026.01.21.700890v1.full", code: "" },
    { title: "Gauge fixing for sequence-function relationships", authors: "A Posfai, J Zhou, DM McCandlish, JB Kinney", venue: "PLoS Computational Biology 21 (3), e1012818, 2025", year: "2025", paper: "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1012818", preprint: "", code: "" },
    { title: "Inference and visualization of complex genotype-phenotype maps with gpmap-tools", authors: "C Martí-Gómez, J Zhou, WC Chen, A Stoltzfus, JB Kinney, ...", venue: "bioRxiv, 2025", year: "2025", paper: "", preprint: "https://www.biorxiv.org/content/10.1101/2025.03.09.642267v3", code: "" },
    { title: "Symmetry, gauge freedoms, and the interpretability of sequence-function relationships", authors: "A Posfai, DM McCandlish, JB Kinney", venue: "Physical Review Research 7 (2), 023005, 2025", year: "2025", paper: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.7.023005", preprint: "", code: "" },
    { title: "On learning functions over biological sequence space: relating Gaussian process priors, regularization, and gauge fixing", authors: "S Petti, C Martí-Gómez, JB Kinney, J Zhou, DM McCandlish", venue: "arXiv preprint arXiv:2504.19034, 2025", year: "2025", paper: "", preprint: "https://arxiv.org/abs/2504.19034", code: "" },
    { title: "Uncovering the mechanistic landscape of regulatory DNA with deep learning", authors: "EE Seitz, DM McCandlish, JB Kinney, PK Koo", venue: "bioRxiv, 2025.10. 07.681052, 2025", year: "2025", paper: "", preprint: "https://www.biorxiv.org/content/10.1101/2025.10.07.681052v1.full", code: "https://github.com/evanseitz/seam-nn" },
    { title: "Algebraic and Diagrammatic Methods for the Rule-Based Modeling of Multiparticle Complexes", authors: "RJ Rousseau, JB Kinney", venue: "PRX Life 3 (2), 023004, 2025", year: "2025", paper: "https://journals.aps.org/prxlife/abstract/10.1103/PRXLife.3.023004", preprint: "", code: "" },
    { title: "GaugeFixer: overcoming parameter non-identifiability in models of sequence-function relationships", authors: "C Martí-Gómez, DM McCandlish, JB Kinney", venue: "bioRxiv, 2025.12. 08.693054, 2025", year: "2025", paper: "", preprint: "https://www.biorxiv.org/content/10.64898/2025.12.08.693054v1", code: "https://github.com/jbkinney/gaugefixer" },
    { title: "Structural basis of DNA-dependent coactivator recruitment by the tuft cell master regulator POU2F3", authors: "A Alpsoy, JJ Ipsaro, D Skopelitis, S Pal, FS Chung, S Carpenter, ...", venue: "Cell reports 44 (11), 2025", year: "2025", paper: "", preprint: "", code: "" },
    { title: "HENMT1 restricts endogenous retrovirus activity by methylation of 3'-tRNA fragments", authors: "JI Steinberg, H Sertznig, JJ Desmarais, J Wilken, D Rubio, M Peacey, ...", venue: "bioRxiv, 2025.05. 12.650695, 2025", year: "2025", paper: "", preprint: "", code: "" },
    { title: "Specificity, synergy, and mechanisms of splice-modifying drugs", authors: "Y Ishigami, MS Wong, C Martí-Gómez, A Ayaz, M Kooshkbaghi, ...", venue: "Nature Communications 15 (1), 1880, 2024", year: "2024", paper: "", preprint: "", code: "" },
    { title: "Interpreting cis-regulatory mechanisms from genomic deep neural networks using surrogate models", authors: "EE Seitz, DM McCandlish, JB Kinney, PK Koo", venue: "Nature machine intelligence 6 (6), 701-713, 2024", year: "2024", paper: "", preprint: "", code: "" },
    { title: "MAVE-NN: learning genotype-phenotype maps from multiplex assays of variant effect", authors: "A Tareen, M Kooshkbaghi, A Posfai, WT Ireland, DM McCandlish, ...", venue: "Genome biology 23 (1), 98, 2022", year: "2022", paper: "", preprint: "", code: "https://github.com/jbkinney/mavenn" },
    { title: "Higher-order epistasis and phenotypic prediction", authors: "J Zhou, MS Wong, WC Chen, AR Krainer, JB Kinney, DM McCandlish", venue: "Proceedings of the National Academy of Sciences 119 (39), e2204233119, 2022", year: "2022", paper: "", preprint: "", code: "" },
    { title: "Structural and mechanistic basis of σ-dependent transcriptional pausing", authors: "C Pukhrambam, V Molodtsov, M Kooshkbaghi, A Tareen, H Vu, ...", venue: "Proceedings of the National Academy of Sciences 119 (23), e2201301119, 2022", year: "2022", paper: "", preprint: "", code: "" },
    { title: "Promoter-sequence determinants and structural basis of primer-dependent transcription initiation in Escherichia coli", authors: "KS Skalenko, L Li, Y Zhang, IO Vvedenskaya, JT Winkelman, AL Cope, ...", venue: "Proceedings of the National Academy of Sciences 118 (27), e2106388118, 2021", year: "2021", paper: "", preprint: "", code: "" },
    { title: "Field-theoretic density estimation for biological sequence space with applications to 5′ splice site diversity and aneuploidy in cancer", authors: "WC Chen, J Zhou, JM Sheltzer, JB Kinney, DM McCandlish", venue: "Proceedings of the National Academy of Sciences 118 (40), e2025782118, 2021", year: "2021", paper: "", preprint: "", code: "" },
    { title: "Logomaker: beautiful sequence logos in Python", authors: "A Tareen, JB Kinney", venue: "Bioinformatics 36 (7), 2272-2274, 2020", year: "2020", paper: "", preprint: "", code: "https://github.com/jbkinney/logomaker" },
    { title: "Deciphering the regulatory genome of Escherichia coli, one hundred promoters at a time", authors: "WT Ireland, SM Beeler, E Flores-Bautista, NS McCarty, T Röschinger, ...", venue: "Elife 9, e55308, 2020", year: "2020", paper: "", preprint: "", code: "" },
    { title: "Evolution of DNA replication origin specification and gene silencing mechanisms", authors: "Y Hu, A Tareen, YJ Sheu, WT Ireland, C Speck, H Li, L Joshua-Tor, ...", venue: "Nature communications 11 (1), 5175, 2020", year: "2020", paper: "", preprint: "", code: "" },
    { title: "Non-parametric Bayesian density estimation for biological sequence space with applications to pre-mRNA splicing and the karyotypic diversity of human cancer", authors: "WC Chen, J Zhou, JM Sheltzer, JB Kinney, DM McCandlish", venue: "BioRxiv, 2020.11. 25.399253, 2020", year: "2020", paper: "", preprint: "", code: "" },
    { title: "Empirical variance component regression for sequence-function relationships", authors: "J Zhou, M Wong, WC Chen, A Krainer, J Kinney, D McCandlish", venue: "BioRxiv, 2020", year: "2020", paper: "", preprint: "", code: "" },
    { title: "Massively parallel assays and quantitative sequence–function relationships", authors: "JB Kinney, DM McCandlish", venue: "Annual review of genomics and human genetics 20 (1), 99-127, 2019", year: "2019", paper: "", preprint: "", code: "" },
    { title: "Mapping DNA sequence to transcription factor binding energy in vivo", authors: "SL Barnes, NM Belliveau, WT Ireland, JB Kinney, R Phillips", venue: "PLoS computational biology 15 (2), e1006226, 2019", year: "2019", paper: "", preprint: "", code: "" },
    { title: "Epistasis in a fitness landscape defined by antibody-antigen binding free energy", authors: "RM Adams, JB Kinney, AM Walczak, T Mora", venue: "Cell systems 8 (1), 86-93. e3, 2019", year: "2019", paper: "", preprint: "", code: "" },
    { title: "Biophysical models of cis-regulation as interpretable neural networks", authors: "A Tareen, JB Kinney", venue: "arXiv preprint arXiv:2001.03560, 2019", year: "2019", paper: "", preprint: "", code: "" },
    { title: "Quantitative Activity Profile and Context Dependence of All Human 5′ Splice Sites", authors: "MS Wong, JB Kinney, AR Krainer", venue: "Molecular cell 71 (6), 1012-1026.e3, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Systematic approach for dissecting the molecular mechanisms of transcriptional regulation in bacteria", authors: "NM Belliveau, SL Barnes, WT Ireland, DL Jones, MJ Sweredoski, ...", venue: "Proceedings of the National Academy of Sciences 115 (21), E4796-E4805, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "A transcription factor addiction in leukemia imposed by the MLL promoter sequence", authors: "B Lu, O Klingbeil, Y Tarumoto, TDD Somerville, YH Huang, Y Wei, ...", venue: "Cancer Cell 34 (6), 970-981. e8, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Density estimation on small data sets", authors: "WC Chen, A Tareen, JB Kinney", venue: "Physical review letters 121 (16), 160605, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Measuring cis-regulatory energetics in living cells using allelic manifolds", authors: "TL Forcier, A Ayaz, MS Gill, D Jones, R Phillips, JB Kinney", venue: "Elife 7, e40618, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Selection for protein stability enriches for epistatic interactions", authors: "A Posfai, J Zhou, JB Plotkin, JB Kinney, DM McCandlish", venue: "Genes 9 (9), 423, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Precision measurements of regulatory energetics in living cells", authors: "T Forcier, A Ayaz, M Gill, JB Kinney", venue: "bioRxiv, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Inducible CRISPR-based Genome Editing for the Characterization of Cancer Genes", authors: "N Sachan, M Miller, NH Shirole, S Senturk, V Corbo, JB Kinney, ...", venue: "Genome Editing and Engineering: From TALENs, ZFNs and CRISPRs to Molecular …, 2018", year: "2018", paper: "", preprint: "", code: "" },
    { title: "Rapid and tunable method to temporally control gene editing based on conditional Cas9 stabilization", authors: "S Senturk, NH Shirole, DG Nowak, V Corbo, D Pal, A Vaughan, ...", venue: "Nature Communications 8, 14370, 2017", year: "2017", paper: "", preprint: "", code: "" },
    { title: "Rapid generation of drug-resistance alleles at endogenous loci using CRISPR-Cas9 indel mutagenesis", authors: "JJ Ipsaro, C Shen, A Eri, Y Xu, JB Kinney, L Joshua-Tor, CR Vakoc, J Shi", venue: "PLoS One 12 (2), e0172177, 2017", year: "2017", paper: "", preprint: "", code: "" },
    { title: "Measuring the sequence-affinity landscape of antibodies with massively parallel titration curves", authors: "RM Adams, T Mora, AM Walczak, JB Kinney", venue: "Elife 5, e23156, 2016", year: "2016", paper: "", preprint: "", code: "" },
    { title: "Concerted activities of Mcm4, Sld3, and Dbf4 in control of origin activation and DNA replication fork progression", authors: "YJ Sheu, JB Kinney, B Stillman", venue: "Genome research 26 (3), 315-330, 2016", year: "2016", paper: "", preprint: "", code: "" },
    { title: "MPAthic: quantitative modeling of sequence-function relationships for massively parallel assays.", authors: "WT Ireland, JB Kinney", venue: "Preprint at http://biorxiv. org/content/early/2016/05/21/054676, 2016", year: "2016", paper: "", preprint: "", code: "" },
    { title: "Modeling multi-particle complexes in stochastic chemical systems", authors: "MJ Morrison, JB Kinney", venue: "arXiv preprint arXiv:1603.07369, 2016", year: "2016", paper: "", preprint: "", code: "" },
    { title: "Methods of identifying essential protein domains", authors: "CH Vakoc, J Shi, JB Kinney", venue: "", year: "2016", paper: "", preprint: "", code: "" },
    { title: "Discovery of cancer drug targets by CRISPR-Cas9 screening of protein domains", authors: "J Shi, E Wang, JP Milazzo, Z Wang, JB Kinney, CR Vakoc", venue: "Nature Biotechnology 33, 661-667, 2015", year: "2015", paper: "", preprint: "", code: "" },
    { title: "The transcriptional cofactor TRIM33 prevents apoptosis in B lymphoblastic leukemia by deactivating a single enhancer", authors: "E Wang, S Kawaoka, JS Roe, J Shi, AF Hohmann, Y Xu, AS Bhagwat, ...", venue: "elife 4, e06377, 2015", year: "2015", paper: "", preprint: "", code: "" },
    { title: "Learning quantitative sequence–function relationships from massively parallel experiments", authors: "GS Atwal, JB Kinney", venue: "Journal of Statistical Physics, 1-41, 2015", year: "2015", paper: "", preprint: "", code: "" },
    { title: "Unification of field theory and maximum entropy methods for learning probability densities", authors: "JB Kinney", venue: "Physical Review E 92, 032107, 2015", year: "2015", paper: "", preprint: "", code: "" },
    { title: "Equitability, mutual information, and the maximal information coefficient", authors: "JB Kinney, GS Atwal", venue: "Proceedings of the National Academy of Sciences USA 111 (9), 3354-3359, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Domain within the helicase subunit Mcm4 integrates multiple kinase signals to control DNA replication initiation and fork progression", authors: "YJ Sheu, JB Kinney, A Lengronne, P Pasero, B Stillman", venue: "Proceedings of the National Academy of Sciences USA 111 (18), E1899-E1908, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Comparison of the theoretical and real-world evolutionary potential of a genetic circuit", authors: "M Razo-Mejia, JQ Boedicker, D Jones, A DeLuna, JB Kinney, R Phillips", venue: "Physical Biology 11 (2), 026005, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Parametric inference in the large data limit using maximally informative models", authors: "JB Kinney, GS Atwal", venue: "Neural Computation 26 (4), 637-665, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Estimation of probability densities using scale-free field theories", authors: "JB Kinney", venue: "Physical Review E 90, 011301(R), 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Reply to Reshef et al.: Falsifiability or bust", authors: "JB Kinney, GS Atwal", venue: "Proceedings of the National Academy of Sciences USA 111 (33), E3364-E3364, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Reply to Murrell et al.: Noise matters", authors: "JB Kinney, GS Atwal", venue: "Proceedings of the National Academy of Sciences USA 111 (21), E2161-E2161, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Mutual information: a universal measure of statistical dependence.", authors: "JB Kinney", venue: "Biomedical Computation Review 10 (2), 33, 2014", year: "2014", paper: "", preprint: "", code: "" },
    { title: "Evaluation of methods for modeling transcription factor sequence specificity", authors: "MT Weirauch, A Cote, R Norel, M Annala, Y Zhao, TR Riley, ...", venue: "Nature biotechnology 31 (2), 126-134, 2013", year: "2013", paper: "", preprint: "", code: "" },
    { title: "Systematic dissection and optimization of inducible enhancers in human cells using a massively parallel reporter assay", authors: "A Melnikov, A Murugan, X Zhang, T Tesileanu, L Wang, P Rogov, S Feizi, ...", venue: "Nature Biotechnology 30 (3), 271-277, 2012", year: "2012", paper: "", preprint: "", code: "" },
    { title: "Using deep sequencing to characterize the biophysical mechanism of a transcriptional regulatory sequence", authors: "JB Kinney, A Murugan, CG Callan, EC Cox", venue: "Proceedings of the National Academy of Sciences USA 107 (20), 9158-9163, 2010", year: "2010", paper: "", preprint: "", code: "" },
    { title: "Energy-dependent fitness: a quantitative model for the evolution of yeast transcription factor binding sites", authors: "V Mustonen, J Kinney, CG Callan, M Lässig", venue: "Proceedings of the National Academy of Sciences USA 105 (34), 12376-12381, 2008", year: "2008", paper: "", preprint: "", code: "" },
    { title: "Biophysical models of transcriptional regulation from sequence data", authors: "JB Kinney", venue: "Princeton University, 2008", year: "2008", paper: "", preprint: "", code: "" },
    { title: "Precise physical models of protein–DNA interaction from high-throughput data", authors: "JB Kinney, G Tkačik, CG Callan", venue: "Proceedings of the National Academy of Sciences USA 104 (2), 501-506, 2007", year: "2007", paper: "", preprint: "", code: "" }
];

// Format authors to highlight Kinney
function formatAuthors(authorsStr) {
    if (!authorsStr) return '';
    
    // Split authors by comma and format
    const authors = authorsStr.split(',').map(a => a.trim()).filter(a => a);
    
    return authors.map(author => {
        if (author.toLowerCase().includes('kinney')) {
            return `<strong>${author}</strong>`;
        }
        return author;
    }).join(', ');
}

// Create HTML for a single publication
function createPublicationHTML(pub) {
    const title = pub.title || '';
    const authors = formatAuthors(pub.authors);
    const venue = pub.venue || '';
    
    // Build links HTML - Paper, Preprint, and Code
    const paperLink = pub.paper ? `<a href="${pub.paper}" class="pub-link" target="_blank">Paper</a>` : '';
    const preprintLink = pub.preprint ? `<a href="${pub.preprint}" class="pub-link" target="_blank">Preprint</a>` : '';
    const codeLink = pub.code ? `<a href="${pub.code}" class="pub-link" target="_blank">Code</a>` : '';
    
    const linksHTML = [paperLink, preprintLink, codeLink].filter(l => l).join('');
    const linksSection = linksHTML ? `<div class="pub-links">${linksHTML}</div>` : '';
    
    return `
        <div class="pub-item">
            <h3 class="pub-title">${title}</h3>
            <p class="pub-authors">${authors}</p>
            <p class="pub-journal"><em>${venue}</em></p>
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

// Render publications grouped by year (years descending, publications in CSV order within each year)
function renderPublications(publications) {
    const container = document.getElementById('publications-container');
    if (!container) return;
    
    // Group by year while preserving CSV order within each year
    const byYear = {};
    
    publications.forEach(pub => {
        const year = pub.year || 'Unknown';
        if (!byYear[year]) {
            byYear[year] = [];
        }
        byYear[year].push(pub);
    });
    
    // Sort years descending (newest first)
    const sortedYears = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));
    
    // Build HTML (publications within each year stay in CSV order)
    let html = '';
    sortedYears.forEach(year => {
        html += createYearSectionHTML(year, byYear[year]);
    });
    
    container.innerHTML = html;
}

// Load and display publications
async function loadPublications() {
    const container = document.getElementById('publications-container');
    if (!container) return;
    
    console.log('Loading publications...');
    
    // Try to fetch from CSV first (works on deployed site)
    try {
        const response = await fetch('/backend/scholar_publications.csv');
        console.log('Publications fetch response:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to load CSV');
        }
        
        const csvText = await response.text();
        const publications = parseCSV(csvText);
        console.log('Parsed publications:', publications.length, 'items');
        console.log('First publication:', publications[0]);
        
        if (publications.length > 0) {
            renderPublications(publications);
            return;
        }
    } catch (error) {
        // Fetch failed (likely local file:// access), use fallback
        console.log('Publications error:', error.message);
        console.log('Using embedded publications data');
    }
    
    // Fall back to embedded data
    renderPublications(fallbackPublicationsData);
}

// ===== ALUMNI SECTION DYNAMIC LOADING =====

// Parse alumni CSV data (uses same logic as parseCSV)
function parseAlumniCSV(csvText) {
    // Handle Windows line endings and trim
    const lines = csvText.replace(/\r/g, '').trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    
    console.log('Parsed alumni data:', data);
    return data;
}

// Create HTML for an alumni table
function createAlumniTableHTML(sectionName, alumni) {
    const rows = alumni.map(person => `
        <tr>
            <td>${person['Name'] || ''}</td>
            <td>${person['Position'] || ''}</td>
            <td>${person['Program'] || ''}</td>
            <td>${person['Time in Lab'] || ''}</td>
            <td>${person['Current Position'] || ''}</td>
        </tr>
    `).join('');
    
    return `
        <div class="alumni-table-section">
            <h3>${sectionName}</h3>
            <table class="alumni-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Program</th>
                        <th>Time in Lab</th>
                        <th>Current Position</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Render alumni grouped by section
function renderAlumni(alumni) {
    const container = document.getElementById('alumni-container');
    if (!container) return;
    
    // Group by section
    const bySection = {};
    alumni.forEach(person => {
        const section = person['Section'] || 'Other';
        if (!bySection[section]) {
            bySection[section] = [];
        }
        bySection[section].push(person);
    });
    
    // Build HTML for each section
    let html = '';
    Object.keys(bySection).forEach(section => {
        html += createAlumniTableHTML(section, bySection[section]);
    });
    
    container.innerHTML = html;
}

// Load and display alumni
async function loadAlumni() {
    const container = document.getElementById('alumni-container');
    if (!container) return;
    
    console.log('Loading alumni...');
    
    try {
        const response = await fetch('/backend/alumni.csv');
        console.log('Fetch response:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to load alumni.csv');
        }
        
        const csvText = await response.text();
        console.log('CSV text:', csvText);
        
        const alumni = parseAlumniCSV(csvText);
        
        if (alumni.length > 0) {
            renderAlumni(alumni);
        } else {
            container.innerHTML = '<p class="error-message">No alumni data found.</p>';
        }
    } catch (error) {
        console.log('Could not load alumni:', error.message);
        container.innerHTML = '<p class="error-message">Unable to load alumni data.</p>';
    }
}

// ===== PERSON PAGE DYNAMIC LOADING =====

// Create HTML for person profile
function createPersonHTML(person) {
    const name = person['Name'] || '';
    const position = person['Position'] || '';
    const photo = normalizePath(person['Photo'] || '');
    const github = person['GitHub'] || '';
    const scholar = person['GoogleScholar'] || '';
    const bio = person['Bio'] || '';
    
    // Photo HTML
    let photoHTML;
    if (photo) {
        photoHTML = `<img src="${photo}" alt="${name}">`;
    } else {
        photoHTML = `<div class="photo-placeholder">👤</div>`;
    }
    
    // Build links
    let linksHTML = '';
    if (github || scholar) {
        linksHTML = '<div class="person-links">';
        if (github) {
            linksHTML += `<a href="${github}" class="person-link" target="_blank">
                ${githubIcon}
                <span>GitHub</span>
            </a>`;
        }
        if (scholar) {
            linksHTML += `<a href="${scholar}" class="person-link" target="_blank">
                ${scholarIcon}
                <span>Google Scholar</span>
            </a>`;
        }
        linksHTML += '</div>';
    }
    
    // Build bio section
    let bioHTML = '';
    if (bio) {
        bioHTML = `<div class="person-bio">${bio}</div>`;
    }
    
    return `
        <div class="person-profile">
            <div class="person-photo">${photoHTML}</div>
            <h1 class="person-name">${name}</h1>
            <p class="person-position">${position}</p>
            ${linksHTML}
            ${bioHTML}
        </div>
    `;
}

// Load and display person
async function loadPerson() {
    const container = document.getElementById('person-container');
    if (!container) return;
    
    // Get person name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const personName = urlParams.get('name');
    
    if (!personName) {
        container.innerHTML = '<p class="error-message">No person specified.</p>';
        return;
    }
    
    // Update page title
    document.title = `${personName} | Kinney Lab`;
    
    try {
        const response = await fetch('/backend/people.csv');
        if (!response.ok) {
            throw new Error('Failed to load people.csv');
        }
        
        const csvText = await response.text();
        const people = parseCSV(csvText);
        
        // Find the person
        const person = people.find(p => p['Name'] === personName);
        
        if (person) {
            container.innerHTML = createPersonHTML(person);
        } else {
            // Try fallback data
            const fallbackPerson = fallbackTeamData.find(p => p['Name'] === personName);
            if (fallbackPerson) {
                container.innerHTML = createPersonHTML(fallbackPerson);
            } else {
                container.innerHTML = '<p class="error-message">Person not found.</p>';
            }
        }
    } catch (error) {
        console.log('Could not load person from CSV:', error.message);
        // Try fallback data
        const fallbackPerson = fallbackTeamData.find(p => p['Name'] === personName);
        if (fallbackPerson) {
            container.innerHTML = createPersonHTML(fallbackPerson);
        } else {
            container.innerHTML = '<p class="error-message">Unable to load person data.</p>';
        }
    }
}
