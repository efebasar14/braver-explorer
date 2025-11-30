const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB bağlantısını deneyelim
let mongoose;
try {
    mongoose = require('mongoose');
    console.log('🐏 MongoDB driver yüklendi');
} catch (error) {
    console.log('⚠️ MongoDB driver yüklenemedi, demo modda devam ediliyor');
}

// Aries AI entegrasyonu
let AriesAI;
try {
    AriesAI = require('./ai/ariesAI');
    console.log('🤖 Aries AI driver yüklendi');
} catch (error) {
    console.log('⚠️ Aries AI driver yüklenemedi:', error.message);
}

// MongoDB bağlantısı (opsiyonel)
const connectDB = async () => {
    if (!mongoose) return null;
    
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️ MONGODB_URI tanımlı değil, demo modda çalışılıyor');
            return null;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log('❌ MongoDB bağlantı hatası, demo modda devam:', error.message);
        return null;
    }
};

// Aries AI bağlantısı
const connectAI = async () => {
    if (!AriesAI) return null;
    
    try {
        const ariesAI = new AriesAI();
        console.log('✅ Aries AI başlatıldı');
        return ariesAI;
    } catch (error) {
        console.log('❌ Aries AI başlatma hatası:', error.message);
        return null;
    }
};

// Bağlantıları başlat
let dbConnection = null;
let ariesAI = null;

connectDB().then(conn => {
    dbConnection = conn;
});

