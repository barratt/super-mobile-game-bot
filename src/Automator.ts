// Bots can extend the automator which can give them superpowers 
// TODO: Refactor cognative to our own APIs.

// const averageColour = require('image-average-color');
var getPixels       = require("get-pixels");
 
import Axios from "axios";
import { BridgeInterface } from "./lib/Bridges/BridgeInterface";
import FormData from 'form-data'

import gm from "gm"; 
import collission from "./utils/collission-detection";
import { Region } from "./Models/Region";
import { ColourPoint } from "./Models/ColourPoint";
import { DeviceScreen } from "./Models/DeviceScreen";
export class Automator {
    cognative;
    bridge : BridgeInterface;
    screenshots = {}    // scene->shot
    ocr = {}            // scene->ocr
    lastScreenshot; 
    lastOcr;

    designedFor: DeviceScreen;
    currentScreenSize: DeviceScreen;
    xScale: number;
    yScale: number;

    screenWakeTimer;

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
    async init() {
        // Maybe this changes based on orientation?
        this.currentScreenSize = await this.bridge.screenResolution();

        this.yScale = this.currentScreenSize.height / this.designedFor.height;
        this.xScale = this.currentScreenSize.width / this.designedFor.width;
    }

    async swipe(xStart, yStart, xStop, yStop, durationMs): Promise<boolean> {
        const { xScale, yScale } = this;
        // TODO: Add randomness?

        return await this.bridge.swipe(
            Math.floor(xStart * xScale), 
            Math.floor(yStart * yScale),
            Math.floor(xStop * xScale),
            Math.floor(yStop*xScale),
            durationMs
        )
    }

    async tapLocation(location) {
        // TODO: Add randomness?
        return await this.bridge.tap(
            Math.floor(location[0] * this.xScale), 
            Math.floor(location[1] * this.yScale)
        )
    }

    async takeScreenshot(scene) {
        // Take screenshot or get current screen;
        console.log(`Taking screenshot of ${scene}`);
        let screenshot = await this.bridge.takeScreenshot();

        // Use gm to reisize it down
        let compressed = await new Promise(function(resolve, reject) {
            gm(screenshot, 'before.jpg').quality(process.env.IMAGE_QUALITY || 100).toBuffer('jpg', function(err, buf) {
                if (err) return reject(err);
                return resolve(buf);
            });
        });
        console.log("Compressed screenshot");
        
        this.screenshots["last"] = compressed;
        this.screenshots[scene] = compressed;

        require('fs').writeFileSync('lastscreenshot.jpg', compressed);
        return compressed;
    }

    async runOcr(scene) {
        console.log("Sending last screenshot to Azure");
        let data = new FormData();
        data.append('file', this.screenshots[scene], "image.jpg");

        let ocr = await this.cognative.post(`vision/v2.0/ocr`, data, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });

        console.log("Got result");
        this.ocr["last"] = ocr.data;
        this.ocr[scene] = ocr.data;
        require('fs').writeFileSync('lastocr.json', JSON.stringify(ocr.data));
        return ocr.data;
    }

    async findTextInRegion(needleRegion: { x1: number, y1: number, x2: number, y2: number}, scene = "last"): Promise<string> {
        let wordsInRegion = [];
        for (let region of this.ocr[scene].regions) {
            for (let line of region.lines) {
                for (let word of line.words) {
                    let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
                    let isWordInRegion = collission.contains(needleRegion, {
                        x1: parseInt(boundingBox[0]),
                        y1: parseInt(boundingBox[1]),
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

    async findRegionForText(text: string, scene = "last"): Promise<Region> {
        for (let region of this.ocr[scene].regions) {
            for (let line of region.lines) {
                for (let word of line.words) {
                    if (word.text != text) continue;

                    let boundingBox = word.boundingBox.split(','); // x1,y1,x2,y2
                    return {
                        x1: parseInt(boundingBox[0]),
                        y1: parseInt(boundingBox[1]),
                        x2: parseInt(boundingBox[0])+parseInt(boundingBox[2]),
                        y2: parseInt(boundingBox[1])+parseInt(boundingBox[3]),
                    }
                }
            }
        }

        return null;
    }

    // Returns array of matched
    async checkRGBColoursForPoints(points: Array<ColourPoint>, scene = "last"): Promise<Array<ColourPoint>> {
        const self = this;

        let pixels = await new Promise(function(resolve, reject) { 
            getPixels(self.screenshots[scene], 'image/jpg', function(err, pixels) {
                if (err) return reject(err);

                return resolve(pixels);
            });
        });

        let matchedPixels = [];

        for (let point of points) {
            
            let pixelR = (pixels as any).get(point.x, point.y, 0);
            let pixelG = (pixels as any).get(point.x, point.y, 1);
            let pixelB = (pixels as any).get(point.x, point.y, 2);
            let pixelA = (pixels as any).get(point.x, point.y, 3);

            let rDrift = Math.abs(pixelR - point.r);
            let gDrift = Math.abs(pixelG - point.g);
            let bDrift = Math.abs(pixelB - point.b);
            
            let rInTolerance = rDrift < (point.tolerance || 0);
            let gInTolerance = gDrift < (point.tolerance || 0);
            let bInTolerance = bDrift < (point.tolerance || 0);

            console.log(`Got pixel data (ACTUAL/EXPECTED/TOLERANCE/DRIFT): R: ${pixelR}/${point.r}/${point.tolerance}/${rDrift}  G: ${pixelG}/${point.g}/${point.tolerance}/${gDrift} B: ${pixelB}/${point.b}/${point.tolerance}/${bDrift} `);

            if (rInTolerance && bInTolerance && gInTolerance) {
                matchedPixels.push(point);
            }
        }

        return matchedPixels;
    }

    async keepScreenAwake() {
        if (this.screenWakeTimer) return;

        this.screenWakeTimer = setInterval((bridge) => {
            bridge.wakeScreen();
        }, 3000, this.bridge);
    }

    async stopKeepingScreenAwake() {
        if (!this.screenWakeTimer) return;

        clearInterval(this.screenWakeTimer);
        this.screenWakeTimer = null;
    }
}
