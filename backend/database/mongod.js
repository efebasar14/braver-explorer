const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🐏 MongoDB bağlantısı kuruluyor...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Bağlantısı Başarılı!`);
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`🗄️ Database: ${conn.connection.name}`);
        
        // Bağlantı event'lerini dinle
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB bağlantı hatası:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB bağlantısı kesildi');
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB bağlantısı aktif');
        });

    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:');
        console.error('Hata Detayı:', error.message);
        console.error('Connection String:', process.env.MONGODB_URI ? 'Mevcut' : 'Eksik');
        process.exit(1);
    }
};

module.exports = connectDB;