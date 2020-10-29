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
exports.ADB = void 0;
var streamToBuffer = require('stream-to-buffer');
var fs = require('fs');
var appium_adb_1 = __importDefault(require("appium-adb"));
var await_sleep_1 = __importDefault(require("await-sleep"));
var ADB = /** @class */ (function () {
    function ADB(deviceId) {
        // this.client = ADB.createADB();
        this.deviceId = deviceId;
    }
    ADB.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, appium_adb_1.default.createADB()];
                    case 1:
                        _a.client = _b.sent();
                        this.client.setDeviceId(this.deviceId);
                        return [2 /*return*/, null];
                }
            });
        });
    };
    ADB.prototype.swipe = function (xStart, yStart, xStop, yStop, durationMs) { };
    ADB.prototype.tap = function (x, y) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Tapping (" + x + ", " + y + ")");
                        return [4 /*yield*/, this.client.shell("input tap " + x + " " + y)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ADB.prototype.startApp = function (packageIdentifier, mainActivity) {
        return __awaiter(this, void 0, void 0, function () {
            var client, _a, appPackage, appActivity, checkAttempts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = this.client;
                        console.log("Checking if already focused");
                        return [4 /*yield*/, client.getFocusedPackageAndActivity()];
                    case 1:
                        _a = _b.sent(), appPackage = _a.appPackage, appActivity = _a.appActivity;
                        if (appPackage == packageIdentifier && appActivity == mainActivity) {
                            console.log("App already focused!");
                            return [2 /*return*/, true];
                        }
                        console.log("Starting " + packageIdentifier + "/" + mainActivity);
                        return [4 /*yield*/, client.startApp({
                                pkg: packageIdentifier,
                                activity: mainActivity,
                            })];
                    case 2:
                        _b.sent();
                        checkAttempts = 5;
                        _b.label = 3;
                    case 3: return [4 /*yield*/, client.getPIDsByName(packageIdentifier)];
                    case 4:
                        if (!((_b.sent()).length == 0 && checkAttempts > 5)) return [3 /*break*/, 6];
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 5:
                        _b.sent();
                        console.log("Can't find running app yet, waiting.");
                        checkAttempts--;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, checkAttempts > 0];
                }
            });
        });
    };
    ADB.prototype.checkAppOpen = function () {
    };
    ADB.prototype.unlockDevice = function (passCode) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, client, deviceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, client = _a.client, deviceId = _a.deviceId;
                        // TODO: Prevent shell attack verifiy pc
                        console.log("entering passcode " + passCode + " for device " + deviceId);
                        // TODO: Get device width and height when doing swipe
                        return [4 /*yield*/, client.keyevent(26)];
                    case 1:
                        // TODO: Get device width and height when doing swipe
                        _b.sent();
                        return [4 /*yield*/, client.shell('input touchscreen swipe 930 1500 930 300 200')];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, client.shell("input text " + passCode)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, client.keyevent(66)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, await_sleep_1.default(1000)];
                    case 5:
                        _b.sent();
                        console.log("Done device unlocked");
                        return [2 /*return*/];
                }
            });
        });
    };
    ADB.prototype.takeScreenshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, client, deviceId, path, buffer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, client = _a.client, deviceId = _a.deviceId;
                        path = __dirname + '/../../screen.png';
                        return [4 /*yield*/, client.shell('screencap -p /sdcard/screen.png')];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, client.pull('/sdcard/screen.png', path)];
                    case 2:
                        _b.sent();
                        buffer = fs.readFileSync(path);
                        return [2 /*return*/, buffer];
                }
            });
        });
    };
    return ADB;
}());
exports.ADB = ADB;
//# sourceMappingURL=adb.js.map