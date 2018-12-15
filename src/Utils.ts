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