const express = require('express');
const axios = require('axios');
const router = express.Router();

// Gerçek NewsAPI entegrasyonu
router.get('/', async (req, res) => {
    try {
        const { q, page = 1 } = req.query;
        
        console.log(`📰 NewsAPI ile haber aranıyor: "${q}", Sayfa: ${page}`);
        
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: q,
                page: page,
                pageSize: 10,
                language: 'tr',
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY
            }
        });

        console.log(`📰 NewsAPI başarılı! ${response.data.articles.length} haber bulundu`);

        const news = response.data.articles.map((article, index) => ({
            id: `news-${index}-${Date.now()}`,
            title: article.title || 'Haber başlığı yok',
            description: article.description || 'Açıklama yok',
            content: article.content || 'İçerik yok',
            url: article.url,
            image: article.urlToImage || `https://picsum.photos/400/200?random=${index}`,
            source: article.source?.name || 'Kaynak belirtilmemiş',
            publishedAt: article.publishedAt || new Date().toISOString(),
            author: article.author || 'Yazar belirtilmemiş'
        }));

        res.json({
            query: q,
            news: news,
            total: response.data.totalResults,
            source: 'NewsAPI',
            page: parseInt(page),
            totalPages: Math.ceil(response.data.totalResults / 10)
        });

    } catch (error) {
        console.error('❌ NewsAPI hatası:', error.response?.data || error.message);
        
        // Fallback: Demo haberler
        const demoNews = generateDemoNews(q);
        res.json({ 
            query: q, 
            news: demoNews, 
            total: demoNews.length,
            source: 'Braver Explorer (Demo)',
            error: 'NewsAPI geçici olarak kullanılamıyor'
        });
    }
});

// Demo haber fallback
function generateDemoNews(query) {
    return Array.from({ length: 8 }, (_, i) => ({
        id: `demo-news-${i + 1}`,
        title: `${query} ile ilgili önemli gelişme ${i + 1}`,
        description: `"${query}" hakkında son dakika gelişmeleri. Braver Explorer NewsAPI entegrasyonu ile gerçek haberleri sunuyor.`,
        content: `Bu haber içeriği NewsAPI üzerinden sağlanmaktadır. "${query}" konusundaki en güncel bilgileri Braver Explorer ile takip edin.`,
        url: `https://braverexplorer.com/news/${encodeURIComponent(query)}-${i + 1}`,
        image: `https://picsum.photos/400/200?random=${i + 100}`,
        source: 'Braver Explorer News',
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        author: 'Braver Explorer Haber Ekibi'
    }));
}

module.exports = router;