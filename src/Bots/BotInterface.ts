import { BridgeInterface } from "../lib/Bridges/BridgeInterface";

export interface BotInterface {
    androidPackageIdentifier?: string;
    iosPackageIdentifier?: string;

    iosSupported: boolean;
    androidSupported: boolean;

    scriptName?: string;
    scriptVersion?: string;
    
    // The resolution this was designed on.
    // Some games handle different resolutions differently so we need to see about aspect ratio
    screenResolution?: {
        width: number;
        height: number;
        aspectRatio: string;
    }

    // constructor(bridge: BridgeInterface) : BotInterface;
    // Start the bot
    start();

    // Stop the bot
    stop();
}