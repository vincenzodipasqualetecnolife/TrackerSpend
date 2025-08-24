# Backend API Documentation

## Overview

Il backend di TrackerSpend è costruito con Flask e MySQL, fornendo un'API RESTful completa per la gestione delle finanze personali.

## Base URL

```
http://localhost:3001/api
```

## Autenticazione

Tutti gli endpoint (tranne `/auth/register` e `/auth/login`) richiedono autenticazione tramite Bearer token nell'header `Authorization`.

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health
Verifica lo stato del server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:30:00"
}
```

### Autenticazione

#### POST /auth/register
Registra un nuovo utente.

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Mario",
  "lastName": "Rossi",
  "phone": "+393331234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}
```

#### POST /auth/login
Effettua il login dell'utente.

**Request Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  }
}
```

### Categorie

#### GET /categories
Ottiene tutte le categorie dell'utente autenticato.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Alimentari",
      "description": "Spesa alimentare",
      "type": "expense",
      "color": "#EF4444",
      "icon": "🛒",
      "is_default": true
    }
  ],
  "total": 1
}
```

#### GET /categories/{category_id}
Ottiene una categoria specifica.

#### POST /categories
Crea una nuova categoria.

**Request Body:**
```json
{
  "name": "Nuova Categoria",
  "description": "Descrizione categoria",
  "type": "expense",
  "color": "#10B981",
  "icon": "💰"
}
```

#### PUT /categories/{category_id}
Aggiorna una categoria esistente.

#### DELETE /categories/{category_id}
Elimina una categoria (non può eliminare categorie di default).

#### GET /categories/type/{category_type}
Ottiene categorie filtrate per tipo (income/expense).

### Budget

#### GET /budgets
Ottiene tutti i budget dell'utente.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Budget Mensile",
      "amount": 1000.00,
      "period": "monthly",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "category_name": "Alimentari",
      "category_color": "#EF4444"
    }
  ],
  "total": 1
}
```

#### GET /budgets/{budget_id}
Ottiene un budget specifico.

#### POST /budgets
Crea un nuovo budget.

**Request Body:**
```json
{
  "name": "Budget Alimentari",
  "amount": 500.00,
  "period": "monthly",
  "start_date": "2025-01-01",
  "category_id": 1,
  "description": "Budget per spesa alimentare"
}
```

#### PUT /budgets/{budget_id}
Aggiorna un budget esistente.

#### DELETE /budgets/{budget_id}
Elimina un budget.

#### GET /budgets/{budget_id}/progress
Ottiene il progresso di un budget con importi spesi e rimanenti.

**Response:**
```json
{
  "data": {
    "budget": { ... },
    "spent_amount": 350.00,
    "remaining_amount": 150.00,
    "percentage_used": 70.0
  }
}
```

#### GET /budgets/active
Ottiene tutti i budget attivi con progresso.

### Obiettivi

#### GET /goals
Ottiene tutti gli obiettivi dell'utente.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Vacanza Estate",
      "target_amount": 2000.00,
      "current_amount": 500.00,
      "deadline": "2025-06-30",
      "priority": "high",
      "status": "active"
    }
  ],
  "total": 1
}
```

#### GET /goals/{goal_id}
Ottiene un obiettivo specifico.

#### POST /goals
Crea un nuovo obiettivo.

**Request Body:**
```json
{
  "name": "Nuovo Obiettivo",
  "description": "Descrizione obiettivo",
  "target_amount": 1000.00,
  "deadline": "2025-12-31",
  "priority": "medium"
}
```

#### PUT /goals/{goal_id}
Aggiorna un obiettivo esistente.

#### DELETE /goals/{goal_id}
Elimina un obiettivo.

#### GET /goals/{goal_id}/progress
Ottiene il progresso di un obiettivo con metriche calcolate.

**Response:**
```json
{
  "data": {
    "goal": { ... },
    "progress_percentage": 25.0,
    "remaining_amount": 1500.00,
    "days_remaining": 150,
    "monthly_contribution": 100.00
  }
}
```

#### POST /goals/{goal_id}/update-progress
Aggiorna il progresso di un obiettivo aggiungendo un importo.

**Request Body:**
```json
{
  "amount": 100.00
}
```

#### GET /goals/active
Ottiene tutti gli obiettivi attivi con progresso.

### Dashboard

#### GET /dashboard/stats
Ottiene statistiche complete del dashboard.

**Response:**
```json
{
  "data": {
    "current_month": {
      "total_income": 3000.00,
      "total_expenses": 2000.00,
      "net_balance": 1000.00,
      "total_transactions": 45,
      "daily_average": 66.67
    },
    "changes": {
      "income_change": 10.5,
      "expense_change": -5.2
    },
    "top_expense_categories": [
      {
        "category_name": "Alimentari",
        "total_amount": 500.00,
        "transaction_count": 15
      }
    ],
    "recent_transactions": [ ... ],
    "budget_progress": [ ... ]
  }
}
```

