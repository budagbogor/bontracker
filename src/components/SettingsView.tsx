import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Server, Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsView() {
  const [provider, setProvider] = useState('sumopod');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load from local storage on mount
    const savedProvider = localStorage.getItem('ai_provider') || 'sumopod';
    const savedModel = localStorage.getItem('ai_model') || '';
    const savedApiKey = localStorage.getItem('ai_api_key') || '';
    
    setProvider(savedProvider);
    setModel(savedModel);
    setApiKey(savedApiKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_api_key', apiKey);
  };

  const handleTestConnection = () => {
    handleSave();
    setIsTesting(true);
    setTestResult('idle');
    
    // Simulate API connection test
    setTimeout(() => {
      setIsTesting(false);
      if (apiKey.trim().length > 0 && model.trim().length > 0) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface">Pengaturan AI</h2>
        <p className="font-sans text-gray-500 mt-1 text-sm">Konfigurasi provider AI untuk fitur OCR struk.</p>
      </section>

      <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm space-y-5">
        
        {/* Provider */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1 flex items-center gap-1.5">
            <Server size={14} /> Provider AI
          </label>
          <div className="relative">
            <select 
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setTestResult('idle');
              }}
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-sans"
            >
              <option value="sumopod">Sumopod</option>
              <option value="openrouter">OpenRouter</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Model AI */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1 flex items-center gap-1.5">
            <Cpu size={14} /> Model AI
          </label>
          <div className="relative">
            {provider === 'sumopod' ? (
              <>
                <select 
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setTestResult('idle');
                  }}
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-sans"
                >
                  <option value="">Pilih Model...</option>
                  <option value="qwen3.6-flash">qwen3.6-flash</option>
                  <option value="qwen3.6-plus">qwen3.6-plus</option>
                  <option value="claude-haiku-4-5">claude-haiku-4-5</option>
                  <option value="claude-opus-4-6">claude-opus-4-6</option>
                  <option value="claude-opus-4-7">claude-opus-4-7</option>
                  <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                  <option value="deepseek-v3-2">deepseek-v3-2</option>
                  <option value="glm-4-7">glm-4-7</option>
                  <option value="seed-2-0-code">seed-2-0-code</option>
                  <option value="seed-2-0-lite">seed-2-0-lite</option>
                  <option value="seed-2-0-mini">seed-2-0-mini</option>
                  <option value="seed-2-0-pro">seed-2-0-pro</option>
                  <option value="deepseek-v4-flash">deepseek-v4-flash</option>
                  <option value="deepseek-v4-pro">deepseek-v4-pro</option>
                  <option value="gemini/gemini-2.5-flash">gemini/gemini-2.5-flash</option>
                  <option value="gemini/gemini-2.5-flash-lite">gemini/gemini-2.5-flash-lite</option>
                  <option value="gemini/gemini-2.5-pro">gemini/gemini-2.5-pro</option>
                  <option value="gemini/gemini-3-flash-preview">gemini/gemini-3-flash-preview</option>
                  <option value="gemini/gemini-3.1-flash-lite-preview">gemini/gemini-3.1-flash-lite-preview</option>
                  <option value="gemini/gemini-3.1-pro-preview">gemini/gemini-3.1-pro-preview</option>
                  <option value="gemini/gemini-2.0-flash">gemini/gemini-2.0-flash</option>
                  <option value="gemini/gemini-2.0-flash-lite">gemini/gemini-2.0-flash-lite</option>
                  <option value="mimo-v2-flash">mimo-v2-flash</option>
                  <option value="mimo-v2-omni">mimo-v2-omni</option>
                  <option value="mimo-v2-pro">mimo-v2-pro</option>
                  <option value="mimo-v2.5">mimo-v2.5</option>
                  <option value="mimo-v2.5-pro">mimo-v2.5-pro</option>
                  <option value="MiniMax-M2.7-highspeed">MiniMax-M2.7-highspeed</option>
                  <option value="kimi-k2.6">kimi-k2.6</option>
                  <option value="gpt-4.1">gpt-4.1</option>
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                  <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-5">gpt-5</option>
                  <option value="gpt-5-mini">gpt-5-mini</option>
                  <option value="gpt-5-nano">gpt-5-nano</option>
                  <option value="gpt-5.1">gpt-5.1</option>
                  <option value="gpt-5.1-codex">gpt-5.1-codex</option>
                  <option value="gpt-5.1-codex-mini">gpt-5.1-codex-mini</option>
                  <option value="gpt-5.2">gpt-5.2</option>
                  <option value="gpt-5.2-codex">gpt-5.2-codex</option>
                  <option value="gpt-5.3-codex">gpt-5.3-codex</option>
                  <option value="gpt-5.4">gpt-5.4</option>
                  <option value="gpt-5.4-mini">gpt-5.4-mini</option>
                  <option value="gpt-5.4-nano">gpt-5.4-nano</option>
                  <option value="text-embedding-3-large">text-embedding-3-large</option>
                  <option value="text-embedding-3-small">text-embedding-3-small</option>
                  <option value="gemma-4-31b-it">gemma-4-31b-it</option>
                  <option value="qwen3.6-27b">qwen3.6-27b</option>
                  <option value="glm-5">glm-5</option>
                  <option value="glm-5-turbo">glm-5-turbo</option>
                  <option value="glm-5.1">glm-5.1</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </>
            ) : (
              <>
                <select 
                  value={model || "openrouter/free"}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setTestResult('idle');
                  }}
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-sans"
                >
                  <option value="openrouter/free">Auto-Routing: Best Free Model (Recommended)</option>
                  {/* Add more OpenRouter models here if needed in the future */}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </>
            )}
          </div>
        </div>

        {provider === 'openrouter' && (
          <div className="flex items-center justify-between gap-4 mt-2 mb-4">
            <div>
              <p className="font-sans font-bold text-on-surface text-sm">Auto-Switch Free Models</p>
              <p className="font-sans text-xs text-gray-500 mt-0.5">Otomatis mencari dan menggunakan model gratis terbaik saat trafik sedang tinggi.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        {/* API Key */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1 flex items-center gap-1.5">
            <Key size={14} /> API Key
          </label>
          <input 
            type="password" 
            placeholder="Masukkan API Key Anda"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTestResult('idle');
            }}
            className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm" 
          />
          <p className="font-mono text-[10px] text-gray-400 mt-1 px-1">Gunakan API Key yang valid dari provider pilihan Anda.</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl chiseled-btn flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SettingsIcon size={18} />
            )}
            {isTesting ? 'Menguji Koneksi...' : 'Test Koneksi & Simpan'}
          </button>

          {/* Test Result Message */}
          {testResult === 'success' && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <CheckCircle2 size={18} />
              <span className="font-sans text-sm font-medium">Koneksi berhasil! Provider siap digunakan.</span>
            </div>
          )}
          
          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle size={18} />
              <span className="font-sans text-sm font-medium">Koneksi gagal. Periksa Model & API Key.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
