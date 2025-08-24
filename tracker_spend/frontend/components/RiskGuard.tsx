import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';
import { ApiService, useApiConnection } from '../src/services/api';

interface Alert {
  id: string;
  type: 'low_balance' | 'high_spending' | 'budget_exceeded' | 'unusual_transaction';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  read: boolean;
  actionRequired: boolean;
}

interface EmergencyFund {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  status: 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface RiskAssessment {
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  description: string;
  recommendations: string[];
}

interface Insurance {
  id: string;
  type: 'health' | 'auto' | 'home' | 'life' | 'disability';
  provider: string;
  monthlyPremium: number;
  coverage: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

const RiskGuard: React.FC = () => {
  const { isConnected } = useApiConnection();
  const [activeTab, setActiveTab] = useState<'alerts' | 'emergency' | 'assessment' | 'insurance'>('alerts');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [emergencyFunds, setEmergencyFunds] = useState<EmergencyFund[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    monthlyContribution: '',
    priority: 'medium' as const
  });

  // Carica dati reali dal backend
  useEffect(() => {
    loadAlerts();
    loadEmergencyFunds();
    loadRiskAssessment();
    loadInsurance();
  }, []);

  const loadAlerts = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setAlerts([]);
    } catch (error) {
      console.error('Errore nel caricamento alerts:', error);
    }
  };

  const loadEmergencyFunds = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setEmergencyFunds([]);
    } catch (error) {
      console.error('Errore nel caricamento emergency funds:', error);
    }
  };

  const loadRiskAssessment = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setRiskAssessment([]);
    } catch (error) {
      console.error('Errore nel caricamento risk assessment:', error);
    }
  };

  const loadInsurance = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setInsurance([]);
    } catch (error) {
      console.error('Errore nel caricamento insurance:', error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    try {
      const fundData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        monthlyContribution: parseFloat(formData.monthlyContribution),
        priority: formData.priority,
        status: 'active' as const
      };

      // Simula la creazione del fondo
      const newFund: EmergencyFund = {
        id: Date.now().toString(),
        name: fundData.name,
        targetAmount: fundData.targetAmount,
        currentAmount: 0,
        monthlyContribution: fundData.monthlyContribution,
        status: fundData.status,
        priority: fundData.priority
      };

      setEmergencyFunds(prev => [...prev, newFund]);
      setShowAddFundModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating emergency fund:', error);
      alert('Errore nella creazione del fondo di emergenza');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      monthlyContribution: '',
      priority: 'medium'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📌';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressPercentage = (fund: EmergencyFund) => {
    return Math.min((fund.currentAmount / fund.targetAmount) * 100, 100);
  };

  const getInsuranceTypeIcon = (type: string) => {
    switch (type) {
      case 'health': return '🏥';
      case 'auto': return '🚗';
      case 'home': return '🏠';
      case 'life': return '💝';
      case 'disability': return '🦽';
      default: return '📋';
    }
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
        title="Protezione"
        subtitle="Gestisci rischi e proteggi le tue finanze"
        rightAction={
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            variant="primary"
            onClick={() => setShowAddFundModal(true)}
          />
        }
        showLogo={true}
      />

      {/* Statistiche */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {alerts.filter(a => !a.read).length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Alert Attivi</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              €{(emergencyFunds.reduce((sum, fund) => sum + (Number(fund.currentAmount) || 0), 0) || 0).toFixed(0)}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Fondi Emergenza</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {insurance.filter(i => i.status === 'active').length}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Assicurazioni Attive</div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <FlatButton
          variant={activeTab === 'alerts' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('alerts')}
        >
          Alert ({alerts.filter(a => !a.read).length})
        </FlatButton>
        <FlatButton
          variant={activeTab === 'emergency' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('emergency')}
        >
          Fondi Emergenza ({emergencyFunds.length})
        </FlatButton>
        <FlatButton
          variant={activeTab === 'assessment' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('assessment')}
        >
          Valutazione Rischi
        </FlatButton>
        <FlatButton
          variant={activeTab === 'insurance' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('insurance')}
        >
          Assicurazioni ({insurance.length})
        </FlatButton>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-peach mx-auto"></div>
          <p className="text-brand-peach/80 mt-2">Analisi rischi in corso...</p>
        </div>
      ) : (
        <>
          {/* Alert */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card className="p-6 text-center" variant="elevated">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-12 w-12 text-green-400 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Nessun Alert Attivo</h3>
                  <p className="text-brand-peach/80">
                    Ottimo! I tuoi parametri finanziari sono nella norma.
                  </p>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Card key={alert.id} className="p-4" variant="elevated">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{alert.title}</h3>
                            {!alert.read && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                Nuovo
                              </span>
                            )}
                            {alert.actionRequired && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                Azione Richiesta
                              </span>
                            )}
                          </div>
                          <p className="text-brand-peach/80 text-sm mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`${getSeverityColor(alert.severity)}`}>
                              {alert.severity === 'critical' ? 'Critico' : 
                               alert.severity === 'high' ? 'Alto' : 
                               alert.severity === 'medium' ? 'Medio' : 'Basso'}
                            </span>
                            <span className="text-brand-peach/60">
                              {new Date(alert.createdAt).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!alert.read && (
                        <FlatButton
                          variant="secondary"
                          size="sm"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          Segna come Letto
                        </FlatButton>
                      )}
                      <FlatButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          // Qui si potrebbe aprire un modal con azioni specifiche
                          alert('Azioni disponibili: Riduci spese, Trasferisci fondi, Contatta supporto');
                        }}
                      >
                        Azioni
                      </FlatButton>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Fondi di Emergenza */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              {emergencyFunds.map((fund) => (
                <Card key={fund.id} className="p-4" variant="elevated">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{fund.name}</h3>
                        {fund.status === 'completed' && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Completato
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-brand-peach/80">
                        <span>€{fund.currentAmount.toFixed(0)} / €{fund.targetAmount.toFixed(0)}</span>
                        <span>Contributo: €{fund.monthlyContribution}/mese</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra di Progresso */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-brand-peach/80 mb-1">
                      <span>{getProgressPercentage(fund).toFixed(1)}% completato</span>
                      <span>€{(fund.targetAmount - fund.currentAmount).toFixed(0)} rimanenti</span>
                    </div>
                    <div className="w-full bg-brand-dark rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-peach to-brand-medium h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(fund)}%` }}
                      ></div>
                    </div>
                  </div>

                  {fund.status === 'active' && (
                    <div className="flex space-x-2">
                      <FlatButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const newAmount = prompt(`Aggiorna importo per "${fund.name}" (attuale: €${fund.currentAmount})`);
                          if (newAmount && !isNaN(parseFloat(newAmount))) {
                            // Aggiorna il fondo
                            setEmergencyFunds(prev => prev.map(f => 
                              f.id === fund.id ? { ...f, currentAmount: parseFloat(newAmount) } : f
                            ));
                          }
                        }}
                      >
                        Aggiorna Importo
                      </FlatButton>
                      <FlatButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Simula il completamento del fondo
                          setEmergencyFunds(prev => prev.map(f => 
                            f.id === fund.id ? { ...f, currentAmount: f.targetAmount, status: 'completed' } : f
                          ));
                        }}
                      >
                        Completare
                      </FlatButton>
                    </div>
                  )}
                </Card>
              ))}

              <Card className="p-4" variant="elevated">
                <div className="text-center">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-12 w-12 text-brand-peach mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Crea Nuovo Fondo</h3>
                  <p className="text-brand-peach/80 text-sm mb-4">
                    Aggiungi un nuovo fondo di emergenza per proteggere le tue finanze
                  </p>
                  <FlatButton
                    variant="primary"
                    onClick={() => setShowAddFundModal(true)}
                  >
                    Crea Fondo
                  </FlatButton>
                </div>
              </Card>
            </div>
          )}

          {/* Valutazione Rischi */}
          {activeTab === 'assessment' && (
            <div className="space-y-4">
              {riskAssessment.map((risk) => (
                <Card key={risk.category} className="p-4" variant="elevated">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{risk.category}</h3>
                        <span className={`text-sm ${getRiskLevelColor(risk.riskLevel)}`}>
                          Rischio {risk.riskLevel === 'high' ? 'Alto' : risk.riskLevel === 'medium' ? 'Medio' : 'Basso'}
                        </span>
                      </div>
                      <p className="text-brand-peach/80 text-sm mb-2">{risk.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-brand-peach/80 mb-1">
                          <span>Punteggio Sicurezza</span>
                          <span>{risk.score}/100</span>
                        </div>
                        <div className="w-full bg-brand-dark rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              risk.score >= 80 ? 'bg-green-500' : 
                              risk.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${risk.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Raccomandazioni</h4>
                    <ul className="text-brand-peach/80 text-sm space-y-1">
                      {risk.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">→</span>
                          {rec}
                        </li>
                      ))}
        </ul>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Assicurazioni */}
          {activeTab === 'insurance' && (
            <div className="space-y-4">
              {insurance.map((ins) => (
                <Card key={ins.id} className="p-4" variant="elevated">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getInsuranceTypeIcon(ins.type)}</span>
                      <div>
                        <h3 className="font-semibold text-white capitalize">{ins.type}</h3>
                        <p className="text-brand-peach/80 text-sm">{ins.provider}</p>
                        <div className="flex items-center gap-4 text-sm text-brand-peach/80 mt-1">
                          <span>€{ins.monthlyPremium}/mese</span>
                          <span>Copertura: €{ins.coverage.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${
                        ins.status === 'active' ? 'text-green-400' : 
                        ins.status === 'expired' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {ins.status === 'active' ? 'Attiva' : 
                         ins.status === 'expired' ? 'Scaduta' : 'In Attesa'}
                      </span>
                      
                      <div className="text-right text-xs text-brand-peach/60">
                        <div>Scade il</div>
                        <div>{new Date(ins.expiryDate).toLocaleDateString('it-IT')}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Card className="p-4" variant="elevated">
                <div className="text-center">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-12 w-12 text-brand-peach mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Aggiungi Assicurazione</h3>
                  <p className="text-brand-peach/80 text-sm mb-4">
                    Registra le tue polizze assicurative per una protezione completa
                  </p>
                  <FlatButton
                    variant="primary"
                    onClick={() => alert('Funzionalità in sviluppo')}
                  >
                    Aggiungi Polizza
                  </FlatButton>
                </div>
      </Card>
            </div>
          )}
        </>
      )}

      {/* Modal Aggiunta Fondo Emergenza */}
      {showAddFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-buddy-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Nuovo Fondo di Emergenza</h2>
              <button
                onClick={() => setShowAddFundModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Nome Fondo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  placeholder="Es. Fondo Auto"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                    Obiettivo (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                    placeholder="2000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                    Contributo Mensile (€)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                    placeholder="150"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Priorità
                </label>
                <div className="flex space-x-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority as any })}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                        formData.priority === priority 
                          ? 'bg-buddy-purple text-white' 
                          : 'bg-buddy-dark text-buddy-text-secondary'
                      }`}
                    >
                      {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Bassa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <FlatButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddFundModal(false)}
                  className="flex-1"
                >
                  Annulla
                </FlatButton>
                <FlatButton
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Crea Fondo
                </FlatButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskGuard;


