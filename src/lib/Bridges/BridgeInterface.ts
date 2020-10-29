export interface BridgeInterface {
    init(): Promise<null>;
    
    startApp(identifier: string, activity: string);
    checkAppOpen(identifier: string);
    unlockDevice(passCode: string);

    takeScreenshot(): Promise<Buffer>;
    tap(x: number, y: number);
    swipe(xStart: number, yStart: number, xStop: number, yStop: number, durationMs: number);
}
