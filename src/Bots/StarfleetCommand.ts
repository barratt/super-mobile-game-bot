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
        REFINARY: [ 850, 300 ],
        BOTTOM_CENTER_DONE: [ 1500, 1300 ],

        REFINARY_GRADE_2_CRYSTAL: [ 360, 1130 ],
        REFINARY_GRADE_2_GAS: [ 1100, 1130 ],
        REFINARY_GRADE_2_ORE: [ 1800, 1130 ],

        REFINARY_MATERIALS_1CHEST: [ 1200, 1300 ],
    }

    constructor(bridge: BridgeInterface) {
        super(bridge);
        this.bridge = bridge;
    }

    start() {
        console.log("StarFleet command bot running");

        // TODO: Check if game is open
        // TODO: Check if dailies are collected
        // TODO: Check if refinary is done
    }

    stop() {

    }

    async getPlayerScore() {
        console.log("Getting score");
        let score = await this.findTextInRegion(275, 0, 800, 100);
        console.log(`Found score: ${score}`)
    }

    async tapLocation(location) {
        const { bridge } = this;
        return await bridge.tap(location[0], location[1])
    }

    async collectChestRewards() {
        const { locations } = this;

        console.log("Opening refinary")
        await this.tapLocation(locations.REFINARY);
        await sleep(2000);
        console.log("Obtaining 1 chest crystal");
        await this.tapLocation(locations.REFINARY_GRADE_2_CRYSTAL); // Crystal 
        await sleep(2000);
        await this.tapLocation(locations.REFINARY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Obtaining 1 chest gas");
        await this.tapLocation(locations.REFINARY_GRADE_2_GAS); // Gas
        await sleep(2000);
        await this.tapLocation(locations.REFINARY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Obtaining 1 chest ore");
        await this.tapLocation(locations.REFINARY_GRADE_2_ORE); // Ore
        await sleep(2000);
        await this.tapLocation(locations.REFINARY_MATERIALS_1CHEST);
        await sleep(2000);
        await this.tapLocation(locations.BOTTOM_CENTER_DONE);
        await sleep(2000);
        console.log("Done, exiting refinary");
        await this.tapLocation(locations.TOP_LEFT_BACK);

        console.log("We're all done collecting chest rewards");
    }
}