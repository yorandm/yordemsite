let players;
let numberOfPlayers;
let currentPlayer;
let vragen;

let huidigeVraag;
let vraagIndex;


async function populate() {
    const requestURL =
        "/wiskundespel/play/vragen.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    vragen = await response.json();

}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const nextQuestion = () => {
    console.log(Math.round(Math.random() * (vragen.length - 1)));
    vraagIndex = Math.round(Math.random() * (vragen.length - 1));
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
        document.getElementById("body").style = "background-color:green"
    } else {
        document.getElementById("body").style = "background-color:red"
    }
    sleep(500).then(() => {
        nextSequence()
    });

}

const init = async() => {
    await populate();

    numberOfPlayers = sessionStorage.getItem("numberOfPlayers") ? sessionStorage.getItem("numberOfPlayers") : 2;
    players = sessionStorage.getItem("playerName") ? JSON.parse(sessionStorage.getItem("playerName")) : [];
    currentPlayer = Math.round(Math.random() * (numberOfPlayers - 1));
    console.log(currentPlayer);
    document.getElementById("formId").onsubmit = checkAntw;
    document.getElementById("antwoordknop").onclick = checkAntw;


    nextSequence();
}


window.onload = init;