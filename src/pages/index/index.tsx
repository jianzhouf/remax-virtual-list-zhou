import React, { useMemo, useRef, useState } from "react";
import { View, Text, Image } from "remax/one";
import { ScrollView } from "remax/wechat";
import styles from "./index.css";
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
      >
        <VirtualList
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
          renderBottom={() => (
            <View className={styles.loading}>加载中。。</View>
          )}
        />
      </ScrollView>
    </View>
  );
};
