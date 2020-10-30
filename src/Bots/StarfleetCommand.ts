import { BridgeInterface } from "../lib/Bridges/BridgeInterface";
import { BotInterface } from "./BotInterface";
import sleep from "await-sleep";
import { Automator } from "../Automator";

// TODO: Remove screen resolution dependency 
export class StarfleetCommandBot extends Automator implements BotInterface {
    iosSupported: false;
    androidSupported: true;

    androidPackageIdentifier = "com.scopely.startrek";
    androidMainActivity = "com.digprm.prime.NativeAndroidActivity";

    bridge: BridgeInterface;

    // Designed on a Pixel 2 XL
    locations = {
        TOP_LEFT_BACK: [ 100, 75 ],
        REFINERY: [ 850, 300 ],
        BOTTOM_CENTER_DONE: [ 1500, 1300 ],

        REFINERY_GRADE_2_CRYSTAL: [ 360, 1130 ],
        REFINERY_GRADE_2_GAS: [ 1100, 1130 ],
        REFINERY_GRADE_2_ORE: [ 1800, 1130 ],
        REFINERY_MATERIALS_1CHEST: [ 1200, 1300 ],

        ALLIANCE_HELP: [ 2500, 500 ],
        ALLIANCE_HELP_ALL: [ 1500, 1350 ],
    }

    regions = {
        PLAYER_SCORE_BOUNDING_BOX: { x1: 300, y1: 20, x2: 700, y2: 100 },
        REFINERY_NOTIFICATION_BOUNDING_BOX: { x1: 700, y1: 230, x2: 760, y2: 290 },
        REFINERY_LABEL_BOUNDING_BOX: { x1: 770, y1: 365, x2: 950, y2: 420 },
        ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX: { x1: 2560, y1: 395, x2: 2615, y2: 550 },
    }

    colourPoints = {
        ALLIANCE_HELP: [ { x: 2492, y: 448, r: 110, g: 95, b: 184, tolerance: 10 } ]
    }

    scenes = {
        MAIN_VIEW: "main",
        GIFTS_VIEW: "gifts",
    }

    designedFor = { width: 2880, height: 1440 };

    constructor(bridge: BridgeInterface) {
        super(bridge); // ?? This seems wrong 
        this.bridge = bridge;
    }

    async start() {
        console.log("StarFleet command bot start action");

        console.log("Initializing bot")
        await this.init();
        console.log("Bot ready");

        // Lets see whats happening.
        await this.takeScreenshot("main");
        // this.lastScreenshot = require('fs').readFileSync('../research/android_scripts/screen2.png');
  
        // Run the OCR on the last screenshot 
        await this.runOcr("main");
        // this.lastOcr = require('../research/ocrresponse.json');
        
        const maxAttempts = 5;

        let checkOnScreen = maxAttempts;
        while (checkOnScreen > 0) {
            let isOnHomescreen = await this.isOnGameHomeScreen();
            if (isOnHomescreen)
                break;

            // We're not. Lets wait.
            checkOnScreen--;
            console.log(`Home screen not detected, waiting (Attempt ${maxAttempts-checkOnScreen}/${maxAttempts})`)
            await sleep(2000);
        }

        if (checkOnScreen == 0) {
            throw new Error("Unable to start starfleet bot. Homescreen not detected");
        }

        await this.claimGifts();
        await this.startRefinery();
        await this.helpAlliance();
        await this.getPlayerScore();

        return true;
    }

    stop() {
        console.log("StarFleet command bot stopping!");
        // Somehow stop the start method?
        console.log("StarFleet command unable to stop!");
        return false;
    }

    async getPlayerScore() : Promise<number> {
        console.log("Getting score");
        let scoreString = await this.findTextInRegion(this.regions.PLAYER_SCORE_BOUNDING_BOX, this.scenes.MAIN_VIEW);
        let score = parseInt(scoreString.replace(/,/gmi, '').trim());

        if (isNaN(score)) {
            return null;
        }
    
        console.log(`Found score: ${score}`);
        return score;
    }

    async isOnGameHomeScreen() {
        console.log("Checking if bot is on home screen");
        let score = await this.getPlayerScore();
        if (score != null && score > 0) {
            return true;
        } else {
            return false;
        }
    }

