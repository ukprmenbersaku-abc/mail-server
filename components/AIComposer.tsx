
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, RotateCw, PenTool, Wand2 } from 'lucide-react';
import { AIStatus, EmailDraft, SendingStatus, Tone } from '../types';
import { generateEmailDraft, refineEmailDraft } from '../services/geminiService';

interface AIComposerProps {
  onSend: (draft: EmailDraft) => void;
  sendingStatus: SendingStatus;
}

const toneLabels: Record<string, string> = {
  professional: 'ビジネス',
  friendly: '親しみやすく',
  concise: '簡潔に',
  urgent: '至急',
};

const AIComposer: React.FC<AIComposerProps> = ({ onSend, sendingStatus }) => {
  const [draft, setDraft] = useState<EmailDraft>({ subject: '', body: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatus>(AIStatus.IDLE);
  const [showAiInput, setShowAiInput] = useState(false);

  const handleInputChange = (field: keyof EmailDraft, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateDraft = async () => {
    if (!aiPrompt.trim()) return;
    setAiStatus(AIStatus.THINKING);
    try {
      const generatedBody = await generateEmailDraft(aiPrompt);
      setDraft(prev => ({ ...prev, body: generatedBody }));
      setShowAiInput(false);
      setAiPrompt('');
    } catch (error) {
      // Error handled in service logs
    } finally {
      setAiStatus(AIStatus.IDLE);
    }
  };

  const handleRefine = async (tone: Tone) => {
    if (!draft.body.trim()) return;
    setAiStatus(AIStatus.THINKING);
    try {
      const refinedBody = await refineEmailDraft(draft.body, tone);
      setDraft(prev => ({ ...prev, body: refinedBody }));
    } catch (error) {
      // Error handled in service logs
    } finally {
      setAiStatus(AIStatus.IDLE);
    }
  };

  const isSending = sendingStatus === SendingStatus.SENDING;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-orange-600" />
          メール作成
        </h2>
        {aiStatus === AIStatus.THINKING && (
          <span className="text-xs font-medium text-orange-600 flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full animate-pulse">
            <Sparkles className="w-3 h-3" />
            Geminiが考え中...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Subject */}
        <div className="space-y-1">
          <input
            type="text"
            placeholder="件名"
            value={draft.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full text-lg font-bold border-b border-gray-200 py-2 focus:border-orange-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>

        {/* AI Toolbar */}
        <div className="flex flex-wrap gap-2 py-2">
           <button
             onClick={() => setShowAiInput(!showAiInput)}
             className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all ${showAiInput ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
           >
             <Wand2 className="w-3.5 h-3.5" />
             AIドラフト
           </button>
           
           <div className="h-6 w-px bg-gray-200 mx-1"></div>

           {(['professional', 'friendly', 'concise'] as Tone[]).map((tone) => (
             <button
               key={tone}
               onClick={() => handleRefine(tone)}
               disabled={!draft.body || aiStatus === AIStatus.THINKING}
               className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {toneLabels[tone] || tone}へ変換
             </button>
           ))}
        </div>

        {/* AI Prompt Input */}
        {showAiInput && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="例: 来週火曜日のミーティングについてクライアントに依頼する..."
                className="flex-1 text-sm border-gray-200 rounded-md focus:ring-orange-500 focus:border-orange-500 px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateDraft()}
              />
              <button
                onClick={handleGenerateDraft}
                disabled={aiStatus === AIStatus.THINKING}
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-70 whitespace-nowrap"
              >
                生成
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <textarea
          placeholder="ここに入力するか、AIを使って下書きを生成してください..."
          value={draft.body}
          onChange={(e) => handleInputChange('body', e.target.value)}
          className="w-full h-64 resize-none text-gray-700 leading-relaxed focus:outline-none placeholder-gray-300"
        />
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-400">
           Powered by Gemini 2.5 & Cloudflare
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDraft({ subject: '', body: '' })}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="内容をクリア"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => onSend(draft)}
            disabled={isSending || !draft.body}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-all shadow-md hover:shadow-lg ${
              isSending || !draft.body
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                Workerへ送信
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIComposer;
