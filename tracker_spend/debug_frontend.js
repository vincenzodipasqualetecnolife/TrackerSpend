// Script per debuggare i problemi di connessione del frontend
console.log('=== DEBUG FRONTEND CONNECTION ===');

// Test 1: Verifica se il backend è raggiungibile
async function testBackendConnection() {
    console.log('Test 1: Verifica connessione backend...');
    try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        console.log('✅ Backend raggiungibile:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend non raggiungibile:', error);
        return false;
    }
}

// Test 2: Verifica registrazione
async function testRegistration() {
    console.log('Test 2: Verifica registrazione...');
    try {
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'debuguser',
                email: 'debug@example.com',
                password: 'Debug123!',
                first_name: 'Debug',
                last_name: 'User'
            })
        });
        const data = await response.json();
        console.log('✅ Registrazione funziona:', data);
        return true;
    } catch (error) {
        console.error('❌ Registrazione fallita:', error);
        return false;
    }
}

// Test 3: Verifica login
async function testLogin() {
    console.log('Test 3: Verifica login...');
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: 'testuser',
                password: 'Test123!'
            })
        });
        const data = await response.json();
        console.log('✅ Login funziona:', data);
        return true;
    } catch (error) {
        console.error('❌ Login fallito:', error);
        return false;
    }
}

// Esegui tutti i test
async function runAllTests() {
    console.log('Iniziando test di connessione...');
    
    const backendOk = await testBackendConnection();
    if (!backendOk) {
        console.error('❌ Backend non raggiungibile. Verifica che sia in esecuzione su http://localhost:3001');
        return;
    }
    
    await testRegistration();
    await testLogin();
    
    console.log('=== FINE TEST ===');
}

// Esegui i test quando lo script viene caricato
runAllTests();