connectAI().then(ai => {
    ariesAI = ai;
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Basit arama geçmişi (memory-based, MongoDB bağlantısız)
let searchHistory = [];

// Arama geçmişi middleware'i
app.use((req, res, next) => {
    const start = Date.now();
    
    const originalSend = res.send;
    res.send = function(data) {
        // Arama kaydını memory'de tut
        if (req.method === 'GET' && req.query.q && 
            (req.path.includes('/api/search') || 
             req.path.includes('/api/news') || 
             req.path.includes('/api/images'))) {
            
            const responseTime = Date.now() - start;
            let resultCount = 0;
            
            try {
                const jsonData = JSON.parse(data);
                resultCount = jsonData.total || jsonData.results?.length || jsonData.news?.length || jsonData.images?.length || 0;
            } catch (e) {
                // JSON parse hatasını görmezden gel
            }

            const searchRecord = {
                id: Date.now().toString(),
                query: req.query.q,
                timestamp: new Date(),
                resultCount: resultCount,
                responseTime: responseTime,
                source: 'braver',
                path: req.path
            };

            searchHistory.unshift(searchRecord);
            searchHistory = searchHistory.slice(0, 1000); // Son 1000 aramayı tut
            
            console.log(`🔍 Arama kaydedildi: "${req.query.q}" (${resultCount} sonuç, ${responseTime}ms)`);
        }
        originalSend.call(this, data);
    };
    next();
});

// ==================== ARIES AI ROUTES ====================

// AI Health Check
app.get('/api/ai-status', (req, res) => {
    res.json({
        ai_engine: 'Aries AI',
        status: ariesAI ? 'active' : 'disabled',
        version: '1.0',
        capabilities: ariesAI ? [
            'Smart Coordinate Prediction',
            'Geodetic Parameter Estimation', 
            'Multi-system Coordinate Transformation',
            'Topographic Analysis',
            'Engineering AI Chat'
        ] : ['AI engine not available'],
        timestamp: new Date().toISOString()
    });
});

// Koordinat Kestirimi
app.post('/api/aries-ai/predict-coordinates', async (req, res) => {
    if (!ariesAI) {
        return res.status(503).json({ 
            error: 'Aries AI şu anda kullanılamıyor',
            suggestion: 'Lütfen daha sonra tekrar deneyin'
        });
    }

    try {
        const { partialData } = req.body;
        
        if (!partialData) {
            return res.status(400).json({ error: 'partialData gereklidir' });
        }

        const prediction = await ariesAI.predictCoordinates(partialData);
        res.json(prediction);
    } catch (error) {
        console.error('Koordinat kestirim hatası:', error);
        res.status(500).json({ error: 'AI kestirim hatası: ' + error.message });
    }
});

// Jeodezik Parametre Kestirimi
app.post('/api/aries-ai/estimate-parameters', async (req, res) => {
    if (!ariesAI) {
        return res.status(503).json({ 
            error: 'Aries AI şu anda kullanılamıyor',
            suggestion: 'Lütfen daha sonra tekrar deneyin'
        });
    }

    try {
        const { surveyData } = req.body;
        
        const estimation = await ariesAI.estimateGeodeticParameters(surveyData || {});
        res.json(estimation);
    } catch (error) {
        console.error('Parametre kestirim hatası:', error);
        res.status(500).json({ error: 'Parametre kestirim hatası: ' + error.message });
    }
});

// Koordinat Dönüşümü
app.post('/api/aries-ai/transform-coordinates', async (req, res) => {
    if (!ariesAI) {
        return res.status(503).json({ 
            error: 'Aries AI şu anda kullanılamıyor',
            suggestion: 'Lütfen daha sonra tekrar deneyin'
        });
    }

    try {
        const { coordinates, fromSystem, toSystem } = req.body;
        
        if (!coordinates || !fromSystem || !toSystem) {
            return res.status(400).json({ 
                error: 'coordinates, fromSystem ve toSystem gereklidir' 
            });
        }

        const transformation = await ariesAI.transformCoordinates(
            coordinates, 
            fromSystem, 
            toSystem
        );
        
        res.json(transformation);
    } catch (error) {
        console.error('Koordinat dönüşüm hatası:', error);
        res.status(500).json({ error: 'Dönüşüm hatası: ' + error.message });
    }
});

// Topoğrafik Analiz
app.post('/api/aries-ai/analyze-topography', async (req, res) => {
    if (!ariesAI) {
        return res.status(503).json({ 
            error: 'Aries AI şu anda kullanılamıyor',
            suggestion: 'Lütfen daha sonra tekrar deneyin'
        });
    }

    try {
        const { areaData } = req.body;
        
        const analysis = await ariesAI.analyzeTopography(areaData || {});
        res.json(analysis);
    } catch (error) {
        console.error('Topoğrafik analiz hatası:', error);
        res.status(500).json({ error: 'Analiz hatası: ' + error.message });
    }
});

// AI Chat - Mühendislik Sohbeti
app.post('/api/aries-ai/chat', async (req, res) => {
    try {
        const { message, context = 'geospatial' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mesaj gereklidir' });
        }

        // Basit AI yanıtı (Aries AI olmadan da çalışsın)
        const responses = {
            geospatial: [
                "Harita projeniz için koordinat dönüşümü öneriyorum.",
                "Jeodezik parametrelerinizi optimize edebilirim.",
                "Bu bölge için topoğrafik analiz yapalım mı?",
                "Koordinat kestirimi ile eksik verileri tamamlayabilirim.",
                "Aries AI olarak harita mühendisliği problemlerinize çözüm üretebilirim."
            ],
            cadastral: [
                "Kadastro verilerinizi AI ile analiz edebilirim.",
                "Parselasyon optimizasyonu için yardımcı olabilirim.",
                "Sınır anlaşmazlıklarında veri analizi yapabilirim.",
                "Tapu ve kadastro veri entegrasyonu konusunda destek olabilirim."
            ],
            general: [
                "Aries AI olarak harita mühendisliği konusunda yardımcı olabilirim.",
                "Koordinat sistemleri hakkında sorularınızı yanıtlayabilirim.",
                "Jeodezik hesaplamalar için buradayım!",
                "Harita ve kadastro mühendisliği problemlerinizde yanınızdayım."
            ]
        };

        const categoryResponses = responses[context] || responses.general;
        const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

        res.json({
            response,
            context,
            confidence: 0.85 + Math.random() * 0.1,
            ai_engine: ariesAI ? 'Aries AI Active' : 'Basic Chat',
            suggestions: [
                'Koordinat kestirimi yap',
                'Parametreleri optimize et',
                'Topoğrafik analiz yap',
                'Harita dönüşümü yap'
            ],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI chat hatası:', error);
        res.status(500).json({ error: 'Chat hatası: ' + error.message });
    }
});

// ==================== MEVCUT ROUTES ====================

// Basit arama geçmişi endpoint'i
app.get('/api/history', (req, res) => {
    const { limit = 20 } = req.query;
    const history = searchHistory.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        history: history,
        total: history.length,
        source: 'memory'
    });
});

// Popüler aramalar
app.get('/api/popular-searches', (req, res) => {
    const { limit = 10 } = req.query;
    
    const popularMap = {};
    searchHistory.forEach(record => {
        popularMap[record.query] = (popularMap[record.query] || 0) + 1;
    });
    
    const popularSearches = Object.entries(popularMap)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, parseInt(limit));

    res.json({
        success: true,
        popularSearches: popularSearches,
        total: popularSearches.length
    });
});

// İstatistikler
app.get('/api/stats', (req, res) => {
    const today = new Date().toDateString();
    const todaySearches = searchHistory.filter(record => 
        new Date(record.timestamp).toDateString() === today
    ).length;

    res.json({
        success: true,
        stats: {
            totalSearches: searchHistory.length,
            todaySearches: todaySearches,
            databaseStatus: dbConnection ? 'MongoDB Aktif' : 'Memory (Demo)',
            aiStatus: ariesAI ? 'Aries AI Aktif' : 'AI Devre Dışı',
            popularToday: searchHistory
                .filter(record => new Date(record.timestamp).toDateString() === today)
                .reduce((acc, record) => {
                    acc[record.query] = (acc[record.query] || 0) + 1;
                    return acc;
                }, {})
        }
    });
});

// News API route'u
const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

// Ana arama endpoint'i
app.get('/api/search', async (req, res) => {
    const { q, page = 1 } = req.query;
    
    console.log(`🐏 Arama: "${q}", Sayfa: ${page}`);
    
    const results = {
        query: q,
        results: [
            {
                url: `http://localhost:${PORT}/search?q=${encodeURIComponent(q)}`,
                title: `${q} - Braver Explorer'da Keşfet`,
                content: `${q} hakkında kapsamlı bilgiler. ${ariesAI ? '🤖 Aries AI aktif!' : ''}`,
                description: `${q} arama sonuçları`
            },
            {
                url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
                title: `${q} - Google'da Ara`,
                content: `Bu aramayı Google'da yapmak için tıklayın.`,
                description: `Google'da ${q} ara`
            }
        ],
        total: 2,
        source: `Braver Explorer ${ariesAI ? '+ Aries AI' : ''}`
    };
    
    res.json(results);
});

// Görsel arama
app.get('/api/images', (req, res) => {
    const { q } = req.query;
    
    const demoImages = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        url: `https://picsum.photos/800/600?random=${i}`,
        thumbnail: `https://picsum.photos/200/150?random=${i}`,
        title: `${q} görseli ${i + 1}`,
        source: 'Braver Explorer',
        link: `#`
    }));
    
    res.json({
        query: q,
        images: demoImages,
        total: demoImages.length,
        source: 'Braver Explorer'
    });
});

