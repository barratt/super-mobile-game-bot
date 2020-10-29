import { BridgeInterface } from "../lib/Bridges/BridgeInterface";
import { BotInterface } from "./BotInterface";
import sleep from "await-sleep";
import { Automator } from "../Automator";

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
    }
    regions = {
        PLAYER_SCORE_BOUNDING_BOX: { x1: 275, y1: 0, x2: 800, y2: 100 },
        REFINERY_NOTIFICATION_BOUNDING_BOX: { x1: 700, y1: 230, x2: 760, y2: 290 },
        REFINERY_LABEL_BOUNDING_BOX: { x1: 770, y1: 365, x2: 950, y2: 420 },
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

    async getPlayerScore() {
        console.log("Getting score");
        let score = await this.findTextInRegion(this.regions.PLAYER_SCORE_BOUNDING_BOX);
        console.log(`Found score: ${score}`)
    }

    async tapLocation(location) {
        const { bridge } = this;
        return await bridge.tap(location[0], location[1])
    }

    async startRefinery() {
        const { locations } = this;
        // TODO: Make this smarter, find where the refinery buttons are instead.

        // Check if refinery is unlocked
        let refineryUnlocked = (await this.findTextInRegion(this.regions.REFINERY_NOTIFICATION_BOUNDING_BOX)).toLowerCase();
        if (refineryUnlocked == "refinery") {
            console.log("Yep refinery unlocked")
        } else {
            console.log("Refinery wasn't where we expected!");
        }

        // Check if refinery is good to go.
        let notification = await this.findTextInRegion(this.regions.REFINERY_NOTIFICATION_BOUNDING_BOX);
        if (notification.length == 0) {
            // No refinery today.
            console.log("Refinery already done!");
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
}