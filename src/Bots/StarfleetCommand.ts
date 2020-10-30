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

    scenes = {
        MAIN_VIEW: "main",
        GIFTS_VIEW: "gifts",
    }

    constructor(bridge: BridgeInterface) {
        super(bridge);
        this.bridge = bridge;
    }

    start() {
        console.log("StarFleet command bot running");

        // TODO: Check if game is open
        // TODO: Check if dailies are collected
        // TODO: Check if refinery is done
    }

    stop() {

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

    async tapLocation(location) {
        const { bridge } = this;
        return await bridge.tap(location[0], location[1])
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

        let notification = await this.findTextInRegion(this.regions.ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX, this.scenes.MAIN_VIEW);
        if (notification.length == 0) {
            // No refinery today.
            console.log("Alliance doesn't need help!");
            return;
        }

        await this.tapLocation(this.locations.ALLIANCE_HELP);
        await sleep(2000);
        await this.tapLocation(this.locations.ALLIANCE_HELP_ALL);
        console.log(`Helped ${notification} people!`);
    }

    async startRefinery() {
        const { locations } = this;
        // TODO: Make this smarter, find where the refinery buttons are instead.

        // Check if refinery is unlocked
        let refineryUnlocked = (await this.findTextInRegion(this.regions.REFINERY_NOTIFICATION_BOUNDING_BOX, this.scenes.MAIN_VIEW)).toLowerCase();
        if (refineryUnlocked == "refinery") {
            console.log("Yep refinery unlocked")
        } else {
            console.log("Refinery wasn't where we expected!");
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
        await this.tapLocation([ (box.x1+box.x2)/2, (box.y1+box.y2)/2 ]);
        // Wait until we can see it? That takes screenshot service which costs!
        await sleep(2000);
        
        await this.bridge.swipe(1850, 620, 1100, 620, 250); // The current qame has 2 promo packs

        await sleep(1000);
        console.log("Taking screenshot of gifts screen");

        // TODO: Take screenshot click claim?
        await this.takeScreenshot(this.scenes.GIFTS_VIEW);
        await this.runOcr(this.scenes.GIFTS_VIEW);

        const chests = {
            "MIN10": { x1: 600, y1: 1080, x2: 900, y2: 1165 }, // Green claim button or available in
            "HOUR4": { x1: 1030, y1: 1080, x2: 0, y2: 0 },
            "HOUR24": { x1: 0, y1: 0, x2: 0, y2: 0 },
        }

        let min10Text= await this.findTextInRegion(chests.MIN10, this.scenes.GIFTS_VIEW);

        if (min10Text == "CLAIM") {
            await this.tapLocation([ (chests.MIN10.x1 + chests.MIN10.x2) / 2, (chests.MIN10.y1 + chests.MIN10.y2) / 2 ]);
        }

        await sleep(2000);
        await this.tapLocation(this.locations.BOTTOM_CENTER_DONE);

        // This returns us back to the gifts screen, lets swipe and check for 4h

        await sleep(2000);
        console.log("Done collecting gifts");

        // Now we can select claim on the others?

    }
}