class BraverExplorer {
    constructor() {
        this.currentPage = 1;
        this.currentQuery = '';
        this.searchHistory = JSON.parse(localStorage.getItem('braverSearchHistory')) || [];
        this.currentSection = 'search';
        this.API_BASE = 'http://localhost:3000/api'; // Backend API base URL
        this.init();
    }
    
    init() {
        this.initializeEventListeners();
        this.showSection('search');
        this.showSearchHistory();
    }
    
    initializeEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const imageSearchInput = document.getElementById('imageSearchInput');
        const newsSearchInput = document.getElementById('newsSearchInput');
        const mapsSearchInput = document.getElementById('mapsSearchInput');
        
        // Debounced input for main search
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.handleInput(e.target.value);
            }, 250);
        });
        
        // Enter key for all search inputs
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        imageSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performImageSearch();
        });
        
        newsSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performNewsSearch();
        });
        
        mapsSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performMapsSearch();
        });
    }
    
    // Section Management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Add active class to clicked nav link
        event.target.classList.add('active');
        
        this.currentSection = sectionName;
    }
    
    // Input Handling
    async handleInput(query) {
        if (query.length < 2) {
            this.showSearchHistory();
            return;
        }
        
        try {
            const response = await fetch(`${this.API_BASE}/suggest?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.showSuggestions(data.suggestions || []);
        } catch (error) {
            console.log('Öneri API hatası, local öneriler kullanılıyor:', error);
            this.showLocalSuggestions(query);
        }
    }
    
    showSearchHistory() {
        const container = document.getElementById('suggestions');
        if (this.searchHistory.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = `
            <div class="suggestion-item" style="color: #ff6b35; font-weight: bold;">
                Son Aramalarınız:
            </div>
            ${this.searchHistory.slice(0, 5).map(item => `
                <div class="suggestion-item" onclick="braverExplorer.selectSuggestion('${item.replace(/'/g, "\\'")}')">
                    <span class="ram-icon">🐏</span> ${item}
                </div>
            `).join('')}
        `;
        container.style.display = 'block';
    }
    
    showLocalSuggestions(query) {
        const localSuggestions = [
            `${query} nedir?`,
            `${query} nasıl yapılır?`,
            `${query} haberleri`,
            `${query} görseller`,
            `${query} hakkında bilgi`
        ];
        
        this.showSuggestions(localSuggestions);
    }
    
    showSuggestions(suggestions) {
        const container = document.getElementById('suggestions');
        
        if (!suggestions || suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="braverExplorer.selectSuggestion('${suggestion.replace(/'/g, "\\'")}')">
                <span class="ram-icon">🐏</span> ${this.highlightSuggestion(suggestion, document.getElementById('searchInput').value)}
            </div>
        `).join('');
        
        container.style.display = 'block';
        container.classList.add('fade-in');
    }
    
    highlightSuggestion(suggestion, query) {
        if (!query) return suggestion;
        const regex = new RegExp(`(${query})`, 'gi');
        return suggestion.replace(regex, '<strong style="color: #ff6b35;">$1</strong>');
    }
    
    hideSuggestions() {
        document.getElementById('suggestions').style.display = 'none';
    }
    
    selectSuggestion(suggestion) {
        document.getElementById('searchInput').value = suggestion;
        this.hideSuggestions();
        this.performSearch();
    }
    
    // Search Functions
    async performSearch(page = 1) {
        const query = document.getElementById('searchInput').value.trim();
        
        if (!query) return;
        
        this.currentQuery = query;
        this.currentPage = page;
        this.addToSearchHistory(query);
        
        try {
            document.getElementById('resultsContainer').innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🐏</div>
                    <div>Braver Explorer "${query}" için keşif yapıyor...</div>
                </div>
            `;
            
            const response = await fetch(`${this.API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`);
            const data = await response.json();
            
            this.displayResults(data);
        } catch (error) {
            console.error('Arama hatası:', error);
            this.showDemoResults(query, page);
        }
    }
    
    async performImageSearch() {
        const query = document.getElementById('imageSearchInput').value.trim();
        if (!query) return;
        
        this.addToSearchHistory(query);
        
        try {
            document.getElementById('imagesResults').innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🐏</div>
                    <div>"${query}" görselleri aranıyor...</div>
                </div>
            `;
            
            const response = await fetch(`${this.API_BASE}/images?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            this.displayImageResults(data);
        } catch (error) {
            console.error('Görsel arama hatası:', error);
            this.showDemoImages(query);
        }
    }
    
    async performNewsSearch() {
        const query = document.getElementById('newsSearchInput').value.trim();
        if (!query) return;
        
        this.addToSearchHistory(query);
        
        try {
            document.getElementById('newsResults').innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🐏</div>
                    <div>"${query}" haberleri aranıyor...</div>
                </div>
            `;
            
            const response = await fetch(`${this.API_BASE}/news?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            this.displayNewsResults(data);
        } catch (error) {
            console.error('Haber arama hatası:', error);
            this.showDemoNews(query);
        }
    }
    
    performMapsSearch() {
        const query = document.getElementById('mapsSearchInput').value.trim();
        if (!query) return;
        
        this.addToSearchHistory(query);
        document.getElementById('mapsResults').innerHTML = `
            <div class="placeholder-content">
                <h3>🐏 "${query}" için Harita Arama</h3>
                <p>Harita arama backend entegrasyonu aktif değil. Interaktif harita için maps API'si gerekiyor.</p>
                <div class="demo-map">
                    🗺️ "${query}" Haritası<br>
                    <small>Gerçek konum verileri için Google Maps veya OpenStreetMap entegrasyonu gerekli</small>
                </div>
            </div>
        `;
    }
    
    addToSearchHistory(query) {
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, 10);
        localStorage.setItem('braverSearchHistory', JSON.stringify(this.searchHistory));
    }
    
    displayResults(data) {
        const container = document.getElementById('resultsContainer');
        const pagination = document.getElementById('pagination');
        
        if (!data.results || data.results.length === 0) {
            container.innerHTML = `
                <div class="result-item" style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🐏</div>
                    <h3>"${data.query}" için sonuç bulunamadı</h3>
                    <p style="margin-top: 15px; color: #a0a0a0;">Koç gibi pes etme, şunları dene:</p>
                    <ul style="text-align: left; display: inline-block; margin-top: 15px;">
                        <li>Yazım hatalarını kontrol et</li>
                        <li>Daha genel anahtar kelimeler dene</li>
                        <li>Farklı kelimelerle ara</li>
                        <li>Aramana yeni terimler ekle</li>
                    </ul>
                </div>
            `;
            pagination.style.display = 'none';
            return;
        }
        
        const resultsHTML = `
            <div class="result-stats">
                "${data.query}" için ${data.total} sonuç bulundu
            </div>
            ${data.results.map((result, index) => `
                <div class="result-item fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="result-url">
                        <span class="ram-icon">🐏</span>
                        ${this.formatUrl(result.url)}
                    </div>
                    <a href="${result.url}" class="result-title" target="_blank">${result.title}</a>
                    <div class="result-snippet">${this.generateSnippet(result.content, data.query)}</div>
                </div>
            `).join('')}
        `;
        
        container.innerHTML = resultsHTML;
        this.showPagination(data.total, this.currentPage);
    }
    
    displayImageResults(data) {
        const container = document.getElementById('imagesResults');
        
        if (!data.images || data.images.length === 0) {
            container.innerHTML = `
                <div class="placeholder-content">
                    <h3>🐏 "${data.query}" için görsel bulunamadı</h3>
                    <p>Farklı anahtar kelimelerle tekrar deneyin.</p>
                </div>
            `;
            return;
        }
        
        const imagesHTML = `
            <div class="result-stats">
                "${data.query}" için ${data.total} görsel bulundu
            </div>
            <div class="image-grid">
                ${data.images.map((image, index) => `
                    <div class="image-item fade-in" style="animation-delay: ${index * 0.1}s">
                        <a href="${image.link}" target="_blank">
                            <img src="${image.thumbnail}" alt="${image.title}" 
                                 onerror="this.src='https://picsum.photos/200/150?random=${index}'">
                        </a>
                        <div class="image-info">
                            <div class="image-title">${image.title}</div>
                            <div class="image-source">Kaynak: ${image.source}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = imagesHTML;
    }
    
    displayNewsResults(data) {
        const container = document.getElementById('newsResults');
        
        if (!data.news || data.news.length === 0) {
            container.innerHTML = `
                <div class="placeholder-content">
                    <h3>🐏 "${data.query}" için haber bulunamadı</h3>
                    <p>Farklı anahtar kelimelerle tekrar deneyin.</p>
                </div>
            `;
            return;
        }
        
        const newsHTML = `
            <div class="result-stats">
                "${data.query}" için ${data.total} haber bulundu
            </div>
            <div class="news-list">
                ${data.news.map((news, index) => `
                    <div class="news-item fade-in" style="animation-delay: ${index * 0.1}s">
                        <div class="news-header">
                            <a href="${news.url}" class="news-title" target="_blank">${news.title}</a>
                            <div class="news-source">${news.source} • ${this.formatDate(news.publishedAt)}</div>
                        </div>
                        <div class="news-content">
                            ${news.image ? `<img src="${news.image}" alt="${news.title}" class="news-image">` : ''}
                            <div class="news-description">${news.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = newsHTML;
    }
    
    showDemoResults(query, page) {
        const demoResults = {
            query: query,
            total: 42,
            results: [
                {
                    url: `https://braverexplorer.com/${query.toLowerCase()}`,
                    title: `${query} - Braver Explorer'da Keşfedin`,
                    content: `${query} hakkında kapsamlı bilgiler ve keşif rehberi. Braver Explorer ile ${query} dünyasını keşfedin ve yeni ufuklara yelken açın.`
                },
                {
                    url: `https://wiki.example.com/${query.toLowerCase()}`,
                    title: `${query} Nedir? - Kapsamlı Rehber`,
                    content: `${query} hakkında detaylı bilgiler, tarihçesi ve kullanım alanları. ${query} ile ilgili merak ettiğiniz her şey burada.`
                },
                {
                    url: `https://news.braverexplorer.com/${query.toLowerCase()}`,
                    title: `${query} Haberleri ve Gelişmeleri`,
                    content: `${query} ile ilgili en son haberler, gelişmeler ve analizler. Güncel bilgilerle ${query} dünyasını takip edin.`
                }
            ]
        };
        
        this.displayResults(demoResults);
    }
    
    showDemoImages(query) {
        const demoImages = {
            query: query,
            images: Array.from({ length: 8 }, (_, i) => ({
                id: i + 1,
                url: `https://picsum.photos/800/600?random=${i}`,
                thumbnail: `https://picsum.photos/200/150?random=${i}`,
                title: `${query} görseli ${i + 1}`,
                source: 'Braver Explorer',
                photographer: 'Demo',
                link: '#'
            })),
            total: 8
        };
        
        this.displayImageResults(demoImages);
    }
    
    showDemoNews(query) {
        const demoNews = {
            query: query,
            news: Array.from({ length: 5 }, (_, i) => ({
                id: `news-${i + 1}`,
                title: `${query} ile ilgili haber ${i + 1}`,
                description: `Braver Explorer haber servisi şu anda demo modunda. ${query} hakkında gerçek haberler için backend entegrasyonu gerekli.`,
                url: '#',
                image: `https://picsum.photos/400/200?random=${i + 100}`,
                source: 'Braver Explorer Haber',
                publishedAt: new Date().toISOString()
            })),
            total: 5
        };
        
        this.displayNewsResults(demoNews);
    }
    
    formatUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return url;
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    generateSnippet(content, query) {
        if (!content) return 'Bu sonuç için açıklama mevcut değil.';
        
        const words = query.toLowerCase().split(' ');
        const sentences = content.split('.');
        
        for (let sentence of sentences) {
            if (words.some(word => sentence.toLowerCase().includes(word))) {
                return sentence.substring(0, 160) + '...';
            }
        }
        
        return content.substring(0, 160) + '...';
    }
    
    showPagination(totalResults, currentPage) {
        const totalPages = Math.ceil(totalResults / 10);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        let paginationHTML = '';
        
        if (currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="braverExplorer.performSearch(${currentPage - 1})">
                <span class="ram-icon">🐏</span> Önceki
            </button>`;
        }
        
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                onclick="braverExplorer.performSearch(${i})">${i}</button>`;
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" onclick="braverExplorer.performSearch(${currentPage + 1})">
                Sonraki <span class="ram-icon">🐏</span>
            </button>`;
        }
        
        pagination.innerHTML = paginationHTML;
        pagination.style.display = 'flex';
    }
}

// Global functions for HTML onclick events
function showSection(sectionName) {
    braverExplorer.showSection(sectionName);
}

function performSearch() {
    braverExplorer.performSearch();
}

function performImageSearch() {
    braverExplorer.performImageSearch();
}

function performNewsSearch() {
    braverExplorer.performNewsSearch();
}

function performMapsSearch() {
    braverExplorer.performMapsSearch();
}

// Initialize application
const braverExplorer = new BraverExplorer();

// Focus on search input when page loads
window.addEventListener('load', () => {
    document.getElementById('searchInput').focus();
});