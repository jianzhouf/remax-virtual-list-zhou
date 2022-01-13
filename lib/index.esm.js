import React, { forwardRef, useState, useMemo, useImperativeHandle, useEffect, useRef } from 'react';
import { View } from 'remax/one';

function throttle(func, wait) {
    let previous = 0;
    let time;
    let remaining;
    const throttled = function (...args) {
        const now = +new Date();
        const context = this;
        remaining = wait - (now - previous);
        if (remaining <= 0) {
            func.apply(context, args);
            previous = now;
        }
        else {
            if (time) {
                clearTimeout(time);
            }
            time = setTimeout(() => {
                func.apply(context, args);
                time = undefined;
                previous = +new Date();
            }, remaining);
        }
    };
    throttled.cancel = () => {
        if (time) {
            clearTimeout(time);
        }
    };
    return throttled;
}
function transformRpxToPx(rpx, windowWidth) {
    return (rpx / 750) * windowWidth;
}

const VirtualList = forwardRef(({ overscanCount = 12, data = [], headerHeight = 0, renderHeader, renderBottom, itemHeight = 1, renderItem, placeholderImage, windowWidth = 375, onExposure, scrollViewHeightPx, }, ref) => {
    const [visibleStart, setVisibleStart] = useState(0);
    const { start, end } = useMemo(() => ({
        start: visibleStart - overscanCount,
        end: visibleStart + 2 * overscanCount,
    }), [visibleStart]);
    const visibleData = useMemo(() => {
        return data.filter((_, index) => index >= start && index <= end);
    }, [start, end, data]);
    // TODO: 只支持wechat; 遵照微信rpx转px的规则; 不一定通用; 后续需要不同平台再兼容
    const itemHeightPx = Math.floor(transformRpxToPx(itemHeight, windowWidth));
    const headerHeightPx = Math.floor(transformRpxToPx(headerHeight, windowWidth));
    const handleScroll = useMemo(() => throttle((event) => {
        let { scrollTop, scrollHeight } = event.detail;
        const min = 0, max = scrollHeight - (scrollViewHeightPx || 0);
        scrollTop = Math.max(Math.min(scrollTop, max), min);
        const newVisibleStart = Math.ceil((scrollTop - headerHeightPx) / itemHeightPx);
        setVisibleStart(newVisibleStart);
        // 曝光index
        const exposureIndex = Math.floor((scrollTop + scrollViewHeightPx - headerHeightPx) / itemHeightPx);
        onExposure?.(exposureIndex);
    }, 100), [headerHeightPx, itemHeightPx, scrollViewHeightPx]);
    useImperativeHandle(ref, () => ({
        onScroll: handleScroll,
    }));
    useEffect(() => {
        return handleScroll.cancel;
    }, [handleScroll]);
    // 第一次曝光
    const didRef = useRef(false);
    useEffect(() => {
        if (data.length && scrollViewHeightPx && !didRef.current) {
            didRef.current = true;
            const exposureIndex = Math.floor((0 + scrollViewHeightPx - headerHeightPx) / itemHeightPx);
            onExposure?.(exposureIndex);
        }
    }, [data, scrollViewHeightPx, headerHeightPx, itemHeightPx]);
    return (React.createElement(View, null,
        renderHeader && (React.createElement(View, { style: { height: headerHeight } }, renderHeader())),
        React.createElement(View, { style: {
                position: "relative",
                height: data.length * itemHeightPx + "PX",
                background: placeholderImage && `url("${placeholderImage}") repeat-y`,
                backgroundSize: placeholderImage && `100% ${itemHeightPx}PX`,
            } },
            React.createElement(View, { style: {
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    top: (start > 0 ? start : 0) * itemHeightPx + "PX",
                } }, visibleData.map((item, index) => (React.createElement(View, { style: { height: `${itemHeightPx}PX` }, key: start + index }, renderItem(item, index)))))),
        renderBottom?.()));
});

export { VirtualList as default };
