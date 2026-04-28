import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ 
  data, 
  color, 
  width = 80, 
  height = 32 
}) => {
  const chartData = data.map((val, index) => ({ value: val, index }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
