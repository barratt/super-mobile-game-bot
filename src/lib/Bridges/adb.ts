import { BridgeInterface } from "./BridgeInterface";
const streamToBuffer = require('stream-to-buffer');
const fs = require('fs');

import AppiumADB from 'appium-adb';
import sleep from "await-sleep";
import { DeviceScreen } from "../../Models/DeviceScreen";

export class ADB implements BridgeInterface {
    client;
    deviceId;

    constructor(deviceId) {
        // this.client = ADB.createADB();
        this.deviceId = deviceId;
    }

    async init() {
        this.client = await AppiumADB.createADB();
        // console.log("Connecting");
        // await this.client.adbExec([`connect ${this.deviceId}`])
        // console.log("calling reconnect") 
        // await this.client.reconnect('device');
        console.log("Setting device id")
        await this.client.setDeviceId(this.deviceId);
        return null;
    }

    async swipe(xStart, yStart, xStop, yStop, durationMs): Promise<boolean> {

        console.log(`Swiping (${xStart}, ${yStart})`);
        console.log(`adb shell input touchscreen swipe ${xStart} ${yStart} ${xStop} ${yStop} ${durationMs}`)
        await this.client.shell(`input touchscreen swipe ${xStart} ${yStart} ${xStop} ${yStop} ${durationMs}`);
        await sleep(durationMs + 100);

        return true;
    }
    async tap(x, y): Promise<boolean> {
        console.log(`Tapping (${x}, ${y})`);
        await this.client.shell(`input tap ${x} ${y}`);
        return true;
    }

    async startApp(packageIdentifier: string, mainActivity: string) {
        const { client } = this;

        let isOpen = await this.checkAppOpen(packageIdentifier, mainActivity);
        if (isOpen) {
            console.log("App already open!");
            return true;
        }

        await client.shell('settings put system screen_brightness 255');
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

    async checkAppOpen(packageIdentifier: string, mainActivity: string) {
        const { client } = this;

        console.log("Checking if already focused");
        const { appPackage, appActivity } = await client.getFocusedPackageAndActivity();
        
        console.log(`Checking for focus: ${appPackage} ${appActivity}`);
        console.log(`Looking for: ${packageIdentifier} ${mainActivity}`);
        if (appPackage == packageIdentifier && appActivity == mainActivity) {
            return true;
        }

        return false;
    }

    async unlockDevice(passCode: string) {
        const { client, deviceId } = this;
        // TODO: Prevent shell attack verifiy pc
        console.log(`entering passcode ${passCode} for device ${deviceId}`);
        
        // TODO: Get device width and height when doing swipe
        await client.keyevent(26); // Power
        await sleep(500);
        await client.shell('input touchscreen swipe 930 1500 930 300 200'); // swipe up
        await client.shell(`input text ${passCode}`)
        await client.keyevent(66); // Enter
        await sleep(250);
        await client.keyevent(3); // Home 

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

    async screenResolution(): Promise<DeviceScreen> {
        let screenSize = (await this.client.shell(`wm size`)).replace('Physical size: ', '').split('x');
        // This assumes portrait mode.
        // I'm inverting this for now because we assume its always landscape.
        return { width: screenSize[1], height: screenSize[0] };
    }

    async wakeScreen(): Promise<boolean> {
        await this.client.shell(`input keyevent mouse`);
        return true;
    }
}