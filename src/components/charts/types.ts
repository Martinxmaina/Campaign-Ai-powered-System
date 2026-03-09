export interface TeamKpi {
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
}

export interface ExecutiveBarChartProps<TData extends object> {
    title: string;
    subtitle?: string;
    data: TData[];
    xKey: keyof TData;
    yKey: keyof TData;
    valueLabel?: string;
    color?: string;
    horizontal?: boolean;
}

export interface ExecutiveLineChartSeries<TData extends object> {
    dataKey: keyof TData;
    label?: string;
    color?: string;
}

export interface ExecutiveLineChartProps<TData extends object> {
    title: string;
    subtitle?: string;
    data: TData[];
    xKey: keyof TData;
    series: ExecutiveLineChartSeries<TData>[];
    height?: number;
    showLegend?: boolean;
    xTickInterval?: number | "preserveStartEnd";
    xTickFormatter?: (value: string | number) => string;
    showVerticalGrid?: boolean;
    showHeader?: boolean;
}

