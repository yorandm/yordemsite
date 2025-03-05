let numberOfPlayers = 2;
let players = [];

const updatePlayerNames = (event) => {
    console.log(event.target.name.split("speler")[1]);
    console.log(document.getElementById(event.target.name).value);
    players[event.target.name.split("speler")[1] - 1] = document.getElementById(event.target.name).value
    console.log(event);
    sessionStorage.setItem("playerName", JSON.stringify(players));
}

const updatePlayerNameInput = () => {
    let htmlForNameInput = ``;
    for (let i = 1; i <= numberOfPlayers; i++) {
        htmlForNameInput += `
            <label for="speler${i}">
                Naam speler ${i}:
                <input type="text" name="speler${i}" id="speler${i}" value="${players[i - 1] ? players[i - 1] : ""}"/>
            </label>
        `
    }
    document.getElementById("playerNames").innerHTML = htmlForNameInput
    for (let i = 1; i <= numberOfPlayers; i++) {
        document.getElementById(`speler${i}`).onchange = updatePlayerNames;
    }
}

const onNumberOfPlayersChange = () => {
    numberOfPlayers = document.getElementById("numberOfPlayers").value;
    sessionStorage.setItem("numberOfPlayers", numberOfPlayers);
    updatePlayerNameInput();

}

const reset = () => {
    numberOfPlayers = 2;
    sessionStorage.setItem("numberOfPlayers", numberOfPlayers);
    players = [];
    sessionStorage.setItem("playerName", JSON.stringify(players));
    document.getElementById("formId").innerHTML = `
        <label>
            Aantal spelers:
            <input type="number" placeholder="2" min="2" max="12" id="numberOfPlayers"/>
        </label>
        <div id="playerNames">

        </div>
        <button type="button" onclick="window.location.href='play'" target="_self">Begin!</button>
        <button type="button" id="resetId" target="_self">Reset!</button>
    `
    init();
}

const init = () => {
    document.getElementById("numberOfPlayers").onchange = onNumberOfPlayersChange;
    document.getElementById("resetId").onclick = reset;
    numberOfPlayers = sessionStorage.getItem("numberOfPlayers") ? sessionStorage.getItem("numberOfPlayers") : 2;
    players = sessionStorage.getItem("playerName") ? JSON.parse(sessionStorage.getItem("playerName")) : [];
    updatePlayerNameInput();

}


window.onload = init;