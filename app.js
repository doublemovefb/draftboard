const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// Sample player data (replace with real data)
const players = [
    { id: 1, name: "Player 1", position: "QB", grade: 50 },
    { id: 2, name: "Player 2", position: "RB", grade: 70 },
    // Add more players...
];

// Authentication functions
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        console.error("Signup error:", error);
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error("Login error:", error);
    }
}

function logout() {
    auth.signOut();
}

// Load draft board
async function loadBoard() {
    const snapshot = await db.collection('draftBoards').doc(currentUser.uid).get();
    if (snapshot.exists) {
        return snapshot.data().players;
    }
    return players; // Return default if no board exists
}

// Save draft board
async function saveBoard() {
    const playersWithGrades = Array.from(document.querySelectorAll('.player-card')).map(card => ({
        id: parseInt(card.dataset.id),
        grade: parseInt(card.querySelector('input[type="range"]').value)
    }));
    
    await db.collection('draftBoards').doc(currentUser.uid).set({
        players: playersWithGrades
    });
}

// Render players
function renderPlayers(players) {
    const container = document.getElementById('players-container');
    container.innerHTML = '';
    
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.id = player.id;
        card.innerHTML = `
            <h3>${player.name} (${player.position})</h3>
            <div class="slider-container">
                <span>0</span>
                <input type="range" min="0" max="100" value="${player.grade}">
                <span>100</span>
                <span>Grade: ${player.grade}</span>
            </div>
        `;
        
        const slider = card.querySelector('input[type="range"]');
        slider.addEventListener('input', (e) => {
            card.querySelector('span:last-child').textContent = `Grade: ${e.target.value}`;
        });
        
        container.appendChild(card);
    });
}

// Auth state listener
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadBoard().then(players => renderPlayers(players));
    } else {
        currentUser = null;
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }
});
