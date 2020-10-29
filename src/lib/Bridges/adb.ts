import { BridgeInterface } from "./BridgeInterface";
const streamToBuffer = require('stream-to-buffer');
const fs = require('fs');

import AppiumADB from 'appium-adb';
import sleep from "await-sleep";

export class ADB implements BridgeInterface {
    client;
    deviceId;

    constructor(deviceId) {
        // this.client = ADB.createADB();
        this.deviceId = deviceId;
    }

    async init() {
        this.client = await AppiumADB.createADB();
        this.client.setDeviceId(this.deviceId);
        return null;
    }

    swipe(xStart, yStart, xStop, yStop, durationMs) {}
    async tap(x, y) {
        console.log(`Tapping (${x}, ${y})`);
        await this.client.shell(`input tap ${x} ${y}`);
    }

    async startApp(packageIdentifier: string, mainActivity: string) {
        const { client } = this;

        console.log("Checking if already focused");
        const { appPackage, appActivity } = await client.getFocusedPackageAndActivity();
        
        if (appPackage == packageIdentifier && appActivity == mainActivity) {
            console.log("App already focused!");
            return true;
        }

        console.log(`Starting ${packageIdentifier}/${mainActivity}`);

        await client.startApp({
            pkg: packageIdentifier,
            activity: mainActivity,
        });

        let checkAttempts = 5;
        while (((await client.getPIDsByName(packageIdentifier)).length == 0 && checkAttempts > 5)) {
            await sleep(2000);
            console.log("Can't find running app yet, waiting.");
            checkAttempts--;
        }

        return checkAttempts > 0;
    }

    checkAppOpen() {

    }

    async unlockDevice(passCode: string) {
        const { client, deviceId } = this;
        // TODO: Prevent shell attack verifiy pc
        console.log(`entering passcode ${passCode} for device ${deviceId}`);
        
        // TODO: Get device width and height when doing swipe
        await client.keyevent(26)
        await client.shell('input touchscreen swipe 930 1500 930 300 200')
        await client.shell(`input text ${passCode}`)
        await client.keyevent(66)

        await sleep(1000);
        console.log("Done device unlocked");
    }

    async takeScreenshot(): Promise<Buffer> {
        const { client, deviceId } = this;
        
        // let buffer = await new Promise(async function(resolve, reject) {
        //     streamToBuffer(await client.screencap(deviceId), function (err, buffer) {
        //         if (err) return reject(err);
        //         resolve(buffer);
        //     })
        // });
        
        const path = __dirname+'/../../screen.png'; // TODO: Use tmp path

        await client.shell('screencap -p /sdcard/screen.png');
        await client.pull('/sdcard/screen.png', path);
        let buffer = fs.readFileSync(path);

        return (buffer as Buffer);
    }
}