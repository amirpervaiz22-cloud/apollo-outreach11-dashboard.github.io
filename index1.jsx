\import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Mail, 
  Star, 
  Upload, 
  LogOut, 
  Lock, 
  User, 
  BarChart3, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

// --- Constants & Config ---
const APP_TITLE = "Apollo Medical Billing";
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "apollo_billing_2024" // In a real app, this would be handled by a secure backend/auth provider
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard Data State
  const [data, setData] = useState({
    totalCalls: 2143,
    gatekeepers: 657,
    decisionMakers: 13,
    totalEmails: 3245,
    emailsOpened: 452,
    emailResponses: 0,
    highlights: ["Contact established with 2 DME companies and they will give time for zoom meeting."]
  });

  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  // --- Auth Logic ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_CREDENTIALS.username && loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: '', password: '' });
  };

  // --- Data Processing ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Please upload a valid CSV file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        
        // Expected CSV structure (Example):
        // totalCalls,gatekeepers,decisionMakers,totalEmails,emailsOpened,emailResponses,highlights
        // 2500,800,20,4000,600,5,"Highlights text here"
        
        if (rows.length < 2) throw new Error("CSV file is empty or malformed.");
        
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const values = rows[1].map(v => v.trim());

        const getVal = (key) => {
          const index = headers.indexOf(key.toLowerCase());
          return index !== -1 ? values[index] : null;
        };

        const newData = {
          totalCalls: parseInt(getVal('totalCalls')) || data.totalCalls,
          gatekeepers: parseInt(getVal('gatekeepers')) || data.gatekeepers,
          decisionMakers: parseInt(getVal('decisionMakers')) || data.decisionMakers,
          totalEmails: parseInt(getVal('totalEmails')) || data.totalEmails,
          emailsOpened: parseInt(getVal('emailsOpened')) || data.emailsOpened,
          emailResponses: parseInt(getVal('emailResponses')) || data.emailResponses,
          highlights: getVal('highlights') ? [getVal('highlights')] : data.highlights
        };

        setData(newData);
        setUploadStatus({ type: 'success', message: 'Data updated successfully from CSV!' });
        setTimeout(() => setActiveTab('dashboard'), 1500);
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Failed to parse CSV. Check your format.' });
      }
    };
    reader.readAsText(file);
  };

  // --- Computed Metrics ---
  const metrics = useMemo(() => ({
    callPenetration: ((data.gatekeepers / data.totalCalls) * 100).toFixed(1),
    dmConversion: ((data.decisionMakers / data.totalCalls) * 100).toFixed(1),
    emailOpenRate: ((data.emailsOpened / data.totalEmails) * 100).toFixed(1),
    emailReplyRate: ((data.emailResponses / data.totalEmails) * 100).toFixed(1),
  }), [data]);

  // --- Components ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{APP_TITLE}</h1>
            <p className="text-slate-400 mt-2">Sign in to access outreach analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-3 rounded-lg border border-rose-400/20 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">Internal Access Only. Unauthorized attempts are logged.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight">Apollo Pro</span>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Import Data</span>
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 md:p-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-widest">Analytics Overview</h2>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Weekly Performance' : 'Data Management'}
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Metrics</span>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Call Stats Card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                      <Phone className="text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Call Outreach</h3>
                      <p className="text-slate-500 text-sm">Volume & Conversion</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                      {data.totalCalls.toLocaleString()}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Attempted</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-semibold text-slate-300">Answered by Gatekeepers</span>
                      <span className="text-lg font-bold text-white">{data.gatekeepers.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${metrics.callPenetration}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      {metrics.callPenetration}% penetration rate across segments
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-semibold text-slate-300">Decision Makers (DMs) Reached</span>
                      <span className="text-lg font-bold text-emerald-400">{data.decisionMakers.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.max(2, metrics.dmConversion * 5)}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {metrics.dmConversion}% conversion from total volume
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Stats Card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl">
                      <Mail className="text-purple-400 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Email Performance</h3>
                      <p className="text-slate-500 text-sm">Engagement Metrics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">
                      {data.totalEmails.toLocaleString()}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Sent</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-semibold text-slate-300">Campaign Open Rate</span>
                      <span className="text-lg font-bold text-white">{data.emailsOpened.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${metrics.emailOpenRate}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-purple-500" />
                      {metrics.emailOpenRate}% active interest from prospects
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-semibold text-slate-300">Initial Responses</span>
                      <span className="text-lg font-bold text-rose-400">{data.emailResponses}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${metrics.emailReplyRate}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      Pending replies to outreach campaigns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-24 h-24 text-blue-500 fill-blue-500" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Critical Wins & Highlights</h3>
              </div>
              
              <div className="space-y-4">
                {data.highlights.map((highlight, idx) => (
                  <div key={idx} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2.5 shrink-0"></div>
                    <p className="text-slate-300 text-lg leading-relaxed font-medium italic">
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 backdrop-blur-sm">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Import Weekly Metrics</h3>
                <p className="text-slate-400 text-sm">Upload a CSV file to update the dashboard metrics. The file must contain the headers: totalCalls, gatekeepers, decisionMakers, totalEmails, emailsOpened, emailResponses, highlights.</p>
              </div>

              <div 
                className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative"
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('csv-upload').click()}
              >
                <input 
                  id="csv-upload" 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
                <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-slate-400 w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Click or drag to upload CSV</h4>
                <p className="text-slate-500 text-sm">Max file size: 5MB</p>
              </div>

              {uploadStatus.message && (
                <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${uploadStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {uploadStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">{uploadStatus.message}</span>
                </div>
              )}

              <div className="mt-10 pt-10 border-t border-slate-800">
                <h4 className="font-semibold mb-4 text-slate-300">Format Guide</h4>
                <div className="bg-slate-950 p-4 rounded-xl overflow-x-auto">
                  <code className="text-blue-400 text-sm whitespace-nowrap">
                    totalCalls, gatekeepers, decisionMakers, totalEmails, emailsOpened, emailResponses, highlights<br/>
                    2143, 657, 13, 3245, 452, 0, "Contact established with 2 DME companies..."
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-slate-500 text-xs">
            &copy; 2024 {APP_TITLE} • Enterprise Outreach Tracking Engine
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;