// Basit search results page
app.get('/search', (req, res) => {
    const { q } = req.query;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${q} - Braver Explorer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a2e; color: white; }
                .container { max-width: 800px; margin: 0 auto; }
                .logo { font-size: 2rem; color: #ff6b35; margin-bottom: 20px; }
                .back-btn { background: #ff6b35; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                .ai-badge { background: #daa520; color: black; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; margin-left: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🐏 Braver Explorer ${ariesAI ? '<span class="ai-badge">🤖 Aries AI</span>' : ''}</div>
                <h1>"${q}" Arama Sonuçları</h1>
                <p>Bu sayfa demo amaçlıdır. ${ariesAI ? 'Aries AI aktif ve çalışıyor!' : 'AI motoru yüklenemedi.'}</p>
                <button class="back-btn" onclick="window.history.back()">← Geri Dön</button>
            </div>
        </body>
        </html>
    `);
});

// Frontend route'ları
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🐏 Braver Explorer ${PORT} portunda!`);
    console.log(`🚀 http://localhost:${PORT}`);
    console.log(`🗄️ Database: ${dbConnection ? 'MongoDB Atlas' : 'Memory (Demo)'}`);
    console.log(`🤖 Aries AI: ${ariesAI ? 'AKTİF 🟢' : 'DEVRE DIŞI 🔴'}`);
    console.log(`📊 Arama geçmişi aktif`);
    console.log(`📈 İstatistikler: /api/stats`);
    console.log(`🔍 Geçmiş: /api/history`);
    console.log(`🤖 AI Status: /api/ai-status`);
    console.log(`📍 AI Tools: /api/aries-ai/*`);
});