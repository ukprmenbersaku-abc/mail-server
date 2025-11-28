import React, { useState } from 'react';
import { WorkerConfig } from '../types';
import { X, Server, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WorkerConfig;
  onSave: (config: WorkerConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl);
  const [authToken, setAuthToken] = useState(config.authToken);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ endpointUrl, authToken });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            Worker設定
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-100 leading-relaxed">
            Cloudflare Workersにデプロイしたメール送信機能のエンドポイントURLを設定してください。ここに入力されたURLに対してメールデータが送信されます。
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Worker URL (必須)</label>
            <input
              type="url"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://email-worker.project.workers.dev"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">認証トークン (任意)</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Worker側で認証が必要な場合に入力"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-sm"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;