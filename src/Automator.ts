// Bots can extend the automator which can give them superpowers 
// TODO: Refactor cognative to our own APIs.

import Axios from "axios";
import { BridgeInterface } from "./lib/Bridges/BridgeInterface";
import FormData from 'form-data'

import gm from "gm"; 
import collission from "./utils/collission-detection";
import { Region } from "./Models/Region";
export class Automator {
    cognative;
    bridge : BridgeInterface;
    lastScreenshot;
    lastOcr;

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

    async takeScreenshot() {
        // Take screenshot or get current screen;
        let screenshot = await this.bridge.takeScreenshot();

        // Use gm to reisize it down
        let compressed = await new Promise(function(resolve, reject) {
            gm(screenshot, 'before.png').quality(process.env.IMAGE_QUALITY || 50).toBuffer('png', function(err, buf) {
                if (err) return reject(err);
                return resolve(buf);
            });
        });
        
        this.lastScreenshot = compressed;
        return compressed;
    }

    async runOcr() {
        let data = new FormData();
        data.append('file', this.lastScreenshot, "image.png");

        let ocr = await this.cognative.post(`vision/v2.0/ocr`, data, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });

        this.lastOcr = ocr.data;
        return this.lastOcr;
    }

    async findTextInRegion(region: { x1: number, y1: number, x2: number, y2: number}): Promise<string> {
        let wordsInRegion = [];
        for (let region of this.lastOcr.regions) {
            for (let line of region.lines) {
                for (let word of line.words) {
                    let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
                    let isWordInRegion = collission.contains(region, {
                        x1: boundingBox[0],
                        y1: boundingBox[1],
                        x2: parseInt(boundingBox[0])+parseInt(boundingBox[2]),
                        y2: parseInt(boundingBox[1])+parseInt(boundingBox[3]),
                    });

                    if (isWordInRegion) {
                        wordsInRegion.push(word.text)
                    }
                }
            }
        }

        // We have a list of regions where we found text, lets see if one matches ours accurately
        return wordsInRegion.join(' ');
    }

    async findRegionForText(text: string): Promise<Region> {
        for (let region of this.lastOcr.regions) {
            for (let line of region.lines) {
                for (let word of line.words) {
                    if (word.text != text) continue;

                    let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
                    return {
                        x1: boundingBox[0],
                        y1: boundingBox[1],
                        x2: parseInt(boundingBox[0])+parseInt(boundingBox[2]),
                        y2: parseInt(boundingBox[1])+parseInt(boundingBox[3]),
                    }
                }
            }
        }

        return null;
    }


    // TODO: Make a reverse of findTextInRegion, a findRegionForText where it returns region for a piece of text
}
