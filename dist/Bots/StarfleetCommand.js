"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.StarfleetCommandBot = void 0;
var await_sleep_1 = __importDefault(require("await-sleep"));
var Automator_1 = require("../Automator");
var StarfleetCommandBot = /** @class */ (function (_super) {
    __extends(StarfleetCommandBot, _super);
    function StarfleetCommandBot(bridge) {
        var _this = _super.call(this, bridge) || this;
        _this.androidPackageIdentifier = "com.scopely.startrek";
        _this.androidMainActivity = "com.digprm.prime.NativeAndroidActivity";
        // Designed on a Pixel 2 XL
        _this.locations = {
            TOP_LEFT_BACK: [100, 75],
            REFINARY: [850, 300],
            BOTTOM_CENTER_DONE: [1500, 1300],
            REFINARY_GRADE_2_CRYSTAL: [360, 1130],
            REFINARY_GRADE_2_GAS: [1100, 1130],
            REFINARY_GRADE_2_ORE: [1800, 1130],
            REFINARY_MATERIALS_1CHEST: [1200, 1300],
        };
        _this.bridge = bridge;
        return _this;
    }
    StarfleetCommandBot.prototype.start = function () {
        console.log("StarFleet command bot running");
        // TODO: Check if game is open
        // TODO: Check if dailies are collected
        // TODO: Check if refinary is done
    };
    StarfleetCommandBot.prototype.stop = function () {
    };
    StarfleetCommandBot.prototype.getPlayerScore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Getting score");
                        return [4 /*yield*/, this.findTextInRegion(275, 0, 800, 100)];
                    case 1:
                        score = _a.sent();
                        console.log("Found score: " + score);
                        return [2 /*return*/];
                }
            });
        });
    };
    StarfleetCommandBot.prototype.tapLocation = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            var bridge;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bridge = this.bridge;
                        return [4 /*yield*/, bridge.tap(location[0], location[1])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    StarfleetCommandBot.prototype.collectChestRewards = function () {
        return __awaiter(this, void 0, void 0, function () {
            var locations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locations = this.locations;
                        console.log("Opening refinary");
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 2:
                        _a.sent();
                        console.log("Obtaining 1 chest crystal");
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_GRADE_2_CRYSTAL)];
                    case 3:
                        _a.sent(); // Crystal 
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_MATERIALS_1CHEST)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.BOTTOM_CENTER_DONE)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 8:
                        _a.sent();
                        console.log("Obtaining 1 chest gas");
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_GRADE_2_GAS)];
                    case 9:
                        _a.sent(); // Gas
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_MATERIALS_1CHEST)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.BOTTOM_CENTER_DONE)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 14:
                        _a.sent();
                        console.log("Obtaining 1 chest ore");
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_GRADE_2_ORE)];
                    case 15:
                        _a.sent(); // Ore
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.REFINARY_MATERIALS_1CHEST)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, this.tapLocation(locations.BOTTOM_CENTER_DONE)];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, await_sleep_1.default(2000)];
                    case 20:
                        _a.sent();
                        console.log("Done, exiting refinary");
                        return [4 /*yield*/, this.tapLocation(locations.TOP_LEFT_BACK)];
                    case 21:
                        _a.sent();
                        console.log("We're all done collecting chest rewards");
                        return [2 /*return*/];
                }
            });
        });
    };
    return StarfleetCommandBot;
}(Automator_1.Automator));
exports.StarfleetCommandBot = StarfleetCommandBot;
//# sourceMappingURL=StarfleetCommand.js.map