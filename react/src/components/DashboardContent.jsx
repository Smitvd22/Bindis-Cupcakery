import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, MoreVertical, HelpCircle, Chrome, Globe2 } from 'lucide-react';

const revenueData = [
  { month: 'Jan', earning: 32, expense: 15 },
  { month: 'Feb', earning: 62, expense: 30 },
  { month: 'Mar', earning: 100, expense: 45 },
  { month: 'Apr', earning: 90, expense: 45 },
  { month: 'May', earning: 35, expense: 20 },
  { month: 'Jun', earning: 22, expense: 15 },
  { month: 'Jul', earning: 58, expense: 30 },
  { month: 'Aug', earning: 75, expense: 35 },
  { month: 'Sep', earning: 25, expense: 15 }
];

const profitData = [
  { month: 'Apr', value: 4200 },
  { month: 'May', value: 4000 },
  { month: 'Jun', value: 4800 },
  { month: 'Jul', value: 4600 },
  { month: 'Aug', value: 5200 },
  { month: 'Sep', value: 5600 }
];

const browserData = [
  { name: 'Google Chrome', value: 54.4, color: '#4285F4', icon: Chrome },
  { name: 'Mozilla Firefox', value: 6.1, color: '#FF6B6B', icon: Globe2 },
  { name: 'Apple Safari', value: 14.6, color: '#4D9BF5', icon: Globe2 },
  { name: 'Internet Explorer', value: 4.2, color: '#0076D6', icon: Globe2 },
  { name: 'Opera Mini', value: 8.4, color: '#FF1B1B', icon: Globe2 }
];

const transactions = [
  { name: 'Wallet', subtext: 'Starbucks', amount: -74, icon: '👛' },
  { name: 'Bank transfer', subtext: 'Add money', amount: 480, icon: '🏦' },
  { name: 'Paypal', subtext: 'Add money', amount: 590, icon: '💳' },
  { name: 'Master card', subtext: 'Ordered food', amount: -23, icon: '💳' }
];

export default function DashboardContent() {
  return (
    <div className="p-4 h-screen">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Orders Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h2 className="text-gray-500 text-sm">Orders</h2>
            <p className="text-2xl font-bold">2,56k</p>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div
                key={i}
                className="h-12 w-3 bg-yellow-400 rounded"
                style={{ opacity: 0.5 + i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h2 className="text-gray-500 text-sm">Profit</h2>
            <p className="text-2xl font-bold">6,25k</p>
          </div>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={profitData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00BCD4" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div>
            <h2 className="text-gray-500 text-sm">Earnings</h2>
            <p className="text-2xl font-bold">$4,055.56</p>
            <p className="text-xs text-gray-500 mt-1">
              68.2% more earnings than last month.
            </p>
          </div>
          <div className="mt-2 flex justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-yellow-400 border-r-cyan-400" />
          </div>
        </div>
      </div>

      {/* Revenue Report */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Revenue Report</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Earning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Expense</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="earning" fill="#818CF8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#FCD34D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Browser States */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold">Browser States</h2>
              <p className="text-xs text-gray-500">Counter April 2021</p>
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {browserData.map((browser) => (
              <div key={browser.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <browser.icon className="w-4 h-4" style={{ color: browser.color }} />
                  <span className="text-sm">{browser.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{browser.value}%</span>
                  <div 
                    className="w-12 h-1 rounded"
                    style={{ backgroundColor: browser.color, opacity: 0.3 }}
                  >
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: `${browser.value}%`, 
                        backgroundColor: browser.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Overview */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold">Goal Overview</h2>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full border-4 border-gray-100">
                <div 
                  className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-green-500"
                  style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                    transform: 'rotate(298deg)'
                  }}
                />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold">83%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs">
            <div>
              <p className="font-medium">Completed</p>
              <p className="text-gray-500">786,617</p>
            </div>
            <div>
              <p className="font-medium">In Progress</p>
              <p className="text-gray-500">13,561</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold">Transactions</h2>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{transaction.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{transaction.subtext}</p>
                  </div>
                </div>
                <span className={`text-sm ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''} ${Math.abs(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}