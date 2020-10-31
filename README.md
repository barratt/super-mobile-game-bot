# Super Mobile Game Bot

This bot is designed to automate any mobile game, both iOS and android, real device and emulator.
It tries to use OCR and known coordinates. I'm trying to NOT use computer vision (In terms of AI/ML although I appreciate OCR is CV and its going to be hard to avoid) for reliability.

How it works is as follows, there is a BotInterface which has to expose certain methods such as reportStatistics and start() stop(). There is also a BridgeInterface, this has to implement specific methods for mobile such as, getResolution, tap, swipe, takeScreenshot().

If you check out src/Bots/StarfleetCommand.ts you can see an example bot I've made for StarFleet command.

This project uses known locations / regions with Azure OCR to know where to click, where possible I'm trying not to use image recognition but it may be required soon.

If I had more time, I'd write a shorter, more concise readme.

Getting Started
----

To get started with this project clone it down, copy .env.sample to .env and configure, then use the vscode debugger.

Features
----
- Multi bot support
- Winston logging
- OCR 
- iOS/Android agnostic bots
- Implement bots however is best (i.e multi-resolution support, scaled interface)

TODO
----

- Create proper NPM scripts 
- Build the iOS bridgeInterface
- Create more bots
- Speed up screenshot time for ADB bridge
- Allow ADB bridge to connect to the device itself
- Implement winston logging levels
- Implement a GUI 
- Multiple deviceIds (fallback device id for wifi + local wire)

Notes
----

While I'm trying to build this for all devices and emulators, I'm only focusing on android as thats my main device. I will require help to make the iOS bridge and more game bots.

you need to connect your device via adb first 

you need to make sure you specify device ID or if your using research folder make sure only 1 device is connected

adb connect 192.168.0.34:5555
adb disconnect 192.168.0.34:5555

Current Bots
----

Currently the only bot is Starfleet command for Android. Each bot can choose to implement their processes how they like after extending the Automator class.

### Starfleet Command

Features:
- Starts refinery
- Collects gifts
- Alliance help
- Collects mission rewards
- Completes finished buildings
- Completes finished research

Coming soon:
- Statistic reporting
- Resource generator collection
- Upgrade next building
