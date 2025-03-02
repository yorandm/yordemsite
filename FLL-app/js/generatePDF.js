const x = 15;
const pdf = () => {
    document.getElementById('generate-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true
        });

        doc.text("First Lego League",10,10);
        doc.text(`names: ${document.getElementById("names").value}`,10,20);
        let currentY = 30;

        const checkmark = ()=>{
            doc.setDrawColor("#013220")
            doc.lines([[1,1], [1,-3]], x,currentY-1, [1,1], 'S', false);
        }

        const checkLength = () =>{
            if(currentY >=280){
                doc.addPage();
                currentY=10;
            }
        }
        for (const challenge of missions) {
            
            doc.text(`MISSIE ${challenge.missionID} - ${challenge.missionTitle}:`, 10,currentY);
            doc.addImage(challenge.missionImg,"jpg",1,1,50,50);
            for (const point of challenge.missionPoints) {
                currentY +=10;
                checkLength();
                doc.text(`${point.description} ${point.points}`, 20, currentY, {maxWidth:180});
                
                if (point.type === "single" || point.type==="bonus") {
                   if(document.getElementById(`m${challenge.missionID}p${point.id}`).checked) checkmark();  

                } else if (point.type === "each"){
                    doc.text(`${document.getElementById(`numberM${challenge.missionID}p${point.id}`).value}`, x, currentY)
                }

                if(`${point.description} ${point.points}:`.length/56>1){
                    currentY +=5*`${point.description} ${point.points}:`.length/56;
                    checkLength();
                }
            }
        
            currentY +=10;
            checkLength();

        }
        doc.setFont("Helvetica","bold");
        doc.text(`De totale score is: ${document.getElementById("totalScore").innerText}`, x, currentY);
        // Save the PDF
        const fileName = document.getElementById("names").value.split(",").map((el)=>el.trim()).join("_");

        doc.save(fileName?`${fileName}.pdf`:`fll_score.pdf`);
    });
}


