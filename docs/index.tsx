import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Search, 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  CloudRain, 
  Cloud, 
  ArrowDown, 
  ArrowUp, 
  Compass, 
  Gauge, 
  Eye,
  MapPin,
  Activity,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

// --- Types ---
interface DailyForecast {
  date: Date;
  lowTemp: number;
  highTemp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';
  precipitation: number;
}

interface WeatherReportData {
  location: string;
  coordinates: { lat: string; long: string };
  generatedAt: Date;
  reportId: string;
  current: {
    temp: number;
    feelsLike: number;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';
    humidity: number;
    windSpeed: number;
    windDir: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    dewPoint: number;
  };
  forecast: DailyForecast[];
}

// --- Mock Data Generation ---
// Deterministic pseudo-random based on string to make same location give same results roughly
const pseudoRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash) * 10000) % 1;
};

const generateMockData = (location: string): WeatherReportData => {
  const rng = () => pseudoRandom(location + Math.random()); // Add some true random for generating different reports on re-click if desired, or remove Math.random() for static.
  
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'] as const;
  const baseTemp = 15 + (rng() * 20); // 15C to 35C base

  const currentCondition = conditions[Math.floor(rng() * conditions.length)];

  const forecast: DailyForecast[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    const dayRng = pseudoRandom(location + i);
    return {
      date,
      lowTemp: Math.floor(baseTemp - 5 - (dayRng * 5)),
      highTemp: Math.floor(baseTemp + (dayRng * 5)),
      condition: conditions[Math.floor(dayRng * conditions.length)],
      precipitation: Math.floor(dayRng * 100),
    };
  });

  return {
    location: location.charAt(0).toUpperCase() + location.slice(1),
    coordinates: {
      lat: (Math.floor(rng() * 180) - 90).toFixed(4),
      long: (Math.floor(rng() * 360) - 180).toFixed(4),
    },
    generatedAt: new Date(),
    reportId: `RPT-${Math.floor(rng() * 1000000).toString().padStart(6, '0')}`,
    current: {
      temp: Math.floor(baseTemp),
      feelsLike: Math.floor(baseTemp + (rng() * 4) - 2),
      condition: currentCondition,
      humidity: Math.floor(40 + (rng() * 50)),
      windSpeed: Math.floor(rng() * 30),
      windDir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(rng() * 8)],
      pressure: Math.floor(980 + (rng() * 40)),
      visibility: Math.floor(5 + (rng() * 15)),
      uvIndex: Math.floor(rng() * 11),
      dewPoint: Math.floor(baseTemp - (rng() * 10)),
    },
    forecast,
  };
};

// --- Icons Helper ---
const WeatherIcon = ({ condition, className = "" }: { condition: string, className?: string }) => {
  switch (condition) {
    case 'Sunny': return <Sun className={`text-amber-500 ${className}`} />;
    case 'Rainy': return <CloudRain className={`text-blue-500 ${className}`} />;
    case 'Cloudy': return <Cloud className={`text-slate-500 ${className}`} />;
    case 'Partly Cloudy': default: return <Sun className={`text-slate-400 ${className}`} />;
  }
};


