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

export function transpose(matrix: Array<Array<any>>) {
    return matrix[0].slice().fill(1).map((col, c) => {
        return matrix.map((row, r) => {
            return matrix[r][c];
        })
    });
}