#### GET /dashboard/monthly/{year}/{month}
Ottiene statistiche per un mese specifico.

**Response:**
```json
{
  "data": {
    "month": 1,
    "year": 2025,
    "total_income": 3000.00,
    "total_expenses": 2000.00,
    "net_balance": 1000.00,
    "total_transactions": 45,
    "category_stats": [ ... ],
    "daily_stats": [ ... ]
  }
}
```

#### GET /dashboard/category-stats
Ottiene statistiche per categoria in un intervallo di date.

**Query Parameters:**
- `start_date` (optional): Data inizio (YYYY-MM-DD)
- `end_date` (optional): Data fine (YYYY-MM-DD)

**Response:**
```json
{
  "data": [
    {
      "category_name": "Alimentari",
      "total_amount": 500.00,
      "transaction_count": 15,
      "average_amount": 33.33,
      "min_amount": 5.00,
      "max_amount": 100.00
    }
  ],
  "total": 1
}
```

#### GET /dashboard/trends
Ottiene trend di spesa negli ultimi N mesi.

**Query Parameters:**
- `months` (optional): Numero di mesi (default: 6)

**Response:**
```json
{
  "data": [
    {
      "year": 2024,
      "month": 12,
      "month_name": "December",
      "total_income": 3000.00,
      "total_expenses": 2000.00,
      "net_balance": 1000.00,
      "total_transactions": 45
    }
  ],
  "total": 6
}
```

### Transazioni

#### GET /transactions
Ottiene le transazioni dell'utente con filtri e paginazione.

**Query Parameters:**
- `page` (optional): Numero pagina (default: 1)
- `limit` (optional): Elementi per pagina (default: 20)
- `type` (optional): Tipo transazione (income/expense)
- `category_id` (optional): ID categoria
- `start_date` (optional): Data inizio (YYYY-MM-DD)
- `end_date` (optional): Data fine (YYYY-MM-DD)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "amount": 50.00,
      "description": "Spesa supermercato",
      "type": "expense",
      "transaction_date": "2025-01-15",
      "category_name": "Alimentari",
      "category_color": "#EF4444"
    }
  ],
  "total": 1,
  "page": 1,
  "total_pages": 1
}
```

#### POST /transactions
Crea una nuova transazione.

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Spesa supermercato",
  "type": "expense",
  "category_id": 1,
  "transaction_date": "2025-01-15"
}
```

#### PUT /transactions/{transaction_id}
Aggiorna una transazione esistente.

#### DELETE /transactions
Elimina transazioni (richiede array di ID).

**Request Body:**
```json
{
  "transaction_ids": [1, 2, 3]
}
```

#### POST /transactions/upload
Carica transazioni da file CSV/Excel.

**Request:** `multipart/form-data`
- `file`: File CSV o Excel

## Codici di Errore

### 400 Bad Request
- Dati mancanti o non validi
- Formato file non supportato

### 401 Unauthorized
- Token mancante o non valido
- Sessione scaduta

### 404 Not Found
- Risorsa non trovata
- ID non valido

### 500 Internal Server Error
- Errore del server
- Problemi di database

## Esempi di Utilizzo

### Creare un budget e monitorarlo

```bash
# 1. Creare un budget
curl -X POST http://localhost:3001/api/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budget Alimentari",
    "amount": 500.00,
    "period": "monthly",
    "start_date": "2025-01-01",
    "category_id": 1
  }'

# 2. Verificare il progresso
curl -X GET http://localhost:3001/api/budgets/1/progress \
  -H "Authorization: Bearer <token>"
```

### Creare un obiettivo e aggiornare il progresso

```bash
# 1. Creare un obiettivo
curl -X POST http://localhost:3001/api/goals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vacanza Estate",
    "target_amount": 2000.00,
    "deadline": "2025-06-30",
    "priority": "high"
  }'

# 2. Aggiornare il progresso
curl -X POST http://localhost:3001/api/goals/1/update-progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'
```

### Ottenere statistiche del dashboard

```bash
# Statistiche complete
curl -X GET http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer <token>"

# Statistiche per mese specifico
curl -X GET http://localhost:3001/api/dashboard/monthly/2025/1 \
  -H "Authorization: Bearer <token>"

# Trend ultimi 12 mesi
curl -X GET "http://localhost:3001/api/dashboard/trends?months=12" \
  -H "Authorization: Bearer <token>"
```

## Note Implementative

1. **Autenticazione**: Tutti gli endpoint (tranne auth) richiedono token valido
2. **Validazione**: Tutti gli input vengono validati lato server
3. **Errori**: Errori dettagliati con messaggi informativi
4. **Performance**: Query ottimizzate con indici appropriati
5. **Sicurezza**: Protezione SQL injection e validazione input
6. **CORS**: Configurato per frontend React
7. **Logging**: Log dettagliati per debugging
