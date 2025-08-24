import React, { useState, useRef } from 'react';
import { ApiService } from '../src/services/api';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verifica che sia un file CSV o Excel
      const fileExtension = file.name.toLowerCase();
      if (!fileExtension.endsWith('.csv') && !fileExtension.endsWith('.xlsx') && !fileExtension.endsWith('.xls')) {
        setError('Solo file CSV e Excel (.csv, .xlsx, .xls) sono supportati');
        return;
      }
      
      // Verifica dimensione file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Il file è troppo grande. Dimensione massima: 10MB');
        return;
      }
      
      setError(null);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    console.log('=== DEBUG UPLOAD ===');
    console.log('File ricevuto:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Simula progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepara FormData
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('FormData creato:', formData);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Chiama l'API
      console.log('Chiamando API...');
      const response = await ApiService.uploadTransactions(formData);
      console.log('Risposta API:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data) {
        setUploadResult(response.data);
        setTimeout(() => {
          onSuccess(response.data);
          onClose();
        }, 1000);
      } else {
        setError(response.error || 'Errore durante l\'upload');
      }
      
    } catch (err: any) {
      console.error('Errore durante upload:', err);
      setError(err.message || 'Errore durante l\'upload del file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const resetModal = () => {
    setError(null);
    setUploadProgress(0);
    setUploadResult(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-secondary border border-brand-medium rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-brand-peach">Carica Estratto Conto</h3>
          <button
            onClick={handleClose}
            className="text-brand-peach/70 hover:text-brand-peach transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenuto */}
        {!uploadResult ? (
          <div>
            {/* Area di drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isUploading 
                  ? 'border-brand-peach/50 bg-brand-peach/5' 
                  : 'border-brand-medium hover:border-brand-peach/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-brand-peach/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-brand-peach animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-brand-peach font-medium">Caricamento in corso...</p>
                    <div className="w-full bg-brand-dark rounded-full h-2 mt-2">
                      <div 
                        className="bg-brand-peach h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-brand-peach/70 mt-1">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-brand-peach/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-brand-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-brand-peach font-medium">Trascina qui il file CSV o Excel</p>
                    <p className="text-sm text-brand-peach/70">oppure</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 bg-brand-peach text-white px-4 py-2 rounded-lg hover:bg-brand-peach/90 transition-colors"
                    >
                      Seleziona File
                    </button>
                  </div>
                  <p className="text-xs text-brand-peach/50">
                    Formati supportati: CSV, Excel (.xlsx, .xls)<br />
                    Dimensione massima: 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Input file nascosto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Messaggio di errore */}
            {error && (
              <div className="mt-4 p-3 bg-brand-orange/10 border border-brand-orange/30 rounded-lg">
                <p className="text-brand-orange text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Risultato upload */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-medium">Upload completato!</p>
              <p className="text-sm text-brand-peach/70">
                {uploadResult.saved_count} transazioni caricate
              </p>
            </div>
            {uploadResult.stats && (
              <div className="bg-brand-dark/30 rounded-lg p-3 text-left">
                <p className="text-xs text-brand-peach/70 mb-2">Statistiche:</p>
                <div className="space-y-1 text-xs">
                  <p>Entrate: €{uploadResult.stats.total_income?.toFixed(2) || '0.00'}</p>
                  <p>Uscite: €{uploadResult.stats.total_expenses?.toFixed(2) || '0.00'}</p>
                  <p>Saldo: €{uploadResult.stats.net_amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadModal;
