'use strict';

var React = require('react');
var one = require('remax/one');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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

const VirtualList = React.forwardRef(({ overscanCount = 12, data = [], headerHeight = 0, renderHeader, renderBottom, itemHeight = 1, renderItem, placeholderImage, windowWidth = 375, onExposure, scrollViewHeightPx, }, ref) => {
    const [visibleStart, setVisibleStart] = React.useState(0);
    const { start, end } = React.useMemo(() => ({
        start: Math.max(visibleStart - overscanCount, 0),
        end: visibleStart + 2 * overscanCount,
    }), [visibleStart]);
    const visibleData = React.useMemo(() => {
        return data.filter((_, index) => index >= start && index <= end);
    }, [start, end, data]);
    // TODO: 只支持wechat; 遵照微信rpx转px的规则; 不一定通用; 后续需要不同平台再兼容
    const itemHeightPx = Math.floor(transformRpxToPx(itemHeight, windowWidth));
    const headerHeightPx = Math.floor(transformRpxToPx(headerHeight, windowWidth));
    const handleScroll = React.useMemo(() => throttle((event) => {
        let { scrollTop, scrollHeight } = event.detail;
        const min = 0, max = scrollHeight - (scrollViewHeightPx || 0);
        scrollTop = Math.max(Math.min(scrollTop, max), min);
        const newVisibleStart = Math.ceil((scrollTop - headerHeightPx) / itemHeightPx);
        setVisibleStart(newVisibleStart);
        // 曝光index
        const exposureIndex = Math.floor((scrollTop + scrollViewHeightPx - headerHeightPx) / itemHeightPx);
        onExposure?.(exposureIndex);
    }, 100), [headerHeightPx, itemHeightPx, scrollViewHeightPx]);
    React.useImperativeHandle(ref, () => ({
        onScroll: handleScroll,
    }));
    React.useEffect(() => {
        return handleScroll.cancel;
    }, [handleScroll]);
    // 第一次曝光
    const didRef = React.useRef(false);
    React.useEffect(() => {
        if (data.length && scrollViewHeightPx && !didRef.current) {
            didRef.current = true;
            const exposureIndex = Math.floor((0 + scrollViewHeightPx - headerHeightPx) / itemHeightPx);
            onExposure?.(exposureIndex);
        }
    }, [data, scrollViewHeightPx, headerHeightPx, itemHeightPx]);
    return (React__default["default"].createElement(one.View, null,
        renderHeader && (React__default["default"].createElement(one.View, { style: { height: headerHeight } }, renderHeader())),
        React__default["default"].createElement(one.View, { style: {
                position: "relative",
                height: data.length * itemHeightPx + "PX",
                background: placeholderImage && `url("${placeholderImage}") repeat-y`,
                backgroundSize: placeholderImage && `100% ${itemHeightPx}PX`,
            } },
            React__default["default"].createElement(one.View, { style: {
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    top: (start > 0 ? start : 0) * itemHeightPx + "PX",
                } }, visibleData.map((item, index) => (React__default["default"].createElement(one.View, { style: { height: `${itemHeightPx}PX` }, key: start + index }, renderItem(item, index)))))),
        renderBottom?.()));
});

module.exports = VirtualList;
