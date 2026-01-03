const state = {
    photoBase64: '',
};

// --- Helpery ---
const escapeHtml = (text) => {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
};

// Dodaje protokół jeśli go brak
const formatUrl = (url) => {
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) return 'https://' + url;
    return url;
};

// Wyświetla link lub tekst
const renderLinkOrText = (text, url, className = '') => {
    const safeText = escapeHtml(text);
    if (!url) return `<span class="${className}">${safeText}</span>`;
    return `<a href="${formatUrl(url)}" target="_blank" class="${className}">${safeText} 🔗</a>`;
};

// --- Inicjalizacja ---
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    // Inicjalizacja sekcji
    addExperience();
    addEducation();
    addCertificate(); // Dodaje domyślnie jedno pole
    generateCV();
});

function initEvents() {
    // Foto
    document.getElementById('btnUploadPhoto').onclick = () => document.getElementById('photoUpload').click();
    document.getElementById('photoUpload').onchange = handlePhoto;
    document.getElementById('btnRemovePhoto').onclick = removePhoto;

    // Przyciski dodawania
    document.getElementById('btnAddExperience').onclick = addExperience;
    document.getElementById('btnAddCertificate').onclick = addCertificate;
    document.getElementById('btnAddEducation').onclick = addEducation;
    document.getElementById('btnAddLanguage').onclick = addLanguage;
    document.getElementById('btnAddWebsite').onclick = addWebsite;

    // Live Preview
    document.querySelector('.scrollable-form').addEventListener('input', debounce(generateCV, 300));
    
    // PDF i Save
    document.getElementById('btnDownloadPDF').onclick = downloadPDF;
    document.getElementById('btnSaveCV').onclick = saveCV;
    document.getElementById('btnLoadCV').onclick = () => document.getElementById('loadFile').click();
    document.getElementById('loadFile').onchange = loadCV;

    // --- DOMYŚLNA KLAUZULA RODO (NOWOŚĆ) ---
    const rodoText = "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).";
    document.getElementById('rodoClause').value = rodoText;
}

// --- Dynamiczne Pola ---

function createSection(html) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `<button class="remove-btn" onclick="this.parentElement.remove(); generateCV()">×</button>` + html;
    return div;
}

function addExperience() {
    // TUTAJ DODANO INPUT NA LINK DO PROJEKTU/FIRMY
    const html = `
        <div class="form-grid">
            <div class="input-group full-width">
                <input type="text" class="exp-title" placeholder="Stanowisko">
            </div>
            <div class="input-group">
                <input type="text" class="exp-company" placeholder="Firma">
            </div>
             <div class="input-group">
                <input type="text" class="exp-date" placeholder="Data (np. 2020-2022)">
            </div>
            <div class="input-group full-width">
                <input type="url" class="exp-link" placeholder="Link do projektu/firmy (opcjonalne)">
            </div>
            <div class="input-group full-width">
                <textarea class="exp-desc" placeholder="Opis obowiązków..." style="min-height:60px"></textarea>
            </div>
        </div>
    `;
    document.getElementById('experienceContainer').appendChild(createSection(html));
}

function addCertificate() {
    // TUTAJ DODANO INPUT NA LINK DO CERTYFIKATU
    const html = `
        <div class="form-grid">
            <div class="input-group full-width">
                <input type="text" class="cert-name" placeholder="Nazwa Certyfikatu">
            </div>
            <div class="input-group">
                <input type="text" class="cert-issuer" placeholder="Wydawca">
            </div>
            <div class="input-group">
                <input type="text" class="cert-date" placeholder="Data">
            </div>
            <div class="input-group full-width">
                <input type="url" class="cert-link" placeholder="Link do certyfikatu (URL)">
            </div>
        </div>
    `;
    document.getElementById('certificatesContainer').appendChild(createSection(html));
}

