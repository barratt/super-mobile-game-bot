"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.touches = exports.overlaps = exports.contains = void 0;
// Check if rectangle a contains rectangle b
// Each object (a and b) should have 2 properties to represent the
// top-left corner (x1, y1) and 2 for the bottom-right corner (x2, y2).
function contains(a, b) {
    return !(b.x1 < a.x1 ||
        b.y1 < a.y1 ||
        b.x2 > a.x2 ||
        b.y2 > a.y2);
}
exports.contains = contains;
// Check if rectangle a overlaps rectangle b
// Each object (a and b) should have 2 properties to represent the
// top-left corner (x1, y1) and 2 for the bottom-right corner (x2, y2).
function overlaps(a, b) {
    // no horizontal overlap
    if (a.x1 >= b.x2 || b.x1 >= a.x2)
        return false;
    // no vertical overlap
    if (a.y1 >= b.y2 || b.y1 >= a.y2)
        return false;
    return true;
}
exports.overlaps = overlaps;
// Check if rectangle a touches rectangle b
// Each object (a and b) should have 2 properties to represent the
// top-left corner (x1, y1) and 2 for the bottom-right corner (x2, y2).
function touches(a, b) {
    // has horizontal gap
    if (a.x1 > b.x2 || b.x1 > a.x2)
        return false;
    // has vertical gap
    if (a.y1 > b.y2 || b.y1 > a.y2)
        return false;
    return true;
}
exports.touches = touches;
exports.default = {
    contains: contains, touches: touches, overlaps: overlaps
};
//# sourceMappingURL=collission-detection.js.map