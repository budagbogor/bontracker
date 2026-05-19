import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Server, Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { testAiConnection } from '../lib/api';

export default function SettingsView() {
  const [provider, setProvider] = useState('sumopod');
  const [model, setModel] = useState('gemini/gemini-2.0-flash');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') || 'sumopod';
    const savedModel = localStorage.getItem('ai_model') || 'gemini/gemini-2.0-flash';
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

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult('error');
      setTestMessage('API Key wajib diisi');
      return;
    }
    if (!model.trim()) {
      setTestResult('error');
      setTestMessage('Pilih model terlebih dahulu');
      return;
    }

    handleSave();
    setIsTesting(true);
    setTestResult('idle');
    setTestMessage('');

    try {
      const result = await testAiConnection(apiKey, model, provider);
      if (result.success) {
        setTestResult('success');
        setTestMessage('Koneksi berhasil! Provider siap digunakan.');
      } else {
        setTestResult('error');
        setTestMessage(result.error || 'Koneksi gagal');
      }
    } catch (err: any) {
      setTestResult('error');
      setTestMessage(err.message || 'Gagal menghubungi server');
    } finally {
      setIsTesting(false);
    }
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
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Model AI */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1 flex items-center gap-1.5">
            <Cpu size={14} /> Model AI
          </label>
          <div className="relative">
            <select 
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setTestResult('idle');
              }}
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-sans"
            >
              <option value="">Pilih Model...</option>
              <optgroup label="🔥 Recommended (Vision Support)">
                <option value="gemini/gemini-2.0-flash">gemini/gemini-2.0-flash — $0.10/1M (Murah & Cepat)</option>
                <option value="gemini/gemini-2.5-flash">gemini/gemini-2.5-flash — $0.30/1M</option>
                <option value="gpt-4o-mini">gpt-4o-mini — $0.15/1M</option>
                <option value="gpt-4o">gpt-4o — $2.50/1M</option>
                <option value="gemini/gemini-2.5-pro">gemini/gemini-2.5-pro — $1.25/1M</option>
              </optgroup>
              <optgroup label="Gemini">
                <option value="gemini/gemini-2.0-flash-lite">gemini/gemini-2.0-flash-lite</option>
                <option value="gemini/gemini-2.5-flash-lite">gemini/gemini-2.5-flash-lite</option>
                <option value="gemini/gemini-3-flash-preview">gemini/gemini-3-flash-preview</option>
                <option value="gemini/gemini-3.1-flash-lite-preview">gemini/gemini-3.1-flash-lite-preview</option>
                <option value="gemini/gemini-3.1-pro-preview">gemini/gemini-3.1-pro-preview</option>
              </optgroup>
              <optgroup label="OpenAI">
                <option value="gpt-4.1">gpt-4.1</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                <option value="gpt-5">gpt-5</option>
                <option value="gpt-5-mini">gpt-5-mini</option>
                <option value="gpt-5-nano">gpt-5-nano</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="claude-haiku-4-5">claude-haiku-4-5</option>
                <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                <option value="claude-opus-4-6">claude-opus-4-6</option>
              </optgroup>
              <optgroup label="Lainnya">
                <option value="qwen3.6-flash">qwen3.6-flash</option>
                <option value="qwen3.6-plus">qwen3.6-plus</option>
                <option value="deepseek-v4-flash">deepseek-v4-flash</option>
                <option value="deepseek-v4-pro">deepseek-v4-pro</option>
                <option value="mimo-v2-flash">mimo-v2-flash</option>
                <option value="mimo-v2.5-pro">mimo-v2.5-pro</option>
                <option value="kimi-k2.6">kimi-k2.6</option>
              </optgroup>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1 flex items-center gap-1.5">
            <Key size={14} /> API Key
          </label>
          <input 
            type="password" 
            placeholder="Masukkan API Key dari Sumopod"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTestResult('idle');
            }}
            className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm" 
          />
          <p className="font-mono text-[10px] text-gray-400 mt-1 px-1">
            Dapatkan API Key di dashboard Sumopod → menu API Keys
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
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
              <span className="font-sans text-sm font-medium">{testMessage}</span>
            </div>
          )}
          
          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle size={18} />
              <span className="font-sans text-sm font-medium">{testMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-mono text-xs text-blue-700 font-bold mb-1">ℹ️ Cara Penggunaan</p>
        <ol className="font-sans text-xs text-blue-600 space-y-1 list-decimal list-inside">
          <li>Pilih provider (Sumopod recommended)</li>
          <li>Pilih model dengan dukungan Vision (gambar)</li>
          <li>Masukkan API Key dari dashboard provider</li>
          <li>Klik "Test Koneksi" untuk verifikasi</li>
          <li>Buka menu "Struk OCR" untuk scan bon</li>
        </ol>
      </div>
    </div>
  );
}
