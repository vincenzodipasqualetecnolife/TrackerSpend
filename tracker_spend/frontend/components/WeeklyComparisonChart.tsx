import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface WeeklyComparisonChartProps {
  data: any[];
  title: string;
  height?: number;
}

const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({ data, title, height = 300 }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 gradient-text">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Bar 
              dataKey="questaSettimana" 
              fill="#8A2BE2" 
              radius={[4, 4, 0, 0]}
              name="Questa Settimana"
            />
            <Bar 
              dataKey="settimanaScorsa" 
              fill="#A0A0B0" 
              radius={[4, 4, 0, 0]}
              name="Settimana Scorsa"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyComparisonChart;
