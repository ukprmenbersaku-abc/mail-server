
import React, { useState, useEffect } from 'react';
import { Cloud, Settings, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import AIComposer from './components/AIComposer';
import SettingsModal from './components/SettingsModal';
import { EmailDraft, SendingStatus, WorkerConfig } from './types';
import { sendEmailViaWorker } from './services/workerService';

const App: React.FC = () => {
  const [config, setConfig] = useState<WorkerConfig>({
    endpointUrl: localStorage.getItem('cf_worker_url') || '',
    authToken: localStorage.getItem('cf_worker_token') || '',
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<SendingStatus>(SendingStatus.IDLE);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSaveConfig = (newConfig: WorkerConfig) => {
    setConfig(newConfig);
    localStorage.setItem('cf_worker_url', newConfig.endpointUrl);
    localStorage.setItem('cf_worker_token', newConfig.authToken);
  };

  const handleSendEmail = async (draft: EmailDraft) => {
    setSendingStatus(SendingStatus.SENDING);
    try {
      await sendEmailViaWorker(draft, config);
      setSendingStatus(SendingStatus.SUCCESS);
      setNotification({ type: 'success', message: 'Workerへメッセージを送信しました！' });
      setTimeout(() => setSendingStatus(SendingStatus.IDLE), 2000);
    } catch (error) {
      setSendingStatus(SendingStatus.ERROR);
      setNotification({ type: 'error', message: '送信に失敗しました。Workerの設定を確認してください。' });
      setTimeout(() => setSendingStatus(SendingStatus.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-orange-100 selection:text-orange-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">CF Mailer AI</h1>
              <span className="text-xs text-gray-500 font-medium">Worker メッセージ送信ツール</span>
            </div>
          </div>
          <div className="flex gap-4">
             <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <Settings className="w-4 h-4" />
              設定
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6">
        
        {/* Intro / Status if not configured */}
        {!config.endpointUrl && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Worker URLが未設定です</h3>
              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                メッセージを送信するには、デプロイ済みのCloudflare WorkerのURLを設定してください。<br />
                設定されたURLに対して、作成したメッセージがPOSTリクエストとして送信されます。
                <br />
                <button onClick={() => setIsSettingsOpen(true)} className="underline font-bold hover:text-blue-800 mt-2 inline-block">
                  Worker URLを設定する
                </button> 
              </p>
            </div>
          </div>
        )}

        <AIComposer onSend={handleSendEmail} sendingStatus={sendingStatus} />

      </main>

      {/* Notifications */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce-in transition-all z-50 ${
          notification.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
             <div className="bg-green-100 p-1.5 rounded-full"><CheckCircle className="w-5 h-5 text-green-600" /></div>
          ) : (
             <div className="bg-red-100 p-1.5 rounded-full"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          )}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default App;