function addEducation() {
    const html = `
        <div class="form-grid">
            <div class="input-group full-width"><input type="text" class="edu-school" placeholder="Uczelnia"></div>
            <div class="input-group"><input type="text" class="edu-degree" placeholder="Kierunek"></div>
            <div class="input-group"><input type="text" class="edu-date" placeholder="Lata"></div>
        </div>
    `;
    document.getElementById('educationContainer').appendChild(createSection(html));
}

function addLanguage() {
    const html = `
        <div class="form-grid">
            <div class="input-group"><input type="text" class="lang-name" placeholder="Język"></div>
            <div class="input-group">
                <select class="lang-level">
                    <option value="A1">A1</option><option value="A2">A2</option>
                    <option value="B1">B1</option><option value="B2" selected>B2</option>
                    <option value="C1">C1</option><option value="C2">C2</option>
                    <option value="Native">Ojczysty</option>
                </select>
            </div>
        </div>
    `;
    document.getElementById('languagesContainer').appendChild(createSection(html));
}

function addWebsite() {
    const html = `
        <div class="form-grid">
            <div class="input-group"><input type="text" class="web-label" placeholder="Etykieta (np. Portfolio)"></div>
            <div class="input-group"><input type="url" class="web-url" placeholder="URL"></div>
        </div>
    `;
    document.getElementById('websitesContainer').appendChild(createSection(html));
}

// GENEROWANIE CV 

