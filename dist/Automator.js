"use strict";
// Bots can extend the automator which can give them superpowers 
// TODO: Refactor cognative to our own APIs.
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
exports.Automator = void 0;
var axios_1 = __importDefault(require("axios"));
var form_data_1 = __importDefault(require("form-data"));
var gm_1 = __importDefault(require("gm"));
var collission_detection_1 = __importDefault(require("./utils/collission-detection"));
var Automator = /** @class */ (function () {
    function Automator(bridge) {
        this.bridge = bridge;
        this.cognative = axios_1.default.create({
            baseURL: "https://" + process.env.COGNATIVE_BASE + ".cognitiveservices.azure.com",
            params: {
                language: "en",
                detectOrientation: "true"
            },
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.COGNATIVE_KEY
            }
        });
    }
    Automator.prototype.findTextInRegion = function (x1, y1, x2, y2) {
        return __awaiter(this, void 0, void 0, function () {
            var screenshot, compressed, data, ocr, wordsInRegion, _i, _a, region, _b, _c, line, _d, _e, word, boundingBox, isWordInRegion;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.bridge.takeScreenshot()];
                    case 1:
                        screenshot = _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                gm_1.default(screenshot, 'before.png').quality(process.env.IMAGE_QUALITY || 50).toBuffer('png', function (err, buf) {
                                    if (err)
                                        return reject(err);
                                    return resolve(buf);
                                });
                            })];
                    case 2:
                        compressed = _f.sent();
                        data = new form_data_1.default();
                        data.append('file', compressed, "image.png");
                        return [4 /*yield*/, this.cognative.post("vision/v2.0/ocr", data, {
                                headers: {
                                    'Content-Type': "multipart/form-data; boundary=" + data._boundary,
                                }
                            })];
                    case 3:
                        ocr = _f.sent();
                        wordsInRegion = [];
                        for (_i = 0, _a = ocr.data.regions; _i < _a.length; _i++) {
                            region = _a[_i];
                            for (_b = 0, _c = region.lines; _b < _c.length; _b++) {
                                line = _c[_b];
                                for (_d = 0, _e = line.words; _d < _e.length; _d++) {
                                    word = _e[_d];
                                    boundingBox = word.boundingBox.split(',');
                                    isWordInRegion = collission_detection_1.default.contains({
                                        x1: x1, y1: y1,
                                        x2: x2, y2: y2,
                                    }, {
                                        x1: boundingBox[0],
                                        y1: boundingBox[1],
                                        x2: boundingBox[2],
                                        y2: boundingBox[3],
                                    });
                                    if (isWordInRegion) {
                                        wordsInRegion.push(word.text);
                                    }
                                }
                            }
                        }
                        // We have a list of regions where we found text, lets see if one matches ours accurately
                        return [2 /*return*/, wordsInRegion.join(' ')];
                }
            });
        });
    };
    return Automator;
}());
exports.Automator = Automator;
//# sourceMappingURL=Automator.js.map