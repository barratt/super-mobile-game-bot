const fs = require('fs')
// const concat = require('concat-stream')

const deviceId = process.env.DEVICE_ID;

import "dotenv/config";
import sleep from "await-sleep";
import { StarfleetCommandBot } from "./Bots/StarfleetCommand";
import { ADB } from "./lib/Bridges/adb";


console.log("What");

async function main() {
  try {
    const bridge  = new ADB(deviceId);
    console.log("Started");
    await bridge.init();
    console.log("Bridge ready");
    if (await bridge.client.isScreenLocked()) {
      console.log("Device locked! Unlocking"); 
      await bridge.unlockDevice(process.env.DEVICE_PIN);
    } else {
      console.log("Device unlocked!");
    }

    const bot = new StarfleetCommandBot(bridge);
    
    // See if we can see something familiar first if not die.
    console.log("starting app");
    let appStarted = await bridge.startApp(bot.androidPackageIdentifier, bot.androidMainActivity);
    if (appStarted) {
      console.log("App started! Waiting for app to load");
    } else {
      console.log("Couldn't start app");
    }

    console.log("Starting bot")
    await bot.start(); // This is a promise and stops when the bot stops. If it stops.
    console.log("Bot all done.");
  } catch (e) {
    console.error(e);
  }
  // 3.6 seconds for a game on google pixel 2xl :(
}

main();

// LOOK image
// TAP x,y
// SWIPE x,y x,y