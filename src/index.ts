const fs = require('fs')
// const concat = require('concat-stream')

const deviceId = "192.168.0.34:5555"

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

    // bot.start();
    // console.log("Taking screenshot to test.png");
    // console.time('ss');
    // let ss = await bridge.takeScreenshot();
    // console.timeEnd('ss');
    // fs.writeFileSync('test.png', ss);

    console.log("starting app");
    let started = await bridge.startApp(bot.androidPackageIdentifier, bot.androidMainActivity);
    if (started) {
      console.log("App started! Waiting for app to load");
    } else {
      console.log("Couldn't start app");
    }
    
    let runBotInfinitely = true;

    while (true) {
      // See if we can see something familiar first if not die.
      
      // TODO: Speed this up
      // Take screenshot
      await bot.takeScreenshot();
      // bot.lastScreenshot = require('fs').readFileSync('../research/android_scripts/screen2.png');

      // Run the OCR on the last screenshot 
      // await bot.runOcr();
      bot.lastOcr = require('../research/ocrresponse.json');

      if (await bot.isOnGameHomeScreen()) {
        await bot.startRefinery();
        await bot.helpAlliance();
        await bot.getPlayerScore();
      } else {
        console.log("Bot not on home screen, Did something go wrong or am I just loading?");
      }
      
      await sleep(5000);

      if (!runBotInfinitely) {
        break;
      }
    }


    // Get the player score

    console.log("done");
  } catch (e) {
    console.error(e);
  }
  // 3.6 seconds for a game on google pixel 2xl :(
}

main();

// LOOK image
// TAP x,y
// SWIPE x,y x,y