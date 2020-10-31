import { DeviceScreen } from "../../Models/DeviceScreen";

export interface BridgeInterface {
    init(): Promise<null>;
    
    startApp(identifier: string, activity: string): Promise<boolean>;
    checkAppOpen(identifier: string, activity: string) : Promise<boolean>;
    unlockDevice(passCode: string);

    screenResolution(): Promise<DeviceScreen>;
    takeScreenshot(): Promise<Buffer>;
    tap(x: number, y: number);
    swipe(xStart: number, yStart: number, xStop: number, yStop: number, durationMs: number);

    wakeScreen(): Promise<boolean>;
}
