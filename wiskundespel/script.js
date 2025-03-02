let numberOfPlayers = 2;
let players = [];

const updatePlayerNames = (event) =>{
    console.log(event.target.name.split("speler")[1]);
    console.log(document.getElementById(event.target.name).value);
    players[event.target.name.split("speler")[1]-1] = document.getElementById(event.target.name).value
    console.log(event);
    sessionStorage.setItem("playerName", JSON.stringify(players));
}

const updatePlayerNameInput = () =>{
    let htmlForNameInput = ``;
    for(let i = 1; i <= numberOfPlayers; i++){
        htmlForNameInput += `
            <label for="speler${i}">
                Naam speler ${i}:
                <input type="text" name="speler${i}" id="speler${i}" value="${players[i-1]?players[i-1]:""}"/>
            </label>
        `
    }
    document.getElementById("playerNames").innerHTML = htmlForNameInput
    for(let i = 1; i<= numberOfPlayers; i++){
        document.getElementById(`speler${i}`).onchange = updatePlayerNames;
    }
}

const onNumberOfPlayersChange = () =>{
    numberOfPlayers = document.getElementById("numberOfPlayers").value;
    sessionStorage.setItem("numberOfPlayers",numberOfPlayers);
    updatePlayerNameInput();

}

const init = () => {
    document.getElementById("numberOfPlayers").onchange = onNumberOfPlayersChange;
    numberOfPlayers = sessionStorage.getItem("numberOfPlayers")?sessionStorage.getItem("numberOfPlayers"):2;
    players = sessionStorage.getItem("playerName")?JSON.parse(sessionStorage.getItem("playerName")):[];
    updatePlayerNameInput();

}


window.onload = init;