export default function VacationWeather() {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [data, setData] = useState<WeatherReportData | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setStatus('loading');
    // Simulate network request
    setTimeout(() => {
      setData(generateMockData(inputValue));
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 md:p-8">
      <Head>
        <title>Vacation Weather | Scientific Report</title>
      </Head>

      <main className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 text-center md:text-left md:flex md:justify-between md:items-end">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-700 mb-2">
              <Activity className="w-6 h-6" />
              <h1 className="text-xl font-bold tracking-tight uppercase">Vacation Weather OS</h1>
            </div>
            <p className="text-slate-500 text-sm">Climatological Data Generator v2.4.1</p>
          </div>
        </header>

        {/* Search Interface */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <label htmlFor="location" className="sr-only">Location Name</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                id="location"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter designated location (e.g., 'Kyoto', 'Maui')"
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                disabled={status === 'loading'}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !inputValue.trim()}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-3 px-8 rounded-lg transition-all active:scale-95"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </span>
              ) : (
                <><Search className="w-5 h-5" /> Generate Report</>
              )}
            </button>
          </form>
        </section>

        {/* Report Area */}
        {status === 'idle' && (
          <div className="text-center py-20 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-300">
            <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Awaiting location input for analysis.</p>
          </div>
        )}

        {status === 'success' && data && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Report Header Meta */}
            <div className="flex flex-wrap justify-between items-center text-xs font-mono text-slate-500 mb-2 px-1">
               <span>ID: {data.reportId}</span>
               <span>{format(data.generatedAt, "yyyy-MM-dd HH:mm:ss 'UTC'")}</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Location & Main Status */}
              <div className="p-6 md:p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      {data.location}
                    </h2>
                    <p className="font-mono text-sm text-slate-500 flex items-center gap-2">
                      LAT: {data.coordinates.lat}° N &nbsp; LONG: {data.coordinates.long}° E
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <WeatherIcon condition={data.current.condition} className="w-12 h-12 md:w-16 md:h-16" />
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter">
                        {data.current.temp}°<span className="text-2xl md:text-3xl text-slate-500 font-normal">C</span>
                      </div>
                      <p className="text-slate-600 font-medium">{data.current.condition}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scientific Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b border-slate-100 bg-slate-50/50">
                <MetricItem 
                  icon={<Thermometer size={18} />}
                  label="Feels Like"
                  value={`${data.current.feelsLike}°C`}
                />
                <MetricItem 
                  icon={<Droplets size={18} />}
                  label="Humidity"
                  value={`${data.current.humidity}%`}
                />
                 <MetricItem 
                  icon={<Wind size={18} />}
                  label="Wind"
                  value={`${data.current.windSpeed} km/h ${data.current.windDir}`}
                />
                <MetricItem 
                  icon={<Sun size={18} />}
                  label="UV Index"
                  value={data.current.uvIndex.toString()}
                  warning={data.current.uvIndex > 7}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-b border-slate-100 bg-slate-50/50">
                <MetricItem 
                  icon={<Gauge size={18} />}
                  label="Pressure"
                  value={`${data.current.pressure} hPa`}
                />
                <MetricItem 
                  icon={<Eye size={18} />}
                  label="Visibility"
                  value={`${data.current.visibility} km`}
                />
                 <MetricItem 
                  icon={<Droplets size={18} />}
                  label="Dew Point"
                  value={`${data.current.dewPoint}°C`}
                />
                <div className="p-4 flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Activity size={14} /> Status
                    </span>
                    <span className="font-mono text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                      NORMAL
                    </span>
                </div>
              </div>

              {/* Forecast Section */}
              <div className="p-6 md:p-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  7-Day Prognosis
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200 font-mono">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Condition</th>
                        <th className="px-4 py-3 font-medium text-right">Low</th>
                        <th className="px-4 py-3 font-medium"></th>
                        <th className="px-4 py-3 font-medium">High</th>
                        <th className="px-4 py-3 font-medium text-right">Precip%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.forecast.map((day, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">
                            {format(day.date, 'EEE, MMM d')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap flex items-center gap-2">
                            <WeatherIcon condition={day.condition} className="w-5 h-5" />
                            <span className="hidden md:inline">{day.condition}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right font-mono text-slate-500">
                            {day.lowTemp}°
                          </td>
                          <td className="px-4 py-4 min-w-[100px]">
                            {/* Temperature Bar Visualization */}
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-400 opacity-70"
                                  style={{
                                    marginLeft: `${Math.min(100, Math.max(0, (day.lowTemp) * 2))}%`,
                                    width: `${Math.min(100, Math.max(10, (day.highTemp - day.lowTemp) * 3))}%`
                                  }}
                                />
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-mono font-medium text-slate-900">
                            {day.highTemp}°
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right font-mono">
                            <span className={`${day.precipitation > 50 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                              {day.precipitation}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-component for grid metrics to keep main render clean
function MetricItem({ icon, label, value, warning = false }: { icon: React.ReactNode, label: string, value: string, warning?: boolean }) {
  return (
    <div className="p-4 flex flex-col justify-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon} {label}
      </span>
      <span className={`font-mono text-base md:text-lg font-medium ${warning ? 'text-amber-600' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}
