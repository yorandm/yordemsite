
let appList;
let totalScore = 0;
let pointset;

async function populate() {
    const requestURL =
        "/indexFiles/data/apps.json";
    const request = new Request(requestURL);

    try {
        const response = await fetch(request);

        if (!response.ok) {
            throw new Error(`HTTP-fout! Status: ${response.status}`)
        }

        appList = await response.json();
    } catch (error) {
        console.error("Fout bij ophalen van data:", error);
        document.getElementById("tableBody").innerHTML = `
        <tr>
            <td colspan="3" class="error">Er heeft zich een probleem voorgedaan bij het ophalen of renderen van de data. Probeer opnieuw. Indien het probleem zich blijft voordoen contacteer mij!</td>
        </tr>
        `
    }

}

const getListOfClasses = (klassenLijst) => {
    let lijst = "";
    for (const klas of klassenLijst) {
        lijst += `<li>${klas}</li>`
    }
    return lijst;
}

const fillScreen = () => {
    let tableContent = "";
    for (const app of appList) {
        tableContent += `
            <tr>
                <td><a href="${app.url}">${app.naam}</a></td>
                <td>${app.uitleg}</td>
                <td>
                    <ul>
                       ${getListOfClasses(app.voor)}
                    </ul>
                </td>
            </tr>
        `
    }
    document.getElementById("tableBody").innerHTML = tableContent;
}


const init = async () => {
    await populate();
    try {
        fillScreen();
    } catch (error) {
        console.error("Fout bij renderen van data:", error);
        document.getElementById("tableBody").innerHTML = `
    <tr>
        <td colspan="3" class="error">Er heeft zich een probleem voorgedaan bij het ophalen of renderen van de data. Probeer opnieuw. Indien het probleem zich blijft voordoen contacteer mij!</td>
    </tr>
    `
    }
}


window.onload = init;