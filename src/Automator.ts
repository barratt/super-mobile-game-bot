// Bots can extend the automator which can give them superpowers 
// TODO: Refactor cognative to our own APIs.

import Axios from "axios";
import { BridgeInterface } from "./lib/Bridges/BridgeInterface";
import FormData from 'form-data'

import gm from "gm"; 
import collission from "./utils/collission-detection";
export class Automator {
    cognative;
    bridge : BridgeInterface;

    constructor(bridge) {
        this.bridge = bridge;

        this.cognative = Axios.create({
            baseURL: `https://${process.env.COGNATIVE_BASE}.cognitiveservices.azure.com`,
            params: {
                language: "en",
                detectOrientation: "true"
            },
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.COGNATIVE_KEY
            }
        });
    }

    async findTextInRegion(x1, y1, x2, y2): Promise<string> {
        // Take screenshot or get current screen;
        let screenshot = await this.bridge.takeScreenshot();

        // Use gm to reisize it down
        let compressed = await new Promise(function(resolve, reject) {
            gm(screenshot, 'before.png').quality(process.env.IMAGE_QUALITY || 50).toBuffer('png', function(err, buf) {
                if (err) return reject(err);
                return resolve(buf);
            });
        });

        let data = new FormData();
        data.append('file', compressed, "image.png");

        let ocr = await this.cognative.post(`vision/v2.0/ocr`, data, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });

        let wordsInRegion = [];
        for (let region of ocr.data.regions) {
            for (let line of region.lines) {
                for (let word of line.words) {
                    let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
                    let isWordInRegion = collission.contains({
                            x1, y1,
                            x2, y2,
                        }, {
                            x1: boundingBox[0],
                            y1: boundingBox[1],
                            x2: boundingBox[2],
                            y2: boundingBox[3],
                        }
                    );

                    if (isWordInRegion) {
                        wordsInRegion.push(word.text)
                    }
                }
            }
        }

        // We have a list of regions where we found text, lets see if one matches ours accurately
        return wordsInRegion.join(' ');
    }
}
