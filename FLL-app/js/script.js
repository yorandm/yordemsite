
let missions;
let totalScore = 0;
let pointset;

async function populate() {
    const requestURL =
        "./data/missions.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    missions = await response.json();

}

const getMisionPoints = (missionID, missionPoints) => {
    let htmlForMissionPoints = "";
    for (const point of missionPoints) {
        if (point.type === "single" || point.type === "bonus") {
            htmlForMissionPoints += `
                    <label for="m${missionID}p${point.id}" class="opdracht">${point.description} ${pointset==="VTI"?point.points*point.factor:point.points} </label><div class="buttondiv"><input type="checkbox" id="m${missionID}p${point.id}" class="checkbox"/></div>
                    `
        } else if (point.type === "each") {
            htmlForMissionPoints += `
                    <label for="m${missionID}p${point.id}" class="opdracht">${point.description} ${pointset==="VTI"?point.points*point.factor:point.points} elk </label>
                    <div class="numberdiv">
                        <button class="minusButton" id="minusButtonM${missionID}p${point.id}" type="button">-</button>
                        <input class="numberInput" id="numberM${missionID}p${point.id}" type="number" max=${point.amount} min=0 value=${0} disabled placeholder={0}/>
                        <button class="plusButton" id="plusButtonM${missionID}p${point.id}" type="button">+</button>
                    </div>
            `
        }
    }
    return htmlForMissionPoints;
}

const insertOnChangeFunctionality = () => {
    for (const challenge of missions) {
        for (const point of challenge.missionPoints) {
            if (point.type === "single" || point.type==="bonus") {
                document.getElementById(`m${challenge.missionID}p${point.id}`).onchange = (e) => {
                    if (e.currentTarget.checked === true) {
                        totalScore += pointset==="VTI"?point.points*point.factor:point.points;
                    }
                    else {
                        totalScore -= pointset==="VTI"?point.points*point.factor:point.points
                    }
                    updateScore();

                }
            } else if (point.type === "each"){
                const numberInput = document.getElementById(`numberM${challenge.missionID}p${point.id}`);
                document.getElementById(`minusButtonM${challenge.missionID}p${point.id}`).onclick = ()=>{
                    if(Number(numberInput.value)-1 >= 0){
                        numberInput.value = Number(numberInput.value) - 1;
                        totalScore -= pointset==="VTI"?point.points*point.factor:point.points;
                    }
                    updateScore();
                }

                document.getElementById(`plusButtonM${challenge.missionID}p${point.id}`).onclick = ()=>{
                    if(Number(numberInput.value)+1<= point.amount){
                        numberInput.value = Number(numberInput.value) + 1;
                        totalScore += pointset==="VTI"?point.points*point.factor:point.points;
                    }
                    updateScore();
                }
            }
        }
    }
}

const fillScreen = () => {
    document.getElementById("challengeBody").innerHTML = "";
    for (const challenge of missions) {
        document.getElementById("challengeBody").innerHTML += `
        <section class="challenge">
            <img src="./img/${challenge.missionImg}" class="missionImg"/>
            <h2 class="missionTitle">MISSIE ${challenge.missionID} - ${challenge.missionTitle}</h2>
            <section class="opdrachten">
                ${getMisionPoints(challenge.missionID, challenge.missionPoints)} 
            </section>
        </section>`
    }

    insertOnChangeFunctionality();
}

const updateScore = () => {
    document.getElementById("totalScore").innerHTML = totalScore;
}

const getOption = () =>{
    pointset = document.getElementById("selectionPointset").value;
}

const clear = () =>{
        getOption();
        totalScore = 0;
        fillScreen();
        updateScore();
        document.getElementById("names").value="";
}

const setOnChangeForOption = () =>{
    document.getElementById("selectionPointset").onchange = () =>{
        clear();
    }
    document.getElementById("clearButton").onclick = () =>{
        clear();
    }
}


const init = async () => {
    await populate();
    getOption();
    setOnChangeForOption();
    fillScreen();
    updateScore();
    pdf();

}


window.onload = init;