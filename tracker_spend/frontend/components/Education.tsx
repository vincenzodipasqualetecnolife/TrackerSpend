import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';
import { ApiService, useApiConnection } from '../src/services/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'savings' | 'budget' | 'consistency' | 'achievement';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'savings' | 'budget' | 'investment' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  read: boolean;
}

interface Report {
  id: string;
  title: string;
  period: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  generatedAt: string;
}

const Education: React.FC = () => {
  const { isConnected } = useApiConnection();
  const [activeTab, setActiveTab] = useState<'tips' | 'badges' | 'reports'>('tips');
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);

  // Carica dati reali dal backend
  useEffect(() => {
    loadTips();
    loadBadges();
    loadReports();
  }, []);

  const loadTips = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setTips([]);
    } catch (error) {
      console.error('Errore nel caricamento tips:', error);
    }
  };

  const loadBadges = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setBadges([]);
    } catch (error) {
      console.error('Errore nel caricamento badges:', error);
    }
  };

  const loadReports = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setReports([]);
    } catch (error) {
      console.error('Errore nel caricamento reports:', error);
    }
  };

  const markTipAsRead = async (tipId: string) => {
    setTips(prev => prev.map(tip => 
      tip.id === tipId ? { ...tip, read: true } : tip
    ));
    
    // Aggiorna il progresso del badge "Esperto"
    setBadges(prev => prev.map(badge => 
      badge.id === '6' ? { ...badge, progress: badge.progress + 1 } : badge
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'budget': return '📊';
      case 'investment': return '📈';
      case 'general': return '💡';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getBadgeProgressColor = (badge: Badge) => {
    const percentage = (badge.progress / badge.maxProgress) * 100;
    if (percentage >= 100) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-400 font-medium">Server non connesso</span>
          </div>
          <p className="text-red-300 text-sm mt-2">
            Assicurati che l'app Flutter sia in esecuzione e che il server API sia attivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Educazione"
        subtitle="Impara e migliora le tue finanze"
        showLogo={true}
      />

      {/* Statistiche */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {tips.filter(t => t.read).length}/{tips.length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Consigli Letti</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {badges.filter(b => b.unlocked).length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Badge Sbloccati</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {reports.length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Report Generati</div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <FlatButton
          variant={activeTab === 'tips' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tips')}
        >
          Consigli ({tips.length})
        </FlatButton>
        <FlatButton
          variant={activeTab === 'badges' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('badges')}
        >
          Badge ({badges.filter(b => b.unlocked).length}/{badges.length})
        </FlatButton>
        <FlatButton
          variant={activeTab === 'reports' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reports')}
        >
          Report ({reports.length})
        </FlatButton>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-peach mx-auto"></div>
          <p className="text-brand-peach/80 mt-2">Caricamento contenuti...</p>
        </div>
      ) : (
        <>
          {/* Consigli */}
          {activeTab === 'tips' && (
            <div className="space-y-3 sm:space-y-4">
              {tips.map((tip) => (
                <Card key={tip.id} className="p-3 sm:p-4" variant="elevated">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl md:text-2xl">{getCategoryIcon(tip.category)}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">{tip.title}</h3>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className={`${getDifficultyColor(tip.difficulty)}`}>
                            {tip.difficulty === 'beginner' ? 'Principiante' : 
                             tip.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                          </span>
                          {tip.read && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Letto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-brand-peach/80 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                    {tip.content}
                  </p>
                  
                  <FlatButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedTip(tip);
                      setShowTipModal(true);
                      if (!tip.read) {
                        markTipAsRead(tip.id);
                      }
                    }}
                  >
                    {tip.read ? 'Rileggi' : 'Leggi Consiglio'}
                  </FlatButton>
                </Card>
              ))}
            </div>
          )}

          {/* Badge */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="p-3 sm:p-4" variant="elevated">
                  <div className="text-center">
                    <div className={`text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{badge.name}</h3>
                    <p className="text-brand-peach/80 text-xs mb-2 sm:mb-3">{badge.description}</p>
                    
                    {badge.unlocked ? (
                      <div className="text-green-400 text-xs">
                        Sbloccato il {new Date(badge.unlockedAt!).toLocaleDateString('it-IT')}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-brand-peach/80">
                          Progresso: {badge.progress}/{badge.maxProgress}
                        </div>
                        <div className="w-full bg-brand-dark rounded-full h-1">
                          <div
                            className={`bg-gradient-to-r from-brand-peach to-brand-medium h-1 rounded-full transition-all duration-300 ${getBadgeProgressColor(badge)}`}
                            style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Report */}
          {activeTab === 'reports' && (
            <div className="space-y-3 sm:space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="p-3 sm:p-4" variant="elevated">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">{report.title}</h3>
                      <p className="text-brand-peach/80 text-xs sm:text-sm">{report.period}</p>
                    </div>
                    <span className="text-xs text-brand-peach/60">
                      {new Date(report.generatedAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-medium text-white mb-1 sm:mb-2 text-sm sm:text-base">Riepilogo</h4>
                    <p className="text-brand-peach/80 text-xs sm:text-sm">{report.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-1 sm:mb-2 text-sm sm:text-base">Insights</h4>
                      <ul className="text-brand-peach/80 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                        {report.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-1 sm:mb-2 text-sm sm:text-base">Raccomandazioni</h4>
                      <ul className="text-brand-peach/80 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">→</span>
                            {rec}
                          </li>
                        ))}
        </ul>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-brand-dark">
                    <FlatButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Qui si potrebbe aprire un modal con il report completo
                        alert('Report completo disponibile nella versione premium');
                      }}
                    >
                      Scarica Report Completo
                    </FlatButton>
                  </div>
      </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Consiglio Dettagliato */}
      {showTipModal && selectedTip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-buddy-card rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{getCategoryIcon(selectedTip.category)}</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{selectedTip.title}</h2>
                  <span className={`text-xs sm:text-sm ${getDifficultyColor(selectedTip.difficulty)}`}>
                    {selectedTip.difficulty === 'beginner' ? 'Principiante' : 
                     selectedTip.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-brand-peach/90 leading-relaxed text-sm sm:text-base">
                {selectedTip.content}
              </p>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-dark">
              <FlatButton
                variant="primary"
                onClick={() => setShowTipModal(false)}
                className="w-full"
              >
                Ho Capito
              </FlatButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;


