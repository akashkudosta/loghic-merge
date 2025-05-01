import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Sparkline = ({ data }) => {
  // Determine if the last value is positive or negative
  const isPositive = data.length > 0 && data[data.length - 1].value >= data[0].value;

  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={data}>
        <XAxis hide />
        <YAxis hide />
        {/* <Tooltip /> */}
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={isPositive ? "#008000" : "#ff0000"} // Green for positive, red for negative
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
