let eersteTerm = 10;
let tweedeTerm = 10;
let timer = true;
let timerAmount = 60; //in seconden
let currentEersteTerm;
let currentTweedeTerm;
let correctCount = 0;
let counter = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const check = (e) => {
    e.preventDefault();
    counter++;
    const userAnsw = Number(document.getElementById("antwoord").value);
    if (userAnsw === currentEersteTerm * currentTweedeTerm) {
        document.getElementById("body").style = "background-color:green"
        correctCount++;
    }
    else {
        document.getElementById("body").style = "background-color:red"
    }
    sleep(500).then(() => {
        document.getElementById("body").style = "background-color:white";
        nextQuestion()
    });
}

const nextQuestion = () => {
    document.getElementById("totalCounter").innerHTML = `Totaal antwoorden: ${counter}`;
    document.getElementById("score").innerHTML = `Totaal Juist: ${correctCount}`;
    document.getElementById("antwoord").value = "";
    currentEersteTerm = Math.floor(Math.random() * (eersteTerm + 1));
    currentTweedeTerm = Math.floor(Math.random() * (tweedeTerm + 1));
    document.getElementById("vraagLabel").innerHTML = `${currentEersteTerm} x ${currentTweedeTerm} =`
}

const reset = () => {
    document.getElementById("body").innerHTML = `
  <div id="infoContainer">
        <div id="timer"></div>
        <div id="score"></div>
        <div id="totalCounter"></div>
    </div>
    <form id="formId">
        <label for="eersteTerm" id="eersteTermLabel">Eerste term maximum:</label>
            <input type="number" id="eersteTerm" value="10"/>
        <label for="tweedeTerm" id="tweedeTermLabel">Tweede term maximum:</label>
            <input type="number" id="tweedeTerm" value="10"/>
        <label for="timerCheck" id="timerCheckLabel">Timer aanzetten?</label>
            <input type="checkbox" id="timerCheck" checked/>
        <label for="timerAmount" id="timerAmountLabel">Tijd van timer in seconden:</label>   
            <input type="number" id="timerAmount" value="60"/>
        <button type="button" id="startKnop">Antwoord!</button>
    </form>
 `
    eersteTerm = 0;
    tweedeTerm = 10;
    currentEersteTerm = 0;
    currentTweedeTerm = 0;
    correctCount = 0;
    counter = 0;
    timerAmount = 60;

    init();
}

const endGame = () => {
    document.getElementById("formId").onsubmit = "";
    document.getElementById("antwoordknop").onclick = "";
    document.getElementById("body").innerHTML = `<h1 id="einde"> Tijd is op!</h1>`;
    sleep(500).then(() => {
        document.getElementById("body").innerHTML = `
        <div id="infoContainer">
            <div id="score">Totaal Juist: ${correctCount}</div>
            <div id="totalCounter">Totaal beantwoord: ${counter}</div>
            <div id="percentage">Percentage juist: ${((correctCount / counter) * 100).toFixed(2)}%</div>
        </div>
        <button type="button" id="reset">Nog een keer?</button>
        `
        document.getElementById("reset").onclick = reset;
    });


}

const startTimer = async () => {
    while (timerAmount > 0) {
        await sleep(1000).then(() => {
            document.getElementById("timer").innerHTML = `Tijd resterend: ${timerAmount - 1}`;
        });
        timerAmount--;
    }
    endGame();
}

const setUpPlayField = async () => {
    document.getElementById("totalCounter").innerHTML = `Totaal antwoorden: ${counter}`;
    document.getElementById("score").innerHTML = `Totaal Juist: ${correctCount}`;
    if (timer) document.getElementById("timer").innerHTML = `Totaal aantal seconden over: ${timerAmount}`;
    document.getElementById("formId").innerHTML = `
        <label for="antwoord" id="vraagLabel"> x  = </label>
        <input id="antwoord" type="number" autocomplete="off"/>
        <button type="submit" id="antwoordknop">Antwoord!</button>
    `
    document.getElementById("formId").onsubmit = check;
    document.getElementById("antwoordknop").onclick = check;
    if (timer) startTimer();
    nextQuestion();

}



const verzamelGegevens = (e) => {
    e.preventDefault();
    eersteTerm = Number(document.getElementById("eersteTerm").value);
    tweedeTerm = Number(document.getElementById("tweedeTerm").value);
    timer = document.getElementById("timerCheck").checked;
    timerAmount = Number(document.getElementById('timerAmount').value);
    setUpPlayField();

    console.log(eersteTerm, tweedeTerm, timer, timerAmount);



}

const init = async () => {
    document.getElementById("formId").onsubmit = verzamelGegevens;
    document.getElementById("startKnop").onclick = verzamelGegevens;
}


window.onload = init;