import React, { useState, useEffect } from 'react';
import Card from './Card';
import ActionButton from './ActionButton';
import FlatButton from './FlatButton';
import CalendarEventModal from './CalendarEventModal';
import { useCalendarEvents, CalendarEvent } from '../src/hooks/useCalendarEvents';

interface CalendarProps {
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Usa il hook personalizzato per caricare gli eventi
  const { 
    events, 
    loading, 
    error, 
    getEventsForDate, 
    addEvent, 
    refresh 
  } = useCalendarEvents(currentDate.getFullYear(), currentDate.getMonth() + 1);
  
  // Debug log per vedere i dati
  console.log('Calendar events:', events);
  console.log('Calendar loading:', loading);
  console.log('Calendar error:', error);
  console.log('Current date:', currentDate.getFullYear(), currentDate.getMonth() + 1);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getMonthName = (date: Date) => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[date.getMonth()];
  };



  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddEvent = async (event: CalendarEvent) => {
    console.log('Adding event:', event);
    
    const success = await addEvent(event);
    if (success) {
      // Mostra messaggio di successo
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];
    
    // Aggiungi giorni vuoti per allineare il calendario
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Aggiungi i giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      const totalAmount = dayEvents.reduce((sum, event) => 
        sum + (event.type === 'income' ? event.amount : -event.amount), 0
      );
      
             // Debug log per il primo giorno del mese
       if (day === 1) {
         console.log('First day events:', dayEvents);
         console.log('Has events:', hasEvents);
         console.log('Total amount:', totalAmount);
         console.log('First day date string:', formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)));
         console.log('Sample event date:', events[0]?.date);
         console.log('All events dates:', events.slice(0, 5).map(e => e.date));
         console.log('Current month/year:', currentDate.getFullYear(), currentDate.getMonth() + 1);
       }
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isModalOpen}
          className={`
            relative h-10 w-full p-1 rounded-md transition-all duration-200 border border-brand-medium/30
            ${isToday(date) 
              ? 'bg-brand-peach text-brand-brown shadow-md' 
              : isSelected(date)
              ? 'bg-brand-medium text-white border-2 border-brand-peach'
              : 'hover:bg-brand-secondary text-white hover:border-brand-medium'
            }
            ${hasEvents ? 'font-semibold' : 'font-normal'}
            ${isModalOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="text-xs">{day}</div>
          {hasEvents && (
            <div className={`
              absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
              ${totalAmount >= 0 ? 'bg-brand-peach' : 'bg-brand-orange'}
            `} />
          )}
          {dayEvents.length > 1 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-buddy-purple" />
          )}
        </button>
      );
    }
    
    return days;
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;
    
    const dayEvents = getEventsForDate(selectedDate);
    const totalIncome = dayEvents
      .filter(event => event.type === 'income')
      .reduce((sum, event) => sum + event.amount, 0);
    const totalExpense = dayEvents
      .filter(event => event.type === 'expense')
      .reduce((sum, event) => sum + event.amount, 0);
    const netAmount = totalIncome - totalExpense;
    
    return (
      <div className="mt-4 p-4 bg-brand-secondary/60 rounded-xl border border-brand-medium">
        <h4 className="font-semibold text-white mb-2">
          {selectedDate.toLocaleDateString('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-sm text-brand-peach font-semibold">€{totalIncome.toFixed(2)}</div>
            <div className="text-xs text-brand-peach/80">Entrate</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-brand-orange font-semibold">€{totalExpense.toFixed(2)}</div>
            <div className="text-xs text-brand-peach/80">Uscite</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-semibold ${netAmount >= 0 ? 'text-brand-peach' : 'text-brand-orange'}`}>
              €{netAmount.toFixed(2)}
            </div>
            <div className="text-xs text-brand-peach/80">Saldo</div>
          </div>
        </div>
        
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-white">Transazioni:</h5>
            {dayEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-brand-peach/90">{event.description}</span>
                <span className={`font-semibold ${event.type === 'income' ? 'text-brand-peach' : 'text-brand-orange'}`}>
                  {event.type === 'income' ? '+' : '-'}€{event.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-brand-peach/80 text-sm">
            Nessuna transazione in questa data
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`p-6 ${className}`} variant="elevated">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-brand-peach flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M16 3v4M8 3v4M3 11h18"/>
          </svg>
          Calendario Eventi
        </h2>
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-brand-peach/70 animate-pulse">Caricamento eventi...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-500 font-medium">Errore nel caricamento</span>
          </div>
          <p className="text-red-500/70 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <FlatButton
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        />
        
        <h3 className="text-lg font-semibold text-white">
          {getMonthName(currentDate)} {currentDate.getFullYear()}
        </h3>
        
        <FlatButton
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
          <div key={day} className="p-2 text-center">
            <span className="text-xs font-medium text-brand-peach/80">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: getDaysInMonth(currentDate).startingDay }, (_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        
        {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-3 sm:p-2 text-sm font-medium rounded-lg
                transition-all duration-200
                ${isToday(date) 
                  ? 'bg-brand-peach text-brand-brown font-semibold' 
                  : isSelected(date)
                  ? 'bg-brand-medium text-white border-2 border-brand-peach'
                  : 'text-white hover:bg-brand-secondary'
                }
                ${hasEvents ? 'ring-2 ring-brand-peach/40' : ''}
              `}
            >
              <span>{day}</span>
              {hasEvents && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-peach rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-3 bg-brand-peach/10 border border-brand-peach/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-brand-peach font-medium">Evento aggiunto con successo!</span>
          </div>
        </div>
      )}

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
        existingEvents={selectedDate ? getEventsForDate(selectedDate) : []}
      />
    </Card>
  );
};

export default Calendar;
