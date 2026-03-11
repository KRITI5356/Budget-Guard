/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Trash2, TrendingUp } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];

interface Expense {
  id: number;
  name: string;
  value: number;
  plannedValue: number;
  category: string;
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, name: 'Lunch', value: 150, plannedValue: 200, category: 'Food' },
    { id: 2, name: 'Bus Fare', value: 40, plannedValue: 50, category: 'Travel' },
    { id: 3, name: 'Coffee', value: 30, plannedValue: 40, category: 'Food' },
    { id: 4, name: 'T-Shirt', value: 499, plannedValue: 600, category: 'Shopping' },
    { id: 5, name: 'Jio Recharge', value: 299, plannedValue: 300, category: 'Mobile Recharge' },
    { id: 6, name: 'Room Rent', value: 5000, plannedValue: 5000, category: 'Rent' },
  ]);

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [dailyBudget, setDailyBudget] = useState<number>(7000);
  const [aiTips, setAiTips] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = ['Food', 'Travel', 'Study', 'Social', 'Shopping', 'Mobile Recharge', 'Rent', 'Other'];
  const totalExpense = expenses.reduce((sum, item) => sum + item.value, 0);
  const totalPlanned = expenses.reduce((sum, item) => sum + item.plannedValue, 0);
  const totalSaved = totalPlanned - totalExpense;
  
  const savings = dailyBudget - totalExpense;
  const budgetUsagePercent = Math.min((totalExpense / dailyBudget) * 100, 100);
  const isOverBudget = totalExpense > dailyBudget;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newValue || !newPlanned) return;
    
    const newExpense: Expense = {
      id: Date.now(),
      name: newName,
      value: parseFloat(newValue),
      plannedValue: parseFloat(newPlanned),
      category: newCategory,
    };
    
    setExpenses([...expenses, newExpense]);
    setNewName('');
    setNewValue('');
    setNewPlanned('');
  };

  const handleRemoveExpense = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleResetDay = () => {
    if (window.confirm('Are you sure you want to clear all records for today?')) {
      setExpenses([]);
      setAiTips('');
    }
  };

  const handleGetTips = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const expenseSummary = expenses.map(e => `${e.name} (${e.category}): ₹${e.value}`).join(', ');
      const prompt = `I am a student with a strict daily limit of ₹${dailyBudget}. 
      Today's spending log: ${expenseSummary}. 
      Total spent: ₹${totalExpense}. 
      Remaining/Over: ₹${savings}. 
      ${isOverBudget ? "CRITICAL: I have exceeded my limit!" : "I am currently within my limit."}
      
      Please provide:
      1. A brief analysis of where my money went.
      2. 3 specific tips to stay under my ₹${dailyBudget} limit tomorrow.
      3. One "Student Hack" for saving in my highest category.
      
      Use markdown for formatting. All currency should be in ₹.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a strict but helpful student budget coach. You focus on helping students stick to their daily limits in Indian Rupees (₹).",
        }
      });

      setAiTips(response.text || "I couldn't generate tips right now. Try adding more expense details!");
    } catch (error) {
      console.error("Error generating AI tips:", error);
      setAiTips("Sorry, I encountered an error while analyzing your budget. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-gray-800">
        {/* Over Budget Alert Banner */}
        {isOverBudget && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 bg-red-600 text-white rounded-[2rem] shadow-2xl flex flex-col gap-6 border-4 border-red-400/30"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                  <TrendingUp className="w-8 h-8 rotate-180" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Budget Warning!</h3>
                  <p className="text-red-100 font-medium">You have exceeded your ₹{dailyBudget} limit by <span className="font-black underline">₹{Math.abs(savings).toFixed(2)}</span></p>
                </div>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-2xl font-black text-2xl">
                STOP SPENDING!
              </div>
            </div>

            <div className="bg-black/20 p-5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={16} />
                Emergency Saving Tips
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-red-50">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  Avoid any non-essential shopping for the next 48 hours.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  Opt for home-cooked meals instead of ordering in.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  Use public transport or walk for short distances.
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Header & Limit Setting */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <TrendingUp className="text-white w-8 h-8" />
              </div>
              Budget Guard
            </h1>
            <p className="mt-2 text-gray-500 font-medium">Daily Spending & Limit Tracker</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Set Daily Limit</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">₹</span>
                <input 
                  type="number" 
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(parseFloat(e.target.value) || 0)}
                  className="w-24 text-2xl font-black text-blue-600 focus:outline-none bg-transparent"
                />
              </div>
            </div>
            <button 
              onClick={handleResetDay}
              className="p-4 bg-white text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 shadow-sm transition-colors"
              title="Reset Day"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Daily Log Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-1"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Today's Log</h2>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isOverBudget ? 'Limit Exceeded' : 'Safe Zone'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</span>
                <div className={`text-2xl font-black mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                  ₹{totalExpense.toFixed(2)}
                </div>
              </div>
              <div className={`p-5 rounded-2xl border ${savings >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {savings >= 0 ? 'Remaining' : 'Over Limit'}
                </span>
                <div className={`text-2xl font-black mt-1 ${savings >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  ₹{Math.abs(savings).toFixed(2)}
                </div>
              </div>
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Saved</span>
                <div className={`text-2xl font-black mt-1 ${totalSaved >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  ₹{totalSaved.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <span>Usage of ₹{dailyBudget} Limit</span>
                <span className={isOverBudget ? 'text-red-500' : 'text-blue-600'}>{budgetUsagePercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsagePercent}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                />
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="What did you buy?" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase px-2">Spent</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={newValue} 
                      onChange={(e) => setNewValue(e.target.value)}
                      className="p-4 pl-8 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase px-2">Planned</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="Budget" 
                      value={newPlanned} 
                      onChange={(e) => setNewPlanned(e.target.value)}
                      className="p-4 pl-8 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium w-full"
                    />
                  </div>
                </div>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="col-span-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-black active:scale-[0.98] transition-all shadow-lg">
                <Plus size={18} />
                Add to Log
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((expense, index) => {
                const itemSaved = expense.plannedValue - expense.value;
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={expense.id} 
                    className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{expense.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{expense.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-sm">₹{expense.value}</p>
                        <p className={`text-[10px] font-bold uppercase ${itemSaved >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {itemSaved >= 0 ? `Saved ₹${itemSaved.toFixed(2)}` : `Over ₹${Math.abs(itemSaved).toFixed(2)}`}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveExpense(expense.id)} 
                        className="text-gray-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Visualization Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold text-gray-900">Visual Breakdown</h2>
              <div className="flex gap-2">
                {categories.map((cat, i) => (
                  <div key={cat} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
              <div className="h-full min-h-[350px] flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={expenses} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={110} 
                      paddingAngle={10} 
                      dataKey="value"
                      stroke="none"
                    >
                      {expenses.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                      formatter={(value: number) => [`₹${value}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-3xl font-black text-gray-900">₹{totalExpense}</p>
                </div>
              </div>

              <div className="h-full min-h-[350px] flex flex-col items-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={expenses} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                     <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                     <YAxis tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                     <RechartsTooltip 
                       cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                       formatter={(value: number) => [`₹${value}`, 'Amount']}
                     />
                     <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                       {expenses.map((_, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Guard Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-400 rounded-xl">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">AI Budget Coach</h2>
              </div>
              
              <p className="text-gray-500 text-lg mb-8 font-medium">
                Get a personalized analysis of your daily spending habits and learn how to stay under your <span className="text-blue-600 font-bold">₹{dailyBudget}</span> limit.
              </p>
              
              {aiTips && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-gray-700 prose prose-slate max-w-none"
                >
                  <ReactMarkdown>{aiTips}</ReactMarkdown>
                </motion.div>
              )}
            </div>

            <button 
              onClick={handleGetTips} 
              disabled={isGenerating || expenses.length === 0}
              className="group whitespace-nowrap bg-blue-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 flex items-center gap-3 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze My Day
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
