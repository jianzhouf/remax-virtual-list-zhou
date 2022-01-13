import React from "react";
export interface VirtualListProps {
    data: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    itemHeight?: number;
    onExposure?: (index: number) => void;
    scrollViewHeightPx?: number;
    overscanCount?: number;
    headerHeight?: number;
    renderHeader?: () => React.ReactNode;
    renderBottom?: () => React.ReactNode;
    placeholderImage?: string;
    windowWidth?: number;
}
export interface VirtualListMethods {
    onScroll(event: any): void;
}
declare const VirtualList: React.ForwardRefExoticComponent<VirtualListProps & React.RefAttributes<any>>;
export default VirtualList;
