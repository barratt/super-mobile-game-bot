import { BridgeInterface } from "../../lib/Bridges/BridgeInterface";
import { BotInterface } from "../BotInterface";
import sleep from "await-sleep";
import { Automator } from "../../Automator";

import resolutions from "./resolutions";

// TODO: Remove screen resolution dependency 
export class StarFleetCommandBot extends Automator implements BotInterface {
    iosSupported: false;
    androidSupported: true;

    androidPackageIdentifier = "com.scopely.startrek";
    androidMainActivity = "com.digprm.prime.NativeAndroidActivity";

    bridge: BridgeInterface;

    // Sadly the scaling doesn't work too well on this game :(
    // Designed on a Pixel 2 XL
    locations: any;
    regions: any;
    colourPoints: any;

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
        // Should we initialize with scaling?
        let deviceSize = await this.bridge.screenResolution();
        let resolution = `${deviceSize.width}x${deviceSize.height}`;

        this.locations      = resolutions[resolution].locations;
        this.regions        = resolutions[resolution].regions;
        this.colourPoints   = resolutions[resolution].colourPoints;
        this.scenes         = resolutions[resolution].scenes;

        // TODO Scale based on a different aspect ratio?
        // If we support this resolution then use specific co-ordinates, otherwise use scaling.
        if (resolutions[resolution]) {
            console.log("Screen resolution supported, happy botting!");
            await this.init(false);

        } else {
            console.log("WARNING: This bot has not been optimized for your device resolution! Trying to use scaling.");
            await this.init(true);
        }

        console.log("Bot ready");

        this.keepScreenAwake();
        
        console.log("Finding main screen"); 
        await sleep(5000); // It at least takes 4 seconds for it to begin loading.

        const maxAttempts = 5;
        let checkOnScreen = maxAttempts;
        while (checkOnScreen > 0) {
            // Lets see whats happening.
            await this.takeScreenshot("main");
            // this.lastScreenshot = require('fs').readFileSync('../research/android_scripts/screen2.png');

            await this.skipIntroPromo(); // We try to skip an intro promo if we can see it 
    
            // Run the OCR on the last screenshot 
            await this.runOcr("main");
            // this.lastOcr = require('../research/ocrresponse.json');

            let isOnHomeScreen = await this.isOnGameHomeScreen();
            if (isOnHomeScreen)
                break;

            // We're not. Lets wait.
            checkOnScreen--;
            console.log(`Home screen not detected, waiting (Attempt ${maxAttempts-checkOnScreen}/${maxAttempts})`)
            await sleep(5000);
            // isOn
        }

        if (checkOnScreen == 0) {
            throw new Error("Unable to start StarFleet bot. Home-screen not detected");
        }

        console.log("Found home screen, now doing the actual botting");

        await this.claimGifts();
        await this.startRefinery();
        await this.helpAlliance();
        await this.redeemActiveMission();
        await this.getPlayerScore();

        this.stopKeepingScreenAwake();
        
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
        
        // TODO: Refactor this to be slower for lower speed devices
        await this.swipe(1850, 620, 1100, 620, 250); // The current qame has 2 promo packs

        await sleep(2000);
        console.log("Taking screenshot of gifts screen");

        // TODO: Take screenshot click claim?
        await this.takeScreenshot(this.scenes.GIFTS_VIEW);
        await this.runOcr(this.scenes.GIFTS_VIEW);

        let min10Text = await this.findTextInRegion(this.regions.chests.MIN10, this.scenes.GIFTS_VIEW);

        if (min10Text == "CLAIM") {
            console.log("Claiming 10 minute chest");
            await this.tapLocation([ (this.regions.chests.MIN10.x1 + this.regions.chests.MIN10.x2) / 2, (this.regions.chests.MIN10.y1 + this.regions.chests.MIN10.y2) / 2 ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);
            await sleep(2000);
        } else {
            console.log("10 min chest not available");
        }

        // This returns us back to the gifts screen, lets swipe and check for 4h
        let hour4Text = await this.findTextInRegion(this.regions.chests.HOUR4, this.scenes.GIFTS_VIEW);
        if (hour4Text == "CLAIM") {
            console.log("Claiming 4 hour chest");
            await this.tapLocation([ (this.regions.chests.HOUR4.x1 + this.regions.chests.HOUR4.x2) / 2, (this.regions.chests.HOUR4.y1 + this.regions.chests.HOUR4.y2) / 2 ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);
            await sleep(2000);
        } else {
            console.log("4h chest not available");
        }

        let hour24Text = await this.findTextInRegion(this.regions.chests.HOUR24, this.scenes.GIFTS_VIEW);
        if (hour24Text == "CLAIM") {
            console.log("Claiming 24 hour chest");
            await this.tapLocation([ (this.regions.chests.HOUR24.x1 + this.regions.chests.HOUR24.x2) / 2, (this.regions.chests.HOUR24.y1 + this.regions.chests.HOUR24.y2) / 2 ]);
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

    async redeemActiveMission() {
        let matched = await this.checkRGBColoursForPoints(this.colourPoints.MISSION_READY, this.scenes.MAIN_VIEW);

        if (matched.length < this.colourPoints.MISSION_READY.length) {
            console.log("Mission not ready!");
            return;
        }

        console.log("Accepting mission ready");
        await this.tapLocation(this.locations.MISSION_SHORTCUT);
        await sleep(1000);
        console.log("Accepted mission");
    }

    async collectGenerators() {
        await this.tapLocation(this.locations.INTERIOR_BUTTON);
        await sleep(5000);
        // TODO: Collect parasteel
        // TODO: Collect tritanium
        // TODO: Collect dilithium
    }

    async collectAllianceRewards() {
        // TODO:
    }

    async skipIntroPromo() {
        let matched = await this.checkRGBColoursForPoints(this.colourPoints.INTRO_PROMO_CLOSE, this.scenes.MAIN_VIEW);

        if (matched.length < this.colourPoints.MISSION_READY.length) {
            console.log("No promo!");
            return;
        }
        
        console.log("Closing promo window");

        await this.tapLocation(this.locations.INTRO_PROMO_CLOSE);
        await sleep(1000);

    }
}