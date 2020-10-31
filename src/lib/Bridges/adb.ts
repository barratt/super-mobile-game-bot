import { BridgeInterface } from "./BridgeInterface";
const streamToBuffer = require('stream-to-buffer');
const fs = require('fs');

import AppiumADB from 'appium-adb';
import sleep from "await-sleep";
import { DeviceScreen } from "../../Models/DeviceScreen";

import logger from "../winston";

export class ADB implements BridgeInterface {
    client;
    deviceId;

    constructor(deviceId) {
        // this.client = ADB.createADB();
        this.deviceId = deviceId;
    }

    async init() {
        this.client = await AppiumADB.createADB();
        // logger.debug("Connecting");
        // await this.client.adbExec([`connect ${this.deviceId}`])
        // logger.debug("calling reconnect") 
        // await this.client.reconnect('device');
        logger.debug("Setting device id")
        await this.client.setDeviceId(this.deviceId);
        return null;
    }

    async swipe(xStart, yStart, xStop, yStop, durationMs): Promise<boolean> {

        logger.debug(`Swiping (${xStart}, ${yStart})`);
        logger.debug(`adb shell input touchscreen swipe ${xStart} ${yStart} ${xStop} ${yStop} ${durationMs}`)
        await this.client.shell(`input touchscreen swipe ${xStart} ${yStart} ${xStop} ${yStop} ${durationMs}`);
        await sleep(durationMs + 100);

        return true;
    }
    async tap(x, y): Promise<boolean> {
        logger.debug(`Tapping (${x}, ${y})`);
        await this.client.shell(`input tap ${x} ${y}`);
        return true;
    }

    async startApp(packageIdentifier: string, mainActivity: string) {
        const { client } = this;

        let isOpen = await this.checkAppOpen(packageIdentifier, mainActivity);
        if (isOpen) {
            logger.debug("App already open!");
            return true;
        }

        await client.shell('settings put system screen_brightness 255');
        logger.debug(`Starting ${packageIdentifier}/${mainActivity}`);
        await client.startApp({
            pkg: packageIdentifier,
            activity: mainActivity,
        });

        let checkAttempts = 5;
        while (((await client.getPIDsByName(packageIdentifier)).length == 0 && checkAttempts > 5)) {
            await sleep(2000);
            logger.debug("Can't find running app yet, waiting.");
            checkAttempts--;
        }

        return checkAttempts > 0;
    }

    async checkAppOpen(packageIdentifier: string, mainActivity: string) {
        const { client } = this;

        logger.debug("Checking if already focused");
        const { appPackage, appActivity } = await client.getFocusedPackageAndActivity();
        
        logger.debug(`Checking for focus: ${appPackage} ${appActivity}`);
        logger.debug(`Looking for: ${packageIdentifier} ${mainActivity}`);
        if (appPackage == packageIdentifier && appActivity == mainActivity) {
            return true;
        }

        return false;
    }

    async unlockDevice(passCode: string) {
        const { client, deviceId } = this;
        // TODO: Prevent shell attack verifiy pc
        logger.debug(`entering passcode ${passCode} for device ${deviceId}`);
        
        // TODO: Get device width and height when doing swipe
        await client.keyevent(26); // Power
        await sleep(500);
        await client.shell('input touchscreen swipe 930 1500 930 300 200'); // swipe up
        await client.shell(`input text ${passCode}`)
        await client.keyevent(66); // Enter
        await sleep(250);
        await client.keyevent(3); // Home 

        await sleep(1000);
        logger.debug("Done device unlocked");
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
        logger.debug("ADB got device resolution");
        return { width: screenSize[1], height: screenSize[0] };
    }

    async wakeScreen(): Promise<boolean> {
        await this.client.shell(`input keyevent mouse`);
        logger.debug("Done device keepalive");
        return true;
    }
}