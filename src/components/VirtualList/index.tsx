import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { View } from "remax/one";
import { throttle, transformRpxToPx } from "./util";

export interface VirtualListProps {
  windowWidth: number;
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  // 曝光方法
  onExposure?: (index: number) => void;
  // 曝光方法必要参数
  scrollViewHeightPx?: number;
  overscanCount?: number;
  headerHeight?: number;
  renderHeader?: () => React.ReactNode;
  renderBottom?: () => React.ReactNode;
  placeholderImage?: string;
}

export interface VirtualListMethods {
  // { detail : { scrollTop: 0, scrollHeight: 0 } }
  onScroll(event: any): void;
}

const VirtualList = forwardRef<any, VirtualListProps>(
  (
    {
      overscanCount = 12,
      data = [],
      headerHeight = 0,
      renderHeader,
      renderBottom,
      itemHeight = 1,
      renderItem,
      placeholderImage,
      windowWidth = 375,
      onExposure,
      scrollViewHeightPx,
    },
    ref
  ) => {
    const [visibleStart, setVisibleStart] = useState(0);
    const { start, end } = useMemo(
      () => ({
        start: Math.max(visibleStart - overscanCount, 0),
        end: visibleStart + 2 * overscanCount,
      }),
      [visibleStart]
    );
    const visibleData = useMemo(() => {
      return data.filter(
        (_: any, index: number) => index >= start && index <= end
      );
    }, [start, end, data]);
    // TODO: 只支持wechat; 遵照微信rpx转px的规则; 不一定通用; 后续需要不同平台再兼容
    const itemHeightPx = Math.floor(transformRpxToPx(itemHeight, windowWidth));
    const headerHeightPx = Math.floor(
      transformRpxToPx(headerHeight, windowWidth)
    );

    const handleScroll = useMemo(
      () =>
        throttle((event: any) => {
          let { scrollTop, scrollHeight } = event.detail;
          const min = 0,
            max = scrollHeight - (scrollViewHeightPx || 0);
          scrollTop = Math.max(Math.min(scrollTop, max), min);

          const newVisibleStart = Math.ceil(
            (scrollTop - headerHeightPx) / itemHeightPx
          );
          setVisibleStart(newVisibleStart);

          // 曝光index
          const exposureIndex = Math.floor(
            (scrollTop + scrollViewHeightPx - headerHeightPx) / itemHeightPx
          );
          onExposure?.(exposureIndex);
        }, 100),
      [headerHeightPx, itemHeightPx, scrollViewHeightPx]
    );

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
        const exposureIndex = Math.floor(
          (0 + scrollViewHeightPx - headerHeightPx) / itemHeightPx
        );
        onExposure?.(exposureIndex);
      }
    }, [data, scrollViewHeightPx, headerHeightPx, itemHeightPx]);

    return (
      <View>
        {/* before */}
        {renderHeader && (
          <View style={{ height: headerHeight }}>{renderHeader()}</View>
        )}
        <View
          style={{
            position: "relative",
            height: data.length * itemHeightPx + "PX",
            background:
              placeholderImage && `url("${placeholderImage}") repeat-y`,
            backgroundSize: placeholderImage && `100% ${itemHeightPx}PX`,
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              width: "100%",
              top: (start > 0 ? start : 0) * itemHeightPx + "PX",
            }}
          >
            {visibleData.map((item, index) => (
              <View style={{ height: `${itemHeightPx}PX` }} key={start + index}>
                {renderItem(item, index)}
              </View>
            ))}
          </View>
        </View>
        {/* after */}
        {renderBottom?.()}
      </View>
    );
  }
);

export default VirtualList;
