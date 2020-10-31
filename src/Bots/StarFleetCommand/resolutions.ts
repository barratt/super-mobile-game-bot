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

        INTERIOR_BUTTON: Array<number>;
        INTRO_PROMO_CLOSE: Array<number>;
    }
    regions: {
        PLAYER_SCORE_BOUNDING_BOX: Region;
        REFINERY_LABEL_BOUNDING_BOX: Region;
        ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX: Region;
    }
    colourPoints: {
        ALLIANCE_HELP: Array<ColourPoint>;
        MISSION_READY: Array<ColourPoint>;
        INTRO_PROMO_CLOSE: Array<ColourPoint>;
        BUILDING_READY: Array<ColourPoint>;
        RESEARCH_READY: Array<ColourPoint>;
        REFINERY_READY: Array<ColourPoint>;
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

        INTERIOR_BUTTON: [ 2500, 1300 ],
        INTRO_PROMO_CLOSE: [ 2500, 270 ]
    },
    regions: {
        PLAYER_SCORE_BOUNDING_BOX: { x1: 300, y1: 20, x2: 700, y2: 100 },
        REFINERY_LABEL_BOUNDING_BOX: { x1: 770, y1: 365, x2: 950, y2: 420 },
        ALLIANCE_HELP_NOTIFICATION_BOUNDING_BOX: { x1: 2560, y1: 395, x2: 2615, y2: 550 },
    },
    colourPoints: {
        REFINERY_READY: [ { x: 887, y: 246, r: 175, g: 43, b: 51, tolerance: 15 } ],
        ALLIANCE_HELP: [ { x: 2492, y: 448, r: 110, g: 95, b: 184, tolerance: 15 } ],
        MISSION_READY: [ { x: 707, y: 1038, r: 24, g: 164, b: 32, tolerance: 15 } ],
        BUILDING_READY: [ { x: 630, y: 520, r: 24, g: 164, b: 32, tolerance: 35 } ], // Tol 35 as the speed up could be available, which is equally as cool 
        RESEARCH_READY: [ { x: 630, y: 630, r: 24, g: 164, b: 32, tolerance: 35 } ], // Tol 30 as the speed up could be available, which is equally as cool 
        INTRO_PROMO_CLOSE: [ { x: 2466, y: 238, r: 220, g: 55, b: 55, tolerance: 15 }, { x: 2497, y: 268, r: 255, g: 212, b: 204, tolerance: 10 } ]
    },
}

export default resolutions;