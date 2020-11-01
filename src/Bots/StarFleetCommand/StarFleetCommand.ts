import { BridgeInterface } from "../../lib/Bridges/BridgeInterface";
import { BotInterface } from "../BotInterface";
import sleep from "await-sleep";
import { Automator } from "../../Automator";

import resolutions from "./resolutions";

import logger from "../../lib/winston";

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
        logger.info("StarFleet command bot start action");

        logger.info("Initializing bot")
        // Should we initialize with scaling?
        let deviceSize = await this.bridge.screenResolution();
        let resolution = `${deviceSize.width}x${deviceSize.height}`;

        this.locations      = resolutions[resolution].locations;
        this.regions        = resolutions[resolution].regions;
        this.colourPoints   = resolutions[resolution].colourPoints;

        // TODO Scale based on a different aspect ratio?
        // If we support this resolution then use specific co-ordinates, otherwise use scaling.
        if (resolutions[resolution]) {
            logger.info("Screen resolution supported, happy botting!");
            await this.init(false);

        } else {
            logger.info("WARNING: This bot has not been optimized for your device resolution! Trying to use scaling.");
            await this.init(true);
        }

        logger.info("Bot ready");

        this.keepScreenAwake();
        
        logger.info("Finding main screen"); 
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
            logger.info(`Home screen not detected, waiting (Attempt ${maxAttempts-checkOnScreen}/${maxAttempts})`)
            await sleep(5000);
            // isOn
        }

        if (checkOnScreen == 0) {
            throw new Error("Unable to start StarFleet bot. Home-screen not detected");
        }

        logger.info("Found home screen, now doing the actual botting");

        await this.claimGifts();
        await this.startRefinery();
        await this.helpAlliance();
        await this.redeemCollectables();
        await this.getPlayerScore();

        this.stopKeepingScreenAwake();
        
        return true;
    }

    stop() {
        logger.info("StarFleet command bot stopping!");
        // Somehow stop the start method?
        logger.info("StarFleet command unable to stop!");
        return false;
    }

    async getPlayerScore() : Promise<number> {
        logger.info("Getting score");
        let scoreString = await this.findTextInRegion(this.regions.PLAYER_SCORE_BOUNDING_BOX, this.scenes.MAIN_VIEW);
        let score = parseInt(scoreString.replace(/,/gmi, '').trim());

        if (isNaN(score)) {
            return null;
        }
    
        logger.info(`Found score: ${score}`);
        return score;
    }

    async isOnGameHomeScreen() {
        logger.info("Checking if bot is on home screen");
        let score = await this.getPlayerScore();
        if (score != null && score > 0) {
            return true;
        } else {
            return false;
        }
    }

    async helpAlliance() {
        logger.info("Checking for alliance help");

        let matched = await this.checkRGBColoursForPoints(this.colourPoints.ALLIANCE_HELP, this.scenes.MAIN_VIEW);

        if (matched.length < this.colourPoints.ALLIANCE_HELP.length) {
            logger.debug("Alliance doesn't need help!");
            return;
        } 

        logger.info("Alliance needs help!");

        await this.tapLocation(this.locations.ALLIANCE_HELP);
        await sleep(2000);
        await this.tapLocation(this.locations.ALLIANCE_HELP_ALL);
    }

    async startRefinery() {
        const { locations } = this;
        // TODO: Make this smarter, find where the refinery buttons are instead.

        // Check if refinery is unlocked
        let refineryUnlocked = await this.findRegionForText("Refinery", this.scenes.MAIN_VIEW)

        if (!refineryUnlocked) {
            logger.info("Refinery not unlocked, or I couldn't see it");
            return;
        }

        let matched = await this.checkRGBColoursForPoints(this.colourPoints.REFINERY_READY, this.scenes.MAIN_VIEW);

        if (matched.length < this.colourPoints.REFINERY_READY.length) {
            logger.debug("Alliance doesn't need help!");
            return;
        }

        logger.info("Opening refinery");
        await this.tapLocation(locations.REFINERY);
        await sleep(2000);
        logger.info("Obtaining 1 chest crystal");
        await this.tapLocation(locations.REFINERY_GRADE_2_CRYSTAL); // Crystal 
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        logger.info("Obtaining 1 chest gas");
        await this.tapLocation(locations.REFINERY_GRADE_2_GAS); // Gas
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        logger.info("Obtaining 1 chest ore");
        await this.tapLocation(locations.REFINERY_GRADE_2_ORE); // Ore
        await sleep(2000);
        await this.tapLocation(locations.REFINERY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        logger.info("Done, exiting refinery");
        await this.tapLocation(locations.TOP_LEFT_BACK);

        logger.info("We're all done collecting chest rewards");
    }

    async claimGifts() {
        logger.info("claiming gifts");
        let box = await this.findRegionForText("CLAIM");

        if (!box) {
            logger.info("Nothing to claim!");
            return;
        }

        await this.tapLocation([ (box.x1+box.x2)/2, (box.y1+box.y2)/2 ]);
        // Wait until we can see it? That takes screenshot service which costs!
        await sleep(2000);
        
        // TODO: Refactor this to be slower for lower speed devices
        // Slides 3/4 of the screen
        await this.swipe(
            (this.currentScreenSize.width/10) * 8,
            this.currentScreenSize.height/2,
            (this.currentScreenSize.width/10) * 4,
            this.currentScreenSize.height/2, 
            5000
        ); 

        await sleep(2000);
        logger.info("Taking screenshot of gifts screen");

        // TODO: Take screenshot click claim?
        await this.takeScreenshot(this.scenes.GIFTS_VIEW);
        await this.runOcr(this.scenes.GIFTS_VIEW);

        let claimableChests = await this.findRegionsForText("CLAIM", this.scenes.GIFTS_VIEW);

        for (let i = 0; i < claimableChests.length; i++) {
            let chest = claimableChests[i];

            logger.info("Claiming chest");

            await this.tapLocation([ Math.floor((chest.x1 + chest.x2)/2), Math.floor((chest.y1 + chest.y2) / 2) ]);
            await sleep(2000);
            await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);

            if ((i+1) < claimableChests.length) {
                // Swipe back into position for the next one.
                await this.swipe(
                    (this.currentScreenSize.width/10) * 8,
                    this.currentScreenSize.height/2,
                    (this.currentScreenSize.width/10) * 4,
                    this.currentScreenSize.height/2,
                    5000
                ); 
                await sleep(2000);
            }
        }

        await this.tapLocation(this.locations.TOP_LEFT_BACK);
        logger.info("Done collecting gifts"); 

        // Now we can select claim on the others?
    }

    async redeemCollectables() {
        // TODO: Claiming certain missions / rewards can trigger screens such as followup mission dialog. Fix these

        // Claim Mission Rewards
        let missionMatches = await this.checkRGBColoursForPoints(this.colourPoints.MISSION_READY, this.scenes.MAIN_VIEW);
        if (missionMatches.length == this.colourPoints.MISSION_READY.length) {
            logger.info("Accepting mission ready");
            await this.tapLocation([ missionMatches[0].x, missionMatches[0].y ]);
            return;
        } else logger.info("No mission ready detected");

        await sleep(250);

        // Claim Building Rewards
        let buildingMatches = await this.checkRGBColoursForPoints(this.colourPoints.BUILDING_READY, this.scenes.MAIN_VIEW);
        if (buildingMatches.length == this.colourPoints.BUILDING_READY.length) {
            logger.info("Accepting building ready");
            await this.tapLocation([ buildingMatches[0].x, buildingMatches[0].y ]);
            return;
        } else logger.info("No building ready detected");

        await sleep(250);

        // Claim Research Rewards
        let researchMatches = await this.checkRGBColoursForPoints(this.colourPoints.RESEARCH_READY, this.scenes.MAIN_VIEW);
        if (researchMatches.length == this.colourPoints.RESEARCH_READY.length) {
            logger.info("Accepting research ready");
            await this.tapLocation([ researchMatches[0].x, researchMatches[0].y ]);
            return;
        } else logger.info("No research ready detected");

        await sleep(250);
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
            logger.info("No promo!");
            return;
        }
        
        logger.info("Closing promo window");

        await this.tapLocation(this.locations.INTRO_PROMO_CLOSE);
        await sleep(1000);

    }
}