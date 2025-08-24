import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface TrendChartProps {
  data: any[];
  title: string;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, title, height = 300 }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 gradient-text">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A0A0B0" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#A0A0B0' }} 
              axisLine={false} 
              tickLine={false}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: '#A0A0B0' }} 
              axisLine={false} 
              tickLine={false}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#2C2C3A', 
                border: 'none', 
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: '#A0A0B0', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: '#A0A0B0' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="spese" 
              stroke="#FF6B6B" 
              strokeWidth={3}
              dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#FF6B6B', strokeWidth: 2 }}
              name="Spese"
            />
            <Line 
              type="monotone" 
              dataKey="entrate" 
              stroke="#4CAF50" 
              strokeWidth={3}
              dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2 }}
              name="Entrate"
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#8A2BE2" 
              strokeWidth={3}
              dot={{ fill: '#8A2BE2', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8A2BE2', strokeWidth: 2 }}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