function generateCV() {
    // Header
    document.getElementById('cvName').textContent = document.getElementById('fullName').value || 'Twoje Imię';
    document.getElementById('cvTitle').textContent = document.getElementById('jobTitle').value || 'Stanowisko';
    document.getElementById('cvSummary').textContent = document.getElementById('summary').value;

    // Kontakty
    let contactHtml = '';
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (email) contactHtml += `<div>📧 <a href="mailto:${email}">${escapeHtml(email)}</a></div>`;
    if (phone) contactHtml += `<div>📱 ${escapeHtml(phone)}</div>`;
    if (address) contactHtml += `<div>📍 ${escapeHtml(address)}</div>`;
    
    // Social & Custom Links
    const linkedin = document.getElementById('linkedin').value;
    const github = document.getElementById('github').value;
    const website = document.getElementById('website').value;

    if (linkedin) contactHtml += `<div>💼 ${renderLinkOrText('LinkedIn', linkedin)}</div>`;
    if (github) contactHtml += `<div>💻 ${renderLinkOrText('GitHub', github)}</div>`;
    if (website) contactHtml += `<div>🌐 ${renderLinkOrText('WWW', website)}</div>`;

    document.getElementById('cvContact').innerHTML = contactHtml;

    // Zdjęcie
    const img = document.getElementById('cvPhoto');
    if (state.photoBase64) {
        img.src = state.photoBase64;
        img.classList.remove('hidden');
    } else {
        img.classList.add('hidden');
    }

    // Doświadczenie (Z OBSŁUGĄ LINKÓW)
    let expHtml = '';
    document.querySelectorAll('#experienceContainer .dynamic-item').forEach(item => {
        const title = item.querySelector('.exp-title').value;
        const company = item.querySelector('.exp-company').value;
        const date = item.querySelector('.exp-date').value;
        const desc = item.querySelector('.exp-desc').value;
        const link = item.querySelector('.exp-link').value; // Pobieramy link

        if (title) {
            // Jeśli jest link, nazwa firmy staje się linkiem
            const companyDisplay = renderLinkOrText(company, link); 
            
            expHtml += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${escapeHtml(title)}</div>
                        <div class="cv-item-date">${escapeHtml(date)}</div>
                    </div>
                    <div class="cv-item-subtitle">${companyDisplay}</div>
                    <div class="cv-item-desc">${escapeHtml(desc)}</div>
                </div>
            `;
        }
    });
    toggleSection('experienceSection', expHtml);

    // Certyfikaty (Z OBSŁUGĄ LINKÓW)
    let certHtml = '';
    document.querySelectorAll('#certificatesContainer .dynamic-item').forEach(item => {
        const name = item.querySelector('.cert-name').value;
        const issuer = item.querySelector('.cert-issuer').value;
        const date = item.querySelector('.cert-date').value;
        const link = item.querySelector('.cert-link').value;

        if (name) {
            const nameDisplay = renderLinkOrText(name, link);
            certHtml += `
                <div class="cv-item">
                    <div class="cv-item-title" style="font-size:0.9rem">${nameDisplay}</div>
                    <div class="cv-item-date">${escapeHtml(issuer)} ${date ? `• ${date}` : ''}</div>
                </div>
            `;
        }
    });
    toggleSection('certificatesSection', certHtml);

    // Dodatkowe Linki z sekcji "Strony internetowe"
    let linksHtml = '';
    document.querySelectorAll('#websitesContainer .dynamic-item').forEach(item => {
        const label = item.querySelector('.web-label').value;
        const url = item.querySelector('.web-url').value;
        if(label && url) {
            linksHtml += `<div>🔗 ${renderLinkOrText(label, url)}</div>`;
        }
    });
    toggleSection('linksSection', linksHtml);

    // Edukacja
    let eduHtml = '';
    document.querySelectorAll('#educationContainer .dynamic-item').forEach(item => {
        const school = item.querySelector('.edu-school').value;
        const degree = item.querySelector('.edu-degree').value;
        const date = item.querySelector('.edu-date').value;
        if (school) {
            eduHtml += `
                <div class="cv-item">
                     <div class="cv-item-header">
                        <div class="cv-item-title">${escapeHtml(school)}</div>
                        <div class="cv-item-date">${escapeHtml(date)}</div>
                    </div>
                    <div class="cv-item-desc">${escapeHtml(degree)}</div>
                </div>
            `;
        }
    });
    toggleSection('educationSection', eduHtml);

    // Umiejętności
    const skillsVal = document.getElementById('skills').value;
    const skillsHtml = skillsVal ? skillsVal.split(',').filter(s=>s.trim()).map(s => `<span class="tag">${escapeHtml(s.trim())}</span>`).join('') : '';
    toggleSection('skillsSection', skillsHtml);

    // Języki
    let langHtml = '';
    document.querySelectorAll('#languagesContainer .dynamic-item').forEach(item => {
        const name = item.querySelector('.lang-name').value;
        const level = item.querySelector('.lang-level').value;
        if(name) langHtml += `<div style="margin-bottom:4px"><strong>${escapeHtml(name)}</strong>: ${level}</div>`;
    });
    toggleSection('languagesSection', langHtml);

    // RODO
    const rodo = document.getElementById('rodoClause').value;
    document.getElementById('cvRodo').textContent = rodo;
    if(rodo) document.getElementById('rodoSection').classList.remove('hidden');
    else document.getElementById('rodoSection').classList.add('hidden');
}

function toggleSection(id, content) {
    const el = document.getElementById(id);
    const contentContainer = el.querySelector('div') || el;
    if (content && content.trim().length > 0) {
        if(id.includes('Container')) el.innerHTML = content; // dla list
        else if (el.querySelector('div')) el.querySelector('div').innerHTML = content;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// --- Obsługa Zdjęć i Plików (skrócona wersja) ---
function handlePhoto(e) {
    const file = e.target.files[0];
    if(file){
        const r = new FileReader();
        r.onload = (ev) => {
            state.photoBase64 = ev.target.result;
            document.getElementById('photoPreview').src = state.photoBase64;
            document.getElementById('btnRemovePhoto').style.display = 'inline-block';
            generateCV();
        }
        r.readAsDataURL(file);
    }
}
function removePhoto() {
    state.photoBase64 = '';
    document.getElementById('photoPreview').src = 'https://via.placeholder.com/100?text=Foto';
    document.getElementById('btnRemovePhoto').style.display = 'none';
    generateCV();
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// --- GENEROWANIE PDF Z AKTYWNYMI LINKAMI ---
async function downloadPDF() {
    const element = document.getElementById('cvContent');
    const loader = document.getElementById('pdf-loader');
    
    // Pokaż loader
    loader.classList.remove('hidden');
    window.scrollTo(0,0); // Przewiń na górę dla poprawnych obliczeń

    // Przygotuj widok do "zdjęcia"
    element.classList.add('pdf-mode');
    // Ukryj puste sekcje całkowicie, żeby nie zajmowały miejsca
    const hiddenEls = element.querySelectorAll('.cv-section.hidden, .cv-rodo.hidden');
    hiddenEls.forEach(el => el.style.display = 'none');

    await new Promise(r => setTimeout(r, 500)); // Czekaj na przeładowanie styli/obrazków

    try {
        // 1. Generowanie obrazu (tła)
        const canvas = await html2canvas(element, {
            scale: 2, // Wyższa jakość
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const { jsPDF } = window.jspdf;
        
        // Wymiary A4 w mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Obliczanie proporcji
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Dodaj obraz CV
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);

        // --- MAGIA LINKÓW: Mapowanie współrzędnych HTML na PDF ---
        
        // Skala: ile mm PDF-a przypada na 1 piksel HTML-a
        // element.offsetWidth to szerokość widoczna na ekranie (np. 793px dla A4)
        const scaleFactor = pdfWidth / element.offsetWidth;
        
        // Pobierz pozycję kontenera CV względem okna
        const contentRect = element.getBoundingClientRect();

        // Znajdź wszystkie linki wewnątrz CV
        const links = element.querySelectorAll('a');

        links.forEach(link => {
            const href = link.href;
            if (!href) return;

            // Pobierz pozycję linku w HTML
            const linkRect = link.getBoundingClientRect();

            // Oblicz pozycję względną (wewnątrz CV) w pikselach
            const relativeX = linkRect.left - contentRect.left;
            const relativeY = linkRect.top - contentRect.top;

            // Przelicz na milimetry PDF
            const pdfX = relativeX * scaleFactor;
            const pdfY = relativeY * scaleFactor;
            const pdfW = linkRect.width * scaleFactor;
            const pdfH = linkRect.height * scaleFactor;

            // Jeśli link jest na pierwszej stronie (zakładamy 1 stronę dla uproszczenia przy html2canvas)
            // Funkcja link(x, y, w, h, {url})
            pdf.link(pdfX, pdfY, pdfW, pdfH, { url: href });
        });

        // Pobieranie pliku
        const name = document.getElementById('fullName').value || 'CV';
        pdf.save(`${name.replace(/\s+/g, '_')}_CV.pdf`);

    } catch (e) {
        console.error(e);
        alert('Błąd podczas generowania PDF: ' + e.message);
    } finally {
        // Sprzątanie
        element.classList.remove('pdf-mode');
        hiddenEls.forEach(el => el.style.display = ''); // Przywróć style CSS
        loader.classList.add('hidden');
    }
}

// --- ZAPISYWANIE PROJEKTU (JSON) ---
function saveCV() {
    // 1. Pobierz dane z prostych pól
    const data = {
        meta: { date: new Date().toISOString() },
        personal: {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            summary: document.getElementById('summary').value,
            rodo: document.getElementById('rodoClause').value,
            // Linki społecznościowe
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            website: document.getElementById('website').value,
        },
        skills: document.getElementById('skills').value,
        photo: state.photoBase64, // Zapisz zdjęcie
        // 2. Pobierz dane z sekcji dynamicznych
        experience: getSectionData('experienceContainer', ['.exp-title', '.exp-company', '.exp-date', '.exp-desc', '.exp-link']),
        certificates: getSectionData('certificatesContainer', ['.cert-name', '.cert-issuer', '.cert-date', '.cert-link']),
        education: getSectionData('educationContainer', ['.edu-school', '.edu-degree', '.edu-date']),
        languages: getSectionData('languagesContainer', ['.lang-name', '.lang-level']),
        websites: getSectionData('websitesContainer', ['.web-label', '.web-url'])
    };

    // 3. Utwórz plik i wymuś pobieranie
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${data.personal.fullName.replace(/\s+/g, '_') || 'Projekt'}.json`;
    document.body.appendChild(a); // Wymagane dla Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- WCZYTYWANIE PROJEKTU (JSON) ---
function loadCV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);

            // 1. Wypełnij pola proste (Dane osobowe i inne)
            if (data.personal) {
                setVal('fullName', data.personal.fullName);
                setVal('jobTitle', data.personal.jobTitle);
                setVal('email', data.personal.email);
                setVal('phone', data.personal.phone);
                setVal('address', data.personal.address);
                setVal('summary', data.personal.summary);
                setVal('rodoClause', data.personal.rodo);
                setVal('linkedin', data.personal.linkedin);
                setVal('github', data.personal.github);
                setVal('website', data.personal.website);
            }

            // Umiejętności
            setVal('skills', data.skills);

            // 2. Przywróć zdjęcie
            if (data.photo) {
                state.photoBase64 = data.photo;
                const img = document.getElementById('photoPreview');
                img.src = data.photo;
                document.getElementById('btnRemovePhoto').style.display = 'inline-block';
            } else {
                removePhoto();
            }

            // 3. Wyczyść stare sekcje dynamiczne
            ['experienceContainer', 'certificatesContainer', 'educationContainer', 'languagesContainer', 'websitesContainer']
                .forEach(id => document.getElementById(id).innerHTML = '');

            // 4. Odtwórz sekcje dynamiczne
            // Parametry: (tablica_danych, funkcja_dodająca, id_kontenera, lista_klas_inputów)
            
            recreateSection(data.experience, addExperience, 'experienceContainer', 
                ['.exp-title', '.exp-company', '.exp-date', '.exp-desc', '.exp-link']);

            recreateSection(data.certificates, addCertificate, 'certificatesContainer', 
                ['.cert-name', '.cert-issuer', '.cert-date', '.cert-link']);

            recreateSection(data.education, addEducation, 'educationContainer', 
                ['.edu-school', '.edu-degree', '.edu-date']);

            recreateSection(data.languages, addLanguage, 'languagesContainer', 
                ['.lang-name', '.lang-level']);

            recreateSection(data.websites, addWebsite, 'websitesContainer', 
                ['.web-label', '.web-url']);

            // Odśwież widok
            generateCV();
            alert('Projekt wczytany pomyślnie!');

        } catch (err) {
            console.error(err);
            alert('Błąd: Nieprawidłowy plik JSON lub uszkodzone dane.');
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset inputa, by umożliwić ponowne wczytanie tego samego pliku
}

// --- Funkcje pomocnicze do wczytywania ---

// Bezpieczne ustawianie wartości inputa
function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

// Odtwarzanie listy dynamicznej
function recreateSection(items, addFunction, containerId, selectors) {
    if (!items || !Array.isArray(items)) return;
    
    const container = document.getElementById(containerId);
    
    items.forEach(itemData => {
        // 1. Wywołaj funkcję dodającą pusty element (np. addExperience)
        addFunction(); 
        
        // 2. Pobierz ten nowo dodany element (ostatni w kontenerze)
        const newItem = container.lastElementChild;
        
        // 3. Wypełnij go danymi
        selectors.forEach(selector => {
            const input = newItem.querySelector(selector);
            if (input) {
                // Klucz w JSON to nazwa klasy bez kropki (tak to zapisaliśmy w saveCV)
                const key = selector.replace('.', '');
                input.value = itemData[key] || '';
            }
        });
    });
}

// Funkcja pomocnicza do zbierania danych z dynamicznych list
function getSectionData(containerId, selectors) {
    const items = [];
    const container = document.getElementById(containerId);
    if (!container) return items;

    container.querySelectorAll('.dynamic-item').forEach(div => {
        const item = {};
        selectors.forEach(sel => {
            const input = div.querySelector(sel);
            // Klucz to nazwa klasy bez kropki (np. 'exp-title')
            const key = sel.replace('.', ''); 
            item[key] = input ? input.value : '';
        });
        items.push(item);
    });
    return items;
}