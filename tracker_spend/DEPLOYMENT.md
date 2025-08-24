# 🚀 Deployment su Railway

## Prerequisiti

1. **Account Railway**: Registrati su [railway.app](https://railway.app)
2. **Repository GitHub**: Il progetto deve essere su GitHub
3. **Database MySQL**: Railway offre MySQL come plugin

## 📋 Step di Deployment

### 1. Preparazione Repository

Assicurati che il repository contenga:
- ✅ `package.json` (root)
- ✅ `nixpacks.toml`
- ✅ `railway.json`
- ✅ `Procfile`
- ✅ `backend_python/requirements.txt`
- ✅ `frontend/package.json`

### 2. Connessione a Railway

1. Vai su [railway.app](https://railway.app)
2. Clicca "New Project"
3. Seleziona "Deploy from GitHub repo"
4. Connetti il tuo repository GitHub
5. Seleziona il repository `TrackerSpend`

### 3. Configurazione Database

1. Nel progetto Railway, clicca "New"
2. Seleziona "Database" → "MySQL"
3. Railway creerà automaticamente le variabili d'ambiente:
   - `RAILWAY_MYSQL_URL`
   - `MYSQL_URL`
   - `MYSQL_HOST`
   - `MYSQL_USERNAME`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### 4. Configurazione Variabili d'Ambiente

Nel tuo progetto Railway, vai su "Variables" e aggiungi:

```env
# JWT Secret (genera una chiave sicura)
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (sostituisci con il tuo dominio Railway)
FRONTEND_URL=https://your-app.railway.app

# Ambiente
NODE_ENV=production
```

### 5. Deploy

1. Railway rileverà automaticamente la configurazione
2. Il build inizierà automaticamente
3. Monitora i log per eventuali errori

### 6. Verifica

1. Controlla che l'app sia online
2. Testa l'endpoint `/api/health`
3. Verifica la connessione al database

## 🔧 Troubleshooting

### Build Fallisce
- Controlla i log di build
- Verifica che tutte le dipendenze siano in `requirements.txt`
- Assicurati che Node.js sia >= 18

### Database Connection Error
- Verifica le variabili d'ambiente del database
- Controlla che il database MySQL sia attivo
- Testa la connessione manualmente

### CORS Error
- Verifica che `FRONTEND_URL` sia corretto
- Controlla che il dominio sia nell'array `origins`

### App Non Si Avvia
- Controlla i log di runtime
- Verifica che la porta sia corretta (Railway usa `PORT`)
- Assicurati che il comando di start sia corretto

## 📊 Monitoraggio

### Logs
- Railway fornisce log in tempo reale
- Monitora errori e performance

### Metrics
- CPU e memoria usage
- Request/response times
- Database connections

### Health Check
- Endpoint: `/api/health`
- Dovrebbe restituire `{"status": "ok"}`

## 🔄 Aggiornamenti

1. Push su GitHub
2. Railway deployerà automaticamente
3. Monitora il deployment
4. Verifica che tutto funzioni

## 💰 Costi

- **Free Tier**: $5 di crediti mensili
- **MySQL**: ~$5/mese
- **App**: ~$5/mese
- **Totale**: ~$10-15/mese

## 🎯 Prossimi Passi

1. **Domain Personalizzato**: Configura un dominio custom
2. **SSL**: Railway fornisce SSL automatico
3. **CDN**: Configura Cloudflare per performance
4. **Monitoring**: Aggiungi Sentry per error tracking
5. **CI/CD**: Configura GitHub Actions per test automatici

---

**🚀 Il tuo TrackerSpend è ora live su Railway!**
