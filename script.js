// 1. Configuration
const peopleCount = 18;
const babyColumn = document.getElementById('baby-column');
const adultColumn = document.getElementById('adult-column');

// Google Form & Sheet Details
const formURL = "https://docs.google.com/forms/d/e/1FAIpQLScsjRj3Ho6iyUg7W-Zlz6qrUCORhNQZUNsnlSvLfYOjTfUttA/formResponse"; 
const nameEntryID = "entry.697773808"; 
const scoreEntryID = "entry.832023337"; 
const sheetID = "1HR7B_020nErxVRtYiA0O38lf9FV8xbfoCpi2ZptiPrc";

// 2. Setup & Shuffle
let babyIds = [];
for (let i = 1; i <= peopleCount; i++) { babyIds.push(i); }
const shuffledBabies = [...babyIds].sort(() => Math.random() - 0.5);

// 3. Load Images & Initial Leaderboard
function loadGame() {
    shuffledBabies.forEach(id => {
        const img = document.createElement('img');
        img.src = `images/${id}b.jpg`; 
        img.dataset.id = id;          
        babyColumn.appendChild(img);
    });

    for (let i = 1; i <= peopleCount; i++) {
        const img = document.createElement('img');
        img.src = `images/${i}a.jpg`; 
        adultColumn.appendChild(img);
    }
    
    displayLeaderboard();
}

// 4. Drag & Drop
new Sortable(babyColumn, { animation: 150 });

// 5. Scoring
function checkScore() {
    const currentOrder = babyColumn.querySelectorAll('img');
    let score = 0;

    currentOrder.forEach((img, index) => {
        const correctId = index + 1;
        if (parseInt(img.dataset.id) === correctId) {
            score++;
            img.style.borderColor = "#2ecc71"; 
        } else {
            img.style.borderColor = "#e74c3c"; 
        }
    });

    document.getElementById('result').innerText = `You got ${score} out of ${peopleCount} correct!`;
    saveHighScore(score);
}

// 6. Save Score
function saveHighScore(currentScore) {
    const playerName = prompt("Enter your name for the Global Leaderboard:") || "Anonymous";

    const formData = new FormData();
    formData.append(nameEntryID, playerName);
    formData.append(scoreEntryID, currentScore);

    fetch(formURL, {
        method: "POST",
        mode: "no-cors", 
        body: formData
    }).then(() => {
        setTimeout(displayLeaderboard, 2000);
    }).catch(err => console.error("Error submitting:", err));
}

// 7. Display Leaderboard (With Proxy Fix)
async function displayLeaderboard() {
    console.log("Leaderboard: Starting fetch...");
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log("Leaderboard: Data received from Google");

        // Extract the JSON from Google's protective wrapper
        const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const jsonData = JSON.parse(jsonString);
        
        const rows = jsonData.table.rows;
        console.log("Leaderboard: Total rows found:", rows.length);

        let scores = rows.map(row => {
            return {
                // Adjusting indices: c[1] is Name, c[2] is Score
                name: row.c[1] ? row.c[1].v : "Anonymous",
                score: row.c[2] ? parseInt(row.c[2].v) : 0
            };
        }).filter(item => item.name && !isNaN(item.score));

        // Sort and slice top 5
        scores.sort((a, b) => b.score - a.score);
        const top5 = scores.slice(0, 5);

        const display = document.getElementById('high-score-display');
        if (display) {
            if (top5.length === 0) {
                display.innerHTML = "<div>No scores yet!</div>";
            } else {
                display.innerHTML = top5.map(s => 
                    `<div><strong>${s.name}</strong> <span>${s.score}/${peopleCount}</span></div>`
                ).join('');
                console.log("Leaderboard: Display updated successfully");
            }
        }
    } catch (error) {
        console.error("Leaderboard Error:", error);
    }
}loadGame();
