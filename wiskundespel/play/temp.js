let players;
let numberOfPlayers;
let currentPlayer;
let vragen;

let huidigeVraag;
let vraagIndex;
let timers;
let scores;
// let uitgeschakeld;


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
        list += `<li class=${index===currentPlayer?"active":"notActive"}>Tijd van ${players[index]}: ${timers[index]}   ||| Score: ${scores[index]}</li>`
    }
    return list;
}

// const endGameFor = (deadPlayer) => {
//     uitgeschakeld[deadPlayer] = true;
// }

const startTimer = async() => {
    while (timers[currentPlayer] > 0) {
        await sleep(1000).then(() => {
            document.getElementById("timer").innerHTML = `<ul> ${getTimers()}</ul>Tijd resterend: ${timers[currentPlayer]}`;
        });
        timers[currentPlayer]--;
        // if (timers[currentPlayer] <= 0) {
        // endGameFor(currentPlayer);
        // }
    }
}

const nextQuestion = () => {
    vraagIndex = Math.floor(Math.random() * (vragen.length));
    huidigeVraag = vraagIndex;
}


const begin = () => {
    document.getElementById("title").innerText = players[currentPlayer];
    document.getElementById("vraagLabel").innerText = vragen[vraagIndex].vraag;
}



const nextPlayer = () => {
    document.getElementById("body").style = "background-color:none";
    document.getElementById("antwoord").value = "";
    currentPlayer = (currentPlayer + 1) % numberOfPlayers === 0 ? 0 : (currentPlayer + 1);
    // console.log(currentPlayer, uitgeschakeld[currentPlayer]);
    // if (uitgeschakeld[currentPlayer]) {
    //     currentPlayer = (currentPlayer + 1) % numberOfPlayers === 0 ? 0 : (currentPlayer + 1);
    // }

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
        timers[currentPlayer] += 5;
        scores[currentPlayer]++;
    } else {
        document.getElementById("body").style = "background-color:red";
        timers[currentPlayer] -= 5;
    }
    sleep(500).then(() => {
        nextSequence();
    });

}

const init = async() => {
    await populate();


    numberOfPlayers = sessionStorage.getItem("numberOfPlayers") ? Number(sessionStorage.getItem("numberOfPlayers")) : 2;
    players = sessionStorage.getItem("playerName") ? JSON.parse(sessionStorage.getItem("playerName")) : [];
    console.log("dit zo", sessionStorage.getItem("playerName") ? "ja" : "nee");

    timers = new Array(Number(numberOfPlayers)).fill(60);
    scores = new Array(numberOfPlayers).fill(0);
    uitgeschakeld = new Array(numberOfPlayers).fill(false);


    console.log(currentPlayer);
    document.getElementById("formId").onsubmit = checkAntw;
    document.getElementById("antwoordknop").onclick = checkAntw;


    nextSequence();
    startTimer();
}


window.onload = init;