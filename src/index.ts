const fs = require('fs');
// const concat = require('concat-stream')
import "dotenv/config";
import { ADB } from "./lib/Bridges/adb";

// TODO: Load this dynamically?
import { StarFleetCommandBot } from "./Bots/StarFleetCommand/StarFleetCommand";
import logger from "./lib/winston";

const bots = {
  StarFleetCommandBot,
};

const deviceId = process.env.DEVICE_ID;

async function main() {
  try {
    const bridge  = new ADB(deviceId);
    logger.info("Started");
    await bridge.init();
    logger.info("Bridge ready");
    if (await bridge.client.isScreenLocked()) {
      logger.info("Device locked! Unlocking"); 
      await bridge.unlockDevice(process.env.DEVICE_PIN);
    } else {
      logger.info("Device already unlocked!");
    }

    const bot = new bots[process.env.ENABLED_BOT](bridge);
    
    // See if we can see something familiar first if not die.
    logger.info("starting app");
    let appStarted = await bridge.startApp(bot.androidPackageIdentifier, bot.androidMainActivity);
    if (appStarted) {
      logger.info("App started! Waiting for app to load");
    } else {
      logger.info("Couldn't start app");
    }

    logger.info("Starting bot")
    await bot.start(); // This is a promise and stops when the bot stops. If it stops.
    logger.info("Bot all done.");

    await bridge.lockDevice();
  } catch (e) {
    console.error(e);
  }
  // 3.6 seconds for a game on google pixel 2xl :(
}

main();

// LOOK image
// TAP x,y
// SWIPE x,y x,y