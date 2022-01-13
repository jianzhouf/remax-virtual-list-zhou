import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image } from "remax/one";
import { ScrollView } from "remax/wechat";
import { useNativeEffect } from "remax";
import styles from "./index.css";
// import VirtualList from "../../../lib/index.esm.js";
import VirtualList from "@/components/VirtualList";

const mockData: any[] = [];
for (let i = 0; i < 1000; i++) {
  mockData.push({
    text: `第${i}项`,
  });
}

export default () => {
  const [data, setData] = useState(mockData.slice(0, 10));
  const ref = useRef<any>();
  const handleScroll = (e: any) => {
    ref.current?.onScroll(e);
  };

  const systemInfo = useMemo(() => {
    return wx.getSystemInfoSync();
  }, []);

  const [scrollViewHeightPx, setScrollViewHeightPx] = useState(0);
  useNativeEffect(() => {
    wx.createSelectorQuery()
      .select("#scroll-view")
      .boundingClientRect(function (rect) {
        // rect.id      // 节点的ID
        // rect.dataset // 节点的dataset
        // rect.left    // 节点的左边界坐标
        // rect.right   // 节点的右边界坐标
        // rect.top     // 节点的上边界坐标
        // rect.bottom  // 节点的下边界坐标
        // rect.width   // 节点的宽度
        // rect.height  // 节点的高度
        console.log(rect.height);
        setScrollViewHeightPx(rect.height);
      })
      .exec();
  }, [data]);
  return (
    <View className={styles.app}>
      <ScrollView
        onScrollToLower={() => {
          setTimeout(() => {
            setData(data.concat(mockData.slice(data.length, data.length + 10)));
          }, 100);
        }}
        style={{ height: "100vh" }}
        scrollY
        onScroll={handleScroll}
        lowerThreshold={1050}
        id="scroll-view"
      >
        <VirtualList
          scrollViewHeightPx={scrollViewHeightPx}
          windowWidth={systemInfo.windowWidth}
          ref={ref}
          data={data}
          placeholderImage="https://gw.alicdn.com/tfs/TB18fUJCxD1gK0jSZFyXXciOVXa-750-656.png"
          itemHeight={300}
          renderItem={(item, index) => (
            <View key={item.text} style={{ height: 300 }}>
              {item.text}
            </View>
          )}
          onExposure={(index) => {
            console.log("Exposure", index);
          }}
          renderBottom={() => (
            <View className={styles.loading}>加载中。。</View>
          )}
        />
      </ScrollView>
    </View>
  );
};
