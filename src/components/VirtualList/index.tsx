import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { View } from "remax/one";
import { throttle, transformRpxToPx } from "./util";

export interface VirtualListProps {
  data: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscanCount?: number;
  headerHeight?: number;
  renderHeader?: () => React.ReactNode;
  renderBottom?: () => React.ReactNode;
  placeholderImage?: string;
  windowWidth?: number;
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
    },
    ref
  ) => {
    const [visibleStart, setVisibleStart] = useState(0);
    const { start, end } = useMemo(
      () => ({
        start: visibleStart - overscanCount,
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

    const handleScroll = useMemo(
      () =>
        throttle((event: any) => {
          const { scrollTop, scrollHeight } = event.detail;
          const start = Math.ceil((scrollTop - headerHeight) / itemHeightPx);
          setVisibleStart(start);
        }, 100),
      [headerHeight, itemHeightPx]
    );

    useImperativeHandle(ref, () => ({
      onScroll: handleScroll,
    }));

    useEffect(() => {
      return handleScroll.cancel;
    }, [handleScroll]);

    return (
      <View>
        {/* before */}
        {renderHeader && (
          <View
            className="recycle-view-header"
            style={{ height: headerHeight }}
          >
            {renderHeader()}
          </View>
        )}
        <View
          style={{
            position: "relative",
            height: data.length * itemHeightPx + "PX",
            background:
              placeholderImage && `url("${placeholderImage}") repeat-y`,
            backgroundSize: placeholderImage && "contain",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              width: "100%",
              top: (start > 0 ? start : 0) * itemHeightPx + "PX",
              background: "#fff",
            }}
          >
            {visibleData.map(renderItem)}
          </View>
        </View>
        {/* after */}
        {renderBottom?.()}
      </View>
    );
  }
);

export default VirtualList;
