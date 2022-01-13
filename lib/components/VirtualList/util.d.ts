interface Throttled<T extends (...args: any) => any> {
    (this: ThisParameterType<T>, ...args: Parameters<T>): any;
    cancel(): void;
}
export declare function throttle<T extends (...args: any) => any>(func: T, wait: number): Throttled<T>;
export declare function transformRpxToPx(rpx: number, windowWidth: number): number;
export {};
