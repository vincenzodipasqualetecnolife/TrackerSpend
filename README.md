## AI Tracker – App di monitoraggio spese personali (TrueLayer PSD2)

Questo repository contiene un progetto completo composto da:

- Backend FastAPI (Python) con integrazione OAuth2 a TrueLayer (sandbox), PostgreSQL/SQLite, SQLAlchemy + Alembic, sicurezza token con cifratura, Dockerfile e docker-compose, test con pytest.
- App mobile (BeeWare/Briefcase) per iOS e Android con schermate di login, dashboard con grafici, lista e dettaglio transazioni. Le chiamate avvengono solo verso il backend.

### Struttura

```
backend/
  app/
    api/
    core/
    models/
    schemas/
    alembic/
    main.py
  Dockerfile
  requirements.txt
  alembic.ini
  .env.example
mobile/
  expenses_tracker/
    pyproject.toml
    src/expenses_tracker/
      app.py
      api_client.py
      storage.py
      charts.py
      views/
        login.py
        dashboard.py
        transactions.py
        detail.py
docker-compose.yml
.github/workflows/ci.yml
```

### Requisiti

- Python 3.11+
- Docker e Docker Compose
- Account TrueLayer sandbox: `https://truelayer.com/` (area developer)

---

## Backend

### Configurazione

1) Copia `backend/.env.example` in `backend/.env` e completa i valori:

```
cp backend/.env.example backend/.env
```

Variabili principali:

- `DATABASE_URL` (PostgreSQL) oppure `USE_SQLITE=1` per sviluppo locale
- `API_KEY` chiave condivisa tra app mobile e backend (header `X-API-Key`)
- `SECRET_KEY` chiave Fernet (usa `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)
- Credenziali TrueLayer sandbox: `TRUE_LAYER_CLIENT_ID`, `TRUE_LAYER_CLIENT_SECRET`
- `TRUE_LAYER_REDIRECT_URI` (sviluppo): `http://localhost:8000/auth/callback`

### Avvio con Docker

```
docker compose up --build
```

Servizi:

- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### Migrazioni DB

```
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
```

Per sviluppo con SQLite è sufficiente: tabelle create automaticamente all'avvio (se `USE_SQLITE=1`).

### Endpoints principali

- `GET /health` – stato servizio
- `GET /auth/login` – genera URL di autorizzazione TrueLayer
- `GET /auth/callback` – callback OAuth2 (TrueLayer → backend)
- `POST /transactions/sync` – sincronizza transazioni dal provider
- `GET /transactions` – lista transazioni (DB)
- `GET /dashboard` – aggregati/categorie (pandas)

Tutti gli endpoint (tranne `/health` e `/auth/callback`) richiedono header `X-API-Key: <API_KEY>`.

### Test

```
docker compose exec backend pytest -q
```

---

## Mobile (BeeWare / Briefcase)

Entrare nella cartella `mobile/expenses_tracker`.

1) Configura backend URL e API Key dall'app (schermata Login) oppure imposta variabili in sviluppo usando la schermata stessa.

2) Avvio in sviluppo desktop:

```
cd mobile/expenses_tracker
briefcase dev
```

3) Build iOS:

```
briefcase build iOS
briefcase run iOS
```

Importa in Xcode dal progetto generato da Briefcase per firma/certificati e distribuzione TestFlight.

4) Build Android:

```
briefcase build android
briefcase run android
``;

Per pubblicazione su Google Play generare l'app bundle o l'APK con Briefcase e seguire la procedura guidata.

### Note OAuth2 in app

L'app non chiama TrueLayer direttamente. La schermata Login chiede `Backend URL` e `API Key` e apre la pagina di login bancario via `WebView` puntando a `/auth/login`. Al termine, il callback arriva al backend che salva i token in modo cifrato. Dalla dashboard è possibile premere "Sync" per aggiornare le transazioni.

---

## Sicurezza

- Token di refresh cifrati con Fernet (chiave in `.env`).
- Segreti caricati da `.env` (non committare in git).
- HTTPS: mettere dietro un reverse proxy (es. traefik/nginx) in produzione.
- Autorizzazione delle API via header `X-API-Key`.

---

## Esempi di chiamata API (sandbox TrueLayer)

1) Ottieni URL di autorizzazione:

```
curl -H "X-API-Key: $API_KEY" http://localhost:8000/auth/login
```

2) Sincronizza transazioni dopo il collegamento:

```
curl -X POST -H "X-API-Key: $API_KEY" http://localhost:8000/transactions/sync
```

3) Lista transazioni:

```
curl -H "X-API-Key: $API_KEY" http://localhost:8000/transactions
```

4) Dashboard categorie:

```
curl -H "X-API-Key: $API_KEY" http://localhost:8000/dashboard
```

---

## CI

GitHub Actions esegue test Python e build dell'immagine Docker backend su ogni push.


