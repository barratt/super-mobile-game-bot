import { BridgeInterface } from "../lib/Bridges/BridgeInterface";
import { DeviceScreen } from "../Models/DeviceScreen";

export interface BotInterface {
    androidPackageIdentifier?: string;
    iosPackageIdentifier?: string;

    iosSupported: boolean;
    androidSupported: boolean;

    scriptName?: string;
    scriptVersion?: string;
    
    // The resolution this was designed on.
    // Some games handle different resolutions differently so we need to see about aspect ratio
    designedFor: DeviceScreen;

    // constructor(bridge: BridgeInterface) : BotInterface;
    // Start the bot
    start(): Promise<boolean>; // This gives back a promise that resolves when the bot has finished running.

    // Stop the bot
    stop(): boolean;

    init(): Promise<any>;

    swipe(xStart: number, yStart: number, xStop: number, yStop: number, durationMs: number): Promise<boolean>;
    tapLocation(x: number, y: number): Promise<boolean>;

}