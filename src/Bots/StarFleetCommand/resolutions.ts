import { ColourPoint } from "../../Models/ColourPoint";
import { Region } from "../../Models/Region";

interface StarFleetCommandResolutionInterface {
    locations: {
        TOP_LEFT_BACK: Array<number>,
        REFINERY: Array<number>,
        BOTTOM_CENTER_DONE: Array<number>,
        REFINERY_GRADE_2_CRYSTAL: Array<number>;
        REFINERY_GRADE_2_GAS: Array<number>;
        REFINERY_GRADE_2_ORE: Array<number>;
        REFINERY_MATERIALS_1CHEST: Array<number>;

        ALLIANCE_HELP: Array<number>;
        ALLIANCE_HELP_ALL: Array<number>;

        MISSION_SHORTCUT: Array<number>;

        INTERIOR_BUTTON: Array<number>;
        INTRO_PROMO_CLOSE: Array<number>;
    }
    regions: {
        PLAYER_SCORE_BOUNDING_BOX: Region;
        REFINERY_NOTIFICATION_BOUNDING_BOX: Region;
        REFINERY_LABEL_BOUNDING_BOX: Region;
        ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX: Region;
    
        chests: {
            MIN10: Region;
            HOUR4: Region;
            HOUR24: Region;
        }
    }
    colourPoints: {
        ALLIANCE_HELP: Array<ColourPoint>;
        MISSION_READY: Array<ColourPoint>;
        INTRO_PROMO_CLOSE: Array<ColourPoint>;
    }
}
interface StarFleetCommandResolutionsInterface {
    "2880x1440"?: StarFleetCommandResolutionInterface
}

const resolutions: StarFleetCommandResolutionsInterface = {};

resolutions["2880x1440"] = {
    locations: {
        TOP_LEFT_BACK: [ 100, 75 ],
        REFINERY: [ 850, 300 ],
        BOTTOM_CENTER_DONE: [ 1500, 1300 ],

        REFINERY_GRADE_2_CRYSTAL: [ 360, 1130 ],
        REFINERY_GRADE_2_GAS: [ 1100, 1130 ],
        REFINERY_GRADE_2_ORE: [ 1800, 1130 ],
        REFINERY_MATERIALS_1CHEST: [ 1200, 1300 ],

        ALLIANCE_HELP: [ 2500, 500 ],
        ALLIANCE_HELP_ALL: [ 1500, 1350 ],

        MISSION_SHORTCUT: [ 707, 1038 ],

        INTERIOR_BUTTON: [ 2500, 1300 ],
        INTRO_PROMO_CLOSE: [ 2500, 270 ]
    },
    regions: {
        PLAYER_SCORE_BOUNDING_BOX: { x1: 300, y1: 20, x2: 700, y2: 100 },
        REFINERY_NOTIFICATION_BOUNDING_BOX: { x1: 700, y1: 230, x2: 760, y2: 290 },
        REFINERY_LABEL_BOUNDING_BOX: { x1: 770, y1: 365, x2: 950, y2: 420 },
        ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX: { x1: 2560, y1: 395, x2: 2615, y2: 550 },
    
        chests: {
            MIN10: { x1: 500, y1: 1070, x2: 950, y2: 1180 }, // Green claim button or available in
            HOUR4: { x1: 1170, y1: 1070, x2: 1700, y2: 1180 },
            HOUR24: { x1: 1870, y1: 1070, x2: 2400, y2: 1180 },
        }
    },
    colourPoints: {
        ALLIANCE_HELP: [ { x: 2492, y: 448, r: 110, g: 95, b: 184, tolerance: 15 } ],
        MISSION_READY: [ { x: 707, y: 1038, r: 24, g: 164, b: 32, tolerance: 15 } ],
        INTRO_PROMO_CLOSE: [ { x: 2466, y: 238, r: 220, g: 55, b: 55, tolerance: 15 }, { x: 2497, y: 268, r: 255, g: 212, b: 204, tolerance: 10 } ]
    },
}

export default resolutions;