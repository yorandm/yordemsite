let players;
let numberOfPlayers;
let currentPlayer;
let vragen;

let huidigeVraag;
let vraagIndex;
let timers;
let scores;
let uitgeschakeld;
let totalTime = 60; //in seconds
let updated = false;

async function populate() {
    const requestURL =
        "./vragen.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    vragen = await response.json();


}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getTimers = () => {
    let list = "";
    for (let index = 0; index < numberOfPlayers; index++) {
        list += `<li class="${index===currentPlayer?"active":"notActive"} ${uitgeschakeld[index]?"dead":"alive"}">Tijd van ${players[index]}: ${timers[index]}   ||| Score: ${scores[index]}</li>`
    }
    return list;
}

const endGameForEveryone = () => {
    document.getElementById("body").innerHTML = `<h1 id="einde"> Game over!</h1>`;
    sleep(500).then(() => {
        document.getElementById("body").innerHTML = `
        <div class="mainContainer">
        <div id="infoContainer">
            <div id="score"><ul>${getTimers()}</ul></div>
        </div>
        <button class="goButton" type="button" onclick="window.location.href='..'" id="reset">Nog een keer?</button>
        </div>
        `
    });
}

const endGameFor = (deadPlayer) => {
    uitgeschakeld[deadPlayer] = true;
    let count = 0;
    for (const player of uitgeschakeld) {
        if (!player) count++;
    }
    if (count === 1) {
        endGameForEveryone();
    }
    return count !== 1;

}

const startTimer = async() => {
    try {
        while (timers[currentPlayer] > -2) {
            await sleep(1000).then(() => {
                document.getElementById("timer").innerHTML = `<ul> ${getTimers()}</ul>Tijd resterend: ${timers[currentPlayer]}`;
            });
            if (!updated) {
                timers[currentPlayer]--;

            } else {
                updated = false;
            }
            if (timers[currentPlayer] <= 0) {
                endGameFor(currentPlayer) ? nextSequence() : endGameForEveryone();
            }
        }
        endGameForEveryone();
    } catch (e) {

    }
}

const nextQuestion = () => {
    vraagIndex = Math.floor(Math.random() * (vragen.length));
    huidigeVraag = vraagIndex;
}


const begin = () => {
    document.getElementById("title").innerText = players[currentPlayer];
    document.getElementById("vraagLabel").innerText = vragen[vraagIndex].vraag;
    document.getElementById("herleidEenheid").innerText = vragen[vraagIndex].eindeenheid;
}



const nextPlayer = () => {
    document.getElementById("body").style = "background-color:none";
    document.getElementById("antwoord").value = "";
    document.getElementById("antwoord").focus();
    currentPlayer = (currentPlayer + 1) % numberOfPlayers === 0 ? 0 : (currentPlayer + 1);
    updated = true;
    if (uitgeschakeld[currentPlayer]) {
        currentPlayer = (currentPlayer + 1) % numberOfPlayers === 0 ? 0 : (currentPlayer + 1);
    }

}

const nextSequence = () => {
    nextQuestion();
    nextPlayer();
    begin();
}

const checkAntw = (e) => {
    e.preventDefault();
    const userAnsw = document.getElementById("antwoord").value;
    if (userAnsw === vragen[huidigeVraag].antwoord) {
        document.getElementById("body").style = "background-color:green";
        //timers[currentPlayer] += 5;
        scores[currentPlayer]++;
    } else {
        document.getElementById("body").style = "background-color:red";
        //timers[currentPlayer] -= 5;
    }
    sleep(500).then(() => {
        nextSequence();
    });

}

const init = async() => {
    await populate();

    totalTime = sessionStorage.getItem("totalTimer") ? Number(sessionStorage.getItem("totalTimer")) : 60;
    numberOfPlayers = sessionStorage.getItem("numberOfPlayers") ? Number(sessionStorage.getItem("numberOfPlayers")) : 2;
    players = sessionStorage.getItem("playerName") ? JSON.parse(sessionStorage.getItem("playerName")) : [];

    timers = new Array(Number(numberOfPlayers)).fill(totalTime);
    scores = new Array(numberOfPlayers).fill(0);
    uitgeschakeld = new Array(numberOfPlayers).fill(false);

    currentPlayer = Math.floor(Math.random() * (numberOfPlayers));

    document.getElementById("formId").onsubmit = checkAntw;
    document.getElementById("antwoordknop").onclick = checkAntw;


    nextSequence();
    startTimer();
}


window.onload = init;