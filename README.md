# remax 虚拟滚动列表组件（暂时只支持微信，支付宝没测试）
只支持等高项的列表

## Install

```
npm install remax-virtual-list-zhou --save-dev
# or 
yarn add -D remax-virtual-list-zhou
```

## Usage

```tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image } from "remax/one";
import { ScrollView } from "remax/wechat";
import { useNativeEffect } from "remax";
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

  const [scrollViewHeightPx, setScrollViewHeightPx] = useState(0);
  useNativeEffect(() => {
    wx.createSelectorQuery()
      .select("#scroll-view")
      .boundingClientRect(function (rect) {
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
        lowerThreshold={350}
        id="scroll-view"
      >
        <VirtualList
          scrollViewHeightPx={scrollViewHeightPx}
          windowWidth={systemInfo.windowWidth}
          placeholderImage="https://sl-online-oss.shulidata.com/jiyang/wechat/placeImage.png"
          ref={ref}
          data={data}
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

```


## Options
| Option             | type     | default | desc                                                                      |
| ------------------ | -------- | ------- | ------------------------------------------------------------------------- |
| windowWidth        | number   | 无      | 必填，可使用窗口宽度，单位px ,通过wx.getSystemInfoSync()获取,用于单位转换 |
| data               | array    | []      | 必填，列表数据                                                            |
| renderItem         | function | 无      | 必填，每一项的渲染方法                                                    |
| placeholderImage   | string   | 无      | 建议填，占位图片                                                          |
| overscanCount      | number   | 12      | 一屏数量，默认共显示3*12项                                                |
| headerHeight       | number   | 无      | 渲染列表头部时必填                                                        |
| renderHeader       | function | 无      | 渲染列表头部                                                              |
| renderBottom       | function | 无      | 渲染列表底部                                                              |
| onExposure         | function | 无      | 曝光方法，(index)=>{} ,index从0开始，数组下标                             |
| scrollViewHeightPx | function | 无      | 单位px，曝光方法必要参数                                                  |

