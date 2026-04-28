
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { databaseService } from '../services/databaseService';
import { User } from '../types';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'messages'>('connections');
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [connData, reqData, msgData] = await Promise.all([
        databaseService.getActivityLogsAdmin(),
        databaseService.getCentralizedRequestsAdmin(),
        databaseService.getMessageHistoryAdmin()
      ]);
      setConnections(connData);
      setRequests(reqData);
      setMessages(msgData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-[#E4E3E0] z-[1000] flex flex-col font-sans overflow-hidden text-[#141414]">
      {/* Sidebar / Header Navigation */}
      <header className="h-16 border-b border-[#141414] flex items-center px-6 justify-between bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] rounded-full transition-colors">
            <BackIcon />
          </button>
          <h1 className="font-serif italic text-2xl tracking-tight">Admin Dashboard <span className="font-sans not-italic text-[10px] font-black uppercase bg-[#141414] text-[#E4E3E0] px-2 py-0.5 rounded ml-2">v2.0</span></h1>
        </div>
        
        <div className="flex bg-[#141414]/5 rounded-lg p-1">
          {(['connections', 'requests', 'messages'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-black tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#141414] text-[#E4E3E0] shadow-sm' : 'text-[#141414]/50 hover:text-[#141414]'
              }`}
            >
              {tab === 'connections' ? 'Connexions' : tab === 'requests' ? 'Demandes' : 'Messages'}
            </button>
          ))}
        </div>

        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="flex items-center gap-2 p-2 hover:bg-white rounded-lg border border-transparent hover:border-[#141414]/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <div className={isLoading ? 'animate-spin' : ''}><RefreshIcon /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Actualiser</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(#14141411_1px,transparent_1px)] [background-size:20px_20px] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40"
              >
                <div className="w-12 h-12 border-4 border-[#141414]/20 border-t-[#141414] rounded-full animate-spin mb-4"></div>
                <p className="font-serif italic opacity-50">Chargement des données...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-[#141414]/10 shadow-[8px_8px_0px_#14141411] rounded-xl overflow-hidden"
              >
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] bg-[#141414] text-[#E4E3E0] p-4 font-serif italic text-xs uppercase tracking-widest opacity-90">
                  {activeTab === 'connections' && (
                    <>
                      <div>Utilisateur</div>
                      <div>Action / Plateforme</div>
                      <div>Ville</div>
                      <div>Date</div>
                      <div className="text-right">Détails</div>
                    </>
                  ) || activeTab === 'requests' && (
                    <>
                      <div>Client</div>
                      <div>Type de Demande</div>
                      <div>Date</div>
                      <div>Statut</div>
                      <div className="text-right">Note</div>
                    </>
                  ) || activeTab === 'messages' && (
                    <>
                      <div>Utilisateur</div>
                      <div>Dernier Message</div>
                      <div>Date</div>
                      <div className="text-right">Action</div>
                    </>
                  )}
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#141414]/5">
                  {(activeTab === 'connections' ? connections : activeTab === 'requests' ? requests : messages).map((row, idx) => (
                    <div key={row.id || idx} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] p-4 items-center hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group cursor-default">
                      {activeTab === 'connections' && (
                        <>
                          <div>
                            <div className="font-bold text-sm">{row.name}</div>
                            <div className="font-mono text-[10px] opacity-60 group-hover:opacity-80">{row.phone}</div>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${row.action === 'connect' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {row.action === 'connect' ? 'Connexion' : 'Session Start'} 
                            <span className="font-mono text-[10px] opacity-40 ml-2 group-hover:opacity-60">{row.platform}</span>
                          </div>
                          <div className="text-sm opacity-70 group-hover:opacity-100">{row.city || '-'}</div>
                          <div className="font-mono text-xs opacity-60 group-hover:opacity-100">{formatDate(row.timestamp)}</div>
                          <div className="text-right">
                             <button className="text-[10px] font-black uppercase underline p-1 opacity-0 group-hover:opacity-100 transition-all">Voir</button>
                          </div>
                        </>
                      ) || activeTab === 'requests' && (
                        <>
                          <div>
                            <div className="font-bold text-sm">{row.userName}</div>
                            <div className="font-mono text-[10px] opacity-60 group-hover:opacity-80">{row.userPhone}</div>
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-[#141414]/5 group-hover:bg-white/20 rounded text-[9px] font-black uppercase mr-2">{row.type}</span>
                            <span className="text-xs font-serif italic truncate block mt-1">{JSON.stringify(row.data).substring(0, 50)}...</span>
                          </div>
                          <div className="font-mono text-xs opacity-60 group-hover:opacity-100">{formatDate(row.timestamp)}</div>
                          <div>
                             <span className="text-[10px] font-black uppercase text-orange-500">{row.status}</span>
                          </div>
                          <div className="text-right">
                             <button className="text-[10px] font-black uppercase border border-current px-3 py-1 rounded hover:bg-white hover:text-[#141414] transition-all">Consulter</button>
                          </div>
                        </>
                      ) || activeTab === 'messages' && (
                        <>
                          <div>
                            <div className="font-bold text-sm tracking-tight">User #{row.id?.slice(-4)}</div>
                            <div className="font-mono text-[10px] opacity-60">{row.id}</div>
                          </div>
                          <div className="text-sm font-serif italic max-w-md truncate">"{row.lastMessage}"</div>
                          <div className="font-mono text-xs opacity-60">{formatDate(row.updatedAt)}</div>
                          <div className="text-xs uppercase font-black opacity-40">{row.lastSender}</div>
                          <div className="text-right">
                             <button className="text-[10px] font-black uppercase border border-current px-3 py-1 rounded hover:bg-white hover:text-[#141414] transition-all">Répondre</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {((activeTab === 'connections' && connections.length === 0) || 
                    (activeTab === 'requests' && requests.length === 0) ||
                    (activeTab === 'messages' && messages.length === 0)) && (
                    <div className="py-20 text-center font-serif italic opacity-30">Aucune donnée trouvée</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6">
            <StatCard label="Utilisateurs Actifs" value={new Set(connections.map(c => c.phone)).size.toString()} />
            <StatCard label="Demandes Totales" value={requests.length.toString()} />
            <StatCard label="Conversations" value={messages.length.toString()} />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-white border border-[#141414]/10 p-6 rounded-xl shadow-[4px_4px_0px_#14141411] flex flex-col gap-1">
    <span className="font-serif italic text-xs opacity-50 uppercase tracking-widest">{label}</span>
    <span className="font-mono text-4xl font-light tracking-tighter">{value.padStart(2, '0')}</span>
  </div>
);

export default AdminDashboard;
