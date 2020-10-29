const collission = require('../dist/utils/collission-detection');

const playerScoreBox = {
    x1: 275,
    y1: 0,
    x2: 800,
    y2: 100,
}

const ocrResponse = require('./ocrresponse.json');

let wordsInRegion = [];

for (let region of ocrResponse.regions) {
    for (let line of region.lines) {
        for (let word of line.words) {
            let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
            // So azure rotates the image, and these X/Y's are from the rotated view.
            // Also our screenshot system x1,y1 is top left 
            // The four integers represent the x-coordinate of the left edge, the y-coordinate of the top edge, width, and height
            
            let isWordInRegion = collission.contains(playerScoreBox, {
                    x1: boundingBox[0],
                    y1: boundingBox[1],
                    x2: parseInt(boundingBox[0])+parseInt(boundingBox[2]),
                    y2: parseInt(boundingBox[1])+parseInt(boundingBox[3]),
                }
            );

            console.log(`Is in region: ${isWordInRegion} word: ${word.text}`);

            if (isWordInRegion) {
                wordsInRegion.push(word.text)
            }
        }
    }
}

console.log(`Found words in region ${wordsInRegion.join(' ')}`);
