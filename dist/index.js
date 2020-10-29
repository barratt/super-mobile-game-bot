"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
// const concat = require('concat-stream')
var deviceId = "192.168.0.34:5555";
require("dotenv/config");
var await_sleep_1 = __importDefault(require("await-sleep"));
var StarfleetCommand_1 = require("./Bots/StarfleetCommand");
var adb_1 = require("./lib/Bridges/adb");
console.log("What");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var bridge, bot, started, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    bridge = new adb_1.ADB(deviceId);
                    console.log("Started");
                    return [4 /*yield*/, bridge.init()];
                case 1:
                    _a.sent();
                    console.log("Bridge ready");
                    return [4 /*yield*/, bridge.client.isScreenLocked()];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    console.log("Device locked! Unlocking");
                    return [4 /*yield*/, bridge.unlockDevice(process.env.DEVICE_PIN)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.log("Device unlocked!");
                    _a.label = 5;
                case 5:
                    bot = new StarfleetCommand_1.StarfleetCommandBot(bridge);
                    // bot.start();
                    // console.log("Taking screenshot to test.png");
                    // console.time('ss');
                    // let ss = await bridge.takeScreenshot();
                    // console.timeEnd('ss');
                    // fs.writeFileSync('test.png', ss);
                    console.log("starting app");
                    return [4 /*yield*/, bridge.startApp(bot.androidPackageIdentifier, bot.androidMainActivity)];
                case 6:
                    started = _a.sent();
                    if (started) {
                        console.log("App started! Waiting for app to load");
                    }
                    else {
                        console.log("Couldn't start app");
                    }
                    return [4 /*yield*/, await_sleep_1.default(20 * 1000)];
                case 7:
                    _a.sent(); // Wait for it to load (TODO: Make a better system for this, search for something to exist on the screen)
                    console.log("App started collecting rewards");
                    // Collect dailies
                    // await bot.collectChestRewards();
                    return [4 /*yield*/, bot.getPlayerScore()];
                case 8:
                    // Collect dailies
                    // await bot.collectChestRewards();
                    _a.sent();
                    console.log("done");
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main();
// LOOK image
// TAP x,y
// SWIPE x,y x,y
//# sourceMappingURL=index.js.map