    async helpAlliance() {
        console.log("Checking for alliance help");

        let matched = await this.checkRGBColoursForPoints(this.colourPoints.ALLIANCE_HELP, this.scenes.MAIN_VIEW);

        if (matched.length < this.colourPoints.ALLIANCE_HELP.length) {
            // No refinery today.
            console.log("Alliance doesn't need help!");
            return;
        } else {
            console.log("Alliance needs help!")
        }

        await this.tapLocation(this.locations.ALLIANCE_HELP);
        await sleep(2000);
        await this.tapLocation(this.locations.ALLIANCE_HELP_ALL);
        // console.log(`Helped ${notification} people!`);
    }

    async startRefinery() {
        const { locations } = this;
        // TODO: Make this smarter, find where the refinery buttons are instead.

        // Check if refinery is unlocked
        let refineryUnlocked = await this.findRegionForText("Refinery", this.scenes.MAIN_VIEW)

        if (!refineryUnlocked) {
            console.log("Refinery not unlocked, or I couldn't see it");
            return;
        }

        // Check if refinery is good to go.
        let notification = await this.findTextInRegion(this.regions.REFINERY_NOTIFICATION_BOUNDING_BOX, this.scenes.MAIN_VIEW);
        if (notification.length == 0) {
            // No refinery today.
            console.log("Refinery already done!");
            return;
        }

        console.log("Opening refinery");
        await this.tapLocation(locations.REFINERY);
        await sleep(2000);
        console.log("Obtaining 1 chest crystal");
        await this.tapLocation(locations.REFINERY_GRADE_2_CRYSTAL); // Crystal 
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Obtaining 1 chest gas");
        await this.tapLocation(locations.REFINERY_GRADE_2_GAS); // Gas
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Obtaining 1 chest ore");
        await this.tapLocation(locations.REFINERY_GRADE_2_ORE); // Ore
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Done, exiting refinery");
        await this.tapLocation(locations.TOP_LEFT_BACK);

        console.log("We're all done collecting chest rewards");
    }

    async claimGifts() {
        console.log("claiming gifts");
        let box = await this.findRegionForText("CLAIM");

        if (!box) {
            console.log("Nothing to claim!");
            return;
        }

        await this.tapLocation([ (box.x1+box.x2)/2, (box.y1+box.y2)/2 ]);
        // Wait until we can see it? That takes screenshot service which costs!
        await sleep(2000);
        
        await this.swipe(1850, 620, 1100, 620, 250); // The current qame has 2 promo packs

        await sleep(2000);
        console.log("Taking screenshot of gifts screen");

        // TODO: Take screenshot click claim?
        await this.takeScreenshot(this.scenes.GIFTS_VIEW);
        await this.runOcr(this.scenes.GIFTS_VIEW);

        const chests = {
            "MIN10": { x1: 600, y1: 1080, x2: 900, y2: 1165 }, // Green claim button or available in
            "HOUR4": { x1: 1030, y1: 1080, x2: 1500, y2: 1165 },
            "HOUR24": { x1: 1700, y1: 1080, x2: 2200, y2: 1165 },
        }

        let min10Text= await this.findTextInRegion(chests.MIN10, this.scenes.GIFTS_VIEW);

        if (min10Text == "CLAIM") {
            console.log("Claiming 10 minute chest");
            await this.tapLocation([ (chests.MIN10.x1 + chests.MIN10.x2) / 2, (chests.MIN10.y1 + chests.MIN10.y2) / 2 ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);
            await sleep(2000);
        } else {
            console.log("10 min chest not available");
        }

        // This returns us back to the gifts screen, lets swipe and check for 4h
        let hour4Text = await this.findTextInRegion(chests.HOUR4, this.scenes.GIFTS_VIEW);
        if (hour4Text == "CLAIM") {
            console.log("Claiming 4 hour chest");
            await this.tapLocation([ (chests.HOUR4.x1 + chests.HOUR4.x2) / 2, (chests.HOUR4.y1 + chests.HOUR4.y2) / 2 ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);
            await sleep(2000);
        } else {
            console.log("4h chest not available");
        }

        let hour24Text = await this.findTextInRegion(chests.HOUR24, this.scenes.GIFTS_VIEW);
        if (hour24Text == "CLAIM") {
            console.log("Claiming 24 hour chest");
            await this.tapLocation([ (chests.HOUR24.x1 + chests.HOUR24.x2) / 2, (chests.HOUR24.y1 + chests.HOUR24.y2) / 2 ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);
            await sleep(2000);
        } else {
            console.log("24h chest not available");
        }

        await this.tapLocation(this.locations.TOP_LEFT_BACK);
        console.log("Done collecting gifts"); 

        // Now we can select claim on the others?

    }
}