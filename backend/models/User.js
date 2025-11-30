const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı gereklidir'],
        unique: true,
        trim: true,
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır'],
        maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olmalıdır']
    },
    email: {
        type: String,
        required: [true, 'Email gereklidir'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi girin']
    },
    password: {
        type: String,
        required: [true, 'Şifre gereklidir'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır']
    },
    searchHistory: [{
        query: String,
        timestamp: { type: Date, default: Date.now },
        resultCount: Number,
        source: String,
        results: [{
            title: String,
            url: String,
            snippet: String
        }]
    }],
    preferences: {
        safeSearch: { type: Boolean, default: true },
        language: { type: String, default: 'tr' },
        theme: { type: String, default: 'dark' },
        resultsPerPage: { type: Number, default: 10 }
    },
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Şifreyi hash'leme
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Timestamp update
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Sanal alan: tam ad
userSchema.virtual('fullName').get(function() {
    return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim();
});

module.exports = mongoose.model('User', userSchema);