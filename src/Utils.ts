export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}


export type IMatterContactPoints = { vertex: { x: number; y: number; }; }[];


export type EventContext = {
    stopPropagation: () => void;
}

export const defaultFont = 'Helvetica, Arial, SimHei';

export const defaultTextStyle = {
    fontFamily: defaultFont,
    color: 'black',
    fontSize: 40,
};

export function transpose(matrix: Array<Array<any>>) {
    return matrix[0].slice().fill(1).map((col, c) => {
        return matrix.map((row, r) => {
            return matrix[r][c];
        })
    });
}

export const indent = (indentCount: integer, paddingStr: string) => (str: string) => (
    str.split('\n').map(s => `${paddingStr.repeat(indentCount)}${s}`).join('\n')
);

export const compareNumber = (a: number, b: number) => (a - b);

// (<any>Array.prototype).inspect = function () {
//     console.log(this);
//     return this;
// };
// (<any>Array.prototype).do = function (callback: (a: any) => {}) {
//     callback(this);
//     return this;
// };