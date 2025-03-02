
let appList;
let totalScore = 0;
let pointset;

async function populate() {
    const requestURL =
        "/indexFiles/data/apps.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    appList = await response.json();

}

const getListOfClasses = (klassenLijst) =>{
    let lijst="";
    for(const klas of klassenLijst){
        lijst += `<li>${klas}</li>`
    }
    return lijst;
}

const fillScreen = () => {
    document.getElementById("tableBody").innerHTML = "";
    let tableContent = ""; 
    for  (const app of appList) {
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
    document.getElementById("tableBody").innerHTML += tableContent;
}


const init = async () => {
     await populate();
    fillScreen();
}


window.onload = init;