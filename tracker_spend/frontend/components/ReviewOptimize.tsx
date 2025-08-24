import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';
import { ApiService, useApiConnection } from '../src/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SpendingTrend {
  month: string;
  spending: number;
  budget: number;
  savings: number;
}

interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  suggestion: string;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  implemented: boolean;
}

interface Integration {
  id: string;
  name: string;
  type: 'excel' | 'sheets' | 'banking' | 'investment';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  icon: string;
}

const ReviewOptimize: React.FC = () => {
  const { isConnected } = useApiConnection();
  const [activeTab, setActiveTab] = useState<'trends' | 'suggestions' | 'integrations'>('trends');
  const [isLoading, setIsLoading] = useState(false);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<OptimizationSuggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Carica dati reali dal backend
  useEffect(() => {
    loadSpendingTrends();
    loadCategoryAnalysis();
    loadSuggestions();
    loadIntegrations();
  }, []);

  const loadSpendingTrends = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setSpendingTrends([]);
    } catch (error) {
      console.error('Errore nel caricamento spending trends:', error);
    }
  };

  const loadCategoryAnalysis = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setCategoryAnalysis([]);
    } catch (error) {
      console.error('Errore nel caricamento category analysis:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setSuggestions([]);
    } catch (error) {
      console.error('Errore nel caricamento suggestions:', error);
    }
  };

  const loadIntegrations = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setIntegrations([]);
    } catch (error) {
      console.error('Errore nel caricamento integrations:', error);
    }
  };

  const implementSuggestion = async (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, implemented: true } : s
    ));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-green-400';
      case 'stable': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

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
        title="Analisi"
        subtitle="Rivedi e ottimizza le tue finanze"
        rightAction={
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            variant="secondary"
            onClick={() => {
              // Qui si potrebbe generare un nuovo report
              alert('Generazione report in corso...');
            }}
          />
        }
        showLogo={true}
      />

      {/* Statistiche */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              €{suggestions.filter(s => !s.implemented).reduce((sum, s) => sum + s.potentialSavings, 0)}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Risparmio Potenziale</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {suggestions.filter(s => s.implemented).length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Ottimizzazioni Attive</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Integrazioni Attive</div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <FlatButton
          variant={activeTab === 'trends' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('trends')}
        >
          Trend ({spendingTrends.length} mesi)
        </FlatButton>
        <FlatButton
          variant={activeTab === 'suggestions' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('suggestions')}
        >
          Suggerimenti ({suggestions.filter(s => !s.implemented).length})
        </FlatButton>
        <FlatButton
          variant={activeTab === 'integrations' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('integrations')}
        >
          Integrazioni ({integrations.length})
        </FlatButton>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-peach mx-auto"></div>
          <p className="text-brand-peach/80 mt-2">Analisi in corso...</p>
        </div>
      ) : (
        <>
          {/* Trend e Grafici */}
          {activeTab === 'trends' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Grafico Trend Spese */}
              <Card className="p-4 sm:p-6" variant="elevated">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Trend Spese vs Budget</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingTrends}>
                      <XAxis dataKey="month" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="spending" 
                        stroke="#FF6B6B" 
                        strokeWidth={2}
                        name="Spese"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="#4ECDC4" 
                        strokeWidth={2}
                        name="Budget"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#96CEB4" 
                        strokeWidth={2}
                        name="Risparmi"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Analisi Categorie */}
      <Card className="p-4 sm:p-6" variant="elevated">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Analisi per Categoria</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryAnalysis}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {categoryAnalysis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #333',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {categoryAnalysis.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between p-2 sm:p-3 bg-brand-dark rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div>
                            <div className="font-medium text-white text-sm sm:text-base">{category.category}</div>
                            <div className="text-xs sm:text-sm text-brand-peach/80">{category.suggestion}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`text-base sm:text-lg ${getTrendColor(category.trend)}`}>
                            {getTrendIcon(category.trend)}
                          </span>
                          <span className="text-xs sm:text-sm text-brand-peach/80">
                            €{category.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Suggerimenti */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3 sm:space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-3 sm:p-4" variant="elevated">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{suggestion.title}</h3>
                        {suggestion.implemented && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Implementato
                          </span>
                        )}
                      </div>
                      <p className="text-brand-peach/80 text-sm mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty === 'easy' ? 'Facile' : 
                           suggestion.difficulty === 'medium' ? 'Medio' : 'Difficile'}
                        </span>
                        <span className="text-green-400 font-medium">
                          Risparmio: €{suggestion.potentialSavings}/mese
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!suggestion.implemented && (
                    <div className="flex space-x-2">
                      <FlatButton
                        variant="primary"
                        size="sm"
                        onClick={() => implementSuggestion(suggestion.id)}
                      >
                        Implementa
                      </FlatButton>
                      <FlatButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setShowSuggestionModal(true);
                        }}
                      >
                        Dettagli
                      </FlatButton>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Integrazioni */}
          {activeTab === 'integrations' && (
            <div className="space-y-3 sm:space-y-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="p-3 sm:p-4" variant="elevated">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl md:text-2xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">{integration.name}</h3>
                        <p className="text-brand-peach/80 text-xs sm:text-sm">
                          Ultima sincronizzazione: {new Date(integration.lastSync).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`text-xs sm:text-sm ${getIntegrationStatusColor(integration.status)}`}>
                        {integration.status === 'connected' ? 'Connesso' : 
                         integration.status === 'disconnected' ? 'Disconnesso' : 'Errore'}
                      </span>
                      
                      <FlatButton
                        variant={integration.status === 'connected' ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => {
                          if (integration.status === 'connected') {
                            alert('Disconnessione in corso...');
                          } else {
                            alert('Connessione in corso...');
                          }
                        }}
                      >
                        {integration.status === 'connected' ? 'Disconnetti' : 'Connetti'}
                      </FlatButton>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Card className="p-3 sm:p-4" variant="elevated">
                <div className="text-center">
                  <div className="mb-3 sm:mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-brand-peach mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Aggiungi Nuova Integrazione</h3>
                  <p className="text-brand-peach/80 text-xs sm:text-sm mb-3 sm:mb-4">
                    Connetti altri servizi per un'analisi più completa
                  </p>
                  <FlatButton
                    variant="primary"
                    onClick={() => alert('Funzionalità in sviluppo')}
                  >
                    Esplora Integrazioni
                  </FlatButton>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Modal Dettagli Suggerimento */}
      {showSuggestionModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-buddy-card rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">{selectedSuggestion.title}</h2>
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Descrizione</h3>
                <p className="text-brand-peach/80 text-sm">{selectedSuggestion.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Risparmio Potenziale</h3>
                  <p className="text-green-400 font-bold">€{selectedSuggestion.potentialSavings}/mese</p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Difficoltà</h3>
                  <p className={`${getDifficultyColor(selectedSuggestion.difficulty)}`}>
                    {selectedSuggestion.difficulty === 'easy' ? 'Facile' : 
                     selectedSuggestion.difficulty === 'medium' ? 'Medio' : 'Difficile'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">Passi per l'Implementazione</h3>
                <ul className="text-brand-peach/80 text-sm space-y-1">
                  <li>• Analizza le tue spese attuali</li>
                  <li>• Identifica le aree di miglioramento</li>
                  <li>• Pianifica le modifiche gradualmente</li>
                  <li>• Monitora i risultati</li>
        </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-dark">
              <FlatButton
                variant="primary"
                onClick={() => {
                  implementSuggestion(selectedSuggestion.id);
                  setShowSuggestionModal(false);
                }}
                className="w-full"
              >
                Implementa Suggerimento
              </FlatButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewOptimize;


