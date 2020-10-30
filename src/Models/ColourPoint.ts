export interface ColourPoint {
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a?: number, // for png images, not used currently

    tolerance?: number, // for when checking if a pixel matches how far out can we be
}