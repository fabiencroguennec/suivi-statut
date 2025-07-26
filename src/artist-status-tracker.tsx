import React, { useState } from 'react';
import { Plus, Calendar, Euro, Clock, Download, Trash2, Edit3, Save, X, List, ExternalLink, Image, Play, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const ArtistStatusTracker = () => {
  const [contracts, setContracts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showQuickList, setShowQuickList] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState({});
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Gestion des choix multiples
  const [showChoicesManager, setShowChoicesManager] = useState(false);
  const [activeChoiceType, setActiveChoiceType] = useState('activities');
  const [choices, setChoices] = useState({
    activities: [
      'Montage vidéo', 'Étalonnage', 'Mixage audio', 'Motion design', 'Compositing',
      'Réalisation', 'Cadreur', 'Ingénieur du son', 'Assistant réalisateur', 'Script'
    ],
    sectors: [
      'audiovisuel', 'spectacle', 'cinema', 'television', 'radio', 
      'musique', 'theatre', 'danse', 'publicite', 'documentaire'
    ],
    contractTypes: [
      'CDI', 'CDD', 'Cachet', 'Freelance', 'Intérim', 'Stage', 'Bénévolat'
    ]
  });
  
  // Base de données des employeurs
  const [employers, setEmployers] = useState({});
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [employerData, setEmployerData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone1: '',
    phone2: '',
    vatNumber: '',
    address: '',
    website: '',
    notes: '',
    customFields: {}
  });
  const [newCustomField, setNewCustomField] = useState({ name: '', value: '' });
  const [showCustomFieldInput, setShowCustomFieldInput] = useState(false);

  const [formData, setFormData] = useState({
    employer: '',
    activity: '',
    startDate: '',
    endDate: '',
    grossPay: '',
    contractType: 'CDI',
    sector: 'audiovisuel',
    description: '',
    driveLink: ''
  });

  const REFERENCE_SALARY = 81.23;
  const REQUIRED_DAYS = 156;
  const REFERENCE_PERIOD_MONTHS = 24;

  const calculateWorkDays = (grossPay) => {
    return parseFloat(grossPay || 0) / REFERENCE_SALARY;
  };

  const getReferenceDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - REFERENCE_PERIOD_MONTHS);
    return date;
  };

  const getContractsInReferencePeriod = () => {
    const referenceDate = getReferenceDate();
    return contracts.filter(contract => new Date(contract.startDate) >= referenceDate);
  };

  const getTotalWorkDays = () => {
    const validContracts = getContractsInReferencePeriod();
    return validContracts.reduce((total, contract) => {
      return total + calculateWorkDays(contract.grossPay);
    }, 0);
  };

  const getProgressPercentage = () => {
    const totalDays = getTotalWorkDays();
    return Math.min((totalDays / REQUIRED_DAYS) * 100, 100);
  };

  // Gestion des choix multiples
  const addChoice = (type, value) => {
    if (value.trim() && !choices[type].includes(value.trim())) {
      setChoices(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const removeChoice = (type, value) => {
    setChoices(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  // Gestion des employeurs
  const saveEmployer = () => {
    if (!employerData.name.trim()) {
      alert('Le nom de l\'employeur est obligatoire');
      return;
    }
    
    const employerId = employerData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setEmployers(prev => ({
      ...prev,
      [employerId]: { ...employerData, id: employerId }
    }));
    
    setFormData({...formData, employer: employerData.name});
    setShowEmployerForm(false);
    resetEmployerForm();
  };

  const resetEmployerForm = () => {
    setEmployerData({
      name: '',
      contactPerson: '',
      email: '',
      phone1: '',
      phone2: '',
      vatNumber: '',
      address: '',
      website: '',
      notes: '',
      customFields: {}
    });
    setNewCustomField({ name: '', value: '' });
    setShowCustomFieldInput(false);
  };

  const addCustomField = () => {
    if (newCustomField.name.trim()) {
      setEmployerData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [newCustomField.name]: newCustomField.value
        }
      }));
      setNewCustomField({ name: '', value: '' });
      setShowCustomFieldInput(false);
    }
  };

  const removeCustomField = (fieldName) => {
    setEmployerData(prev => ({
      ...prev,
      customFields: Object.fromEntries(
        Object.entries(prev.customFields).filter(([key]) => key !== fieldName)
      )
    }));
  };

  const loadEmployerData = (employerName) => {
    const employerId = employerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const employer = employers[employerId];
    if (employer) {
      setEmployerData(employer);
    } else {
      setEmployerData(prev => ({ ...prev, name: employerName }));
    }
  };

  const handleSubmit = () => {
    if (!formData.employer || !formData.activity || !formData.startDate || !formData.grossPay) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (editingId) {
      setContracts(contracts.map(contract => 
        contract.id === editingId 
          ? { ...formData, id: editingId, workDays: calculateWorkDays(formData.grossPay) }
          : contract
      ));
      setEditingId(null);
    } else {
      const newContract = {
        ...formData,
        id: Date.now(),
        workDays: calculateWorkDays(formData.grossPay)
      };
      setContracts([...contracts, newContract]);
    }
    
    setFormData({
      employer: '',
      activity: '',
      startDate: '',
      endDate: '',
      grossPay: '',
      contractType: 'CDI',
      sector: 'audiovisuel',
      description: '',
      driveLink: ''
    });
    setShowForm(false);
  };

  const handleEdit = (contract) => {
    setFormData(contract);
    setEditingId(contract.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setContracts(contracts.filter(contract => contract.id !== id));
    delete portfolioItems[id];
    setPortfolioItems({...portfolioItems});
  };

  const addPortfolioItem = (contractId, item) => {
    setPortfolioItems(prev => ({
      ...prev,
      [contractId]: [...(prev[contractId] || []), { ...item, id: Date.now() + Math.random() }]
    }));
  };

  const removePortfolioItem = (contractId, itemId) => {
    setPortfolioItems(prev => ({
      ...prev,
      [contractId]: (prev[contractId] || []).filter(item => item.id !== itemId)
    }));
  };

  const handleFileUpload = (contractId, event) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = {
            type: 'image',
            data: e.target.result,
            name: file.name,
            description: ''
          };
          addPortfolioItem(contractId, item);
        };
        reader.readAsDataURL(file);
      }
    });
    
    event.target.value = '';
  };

  const startSlideshow = (contract) => {
    setSelectedContract(contract);
    setCurrentSlide(0);
    setShowSlideshow(true);
  };

  const nextSlide = () => {
    const items = portfolioItems[selectedContract?.id] || [];
    if (items.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }
  };

  const prevSlide = () => {
    const items = portfolioItems[selectedContract?.id] || [];
    if (items.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const exportPortfolioPDF = (contract) => {
    const items = portfolioItems[contract.id] || [];
    if (items.length === 0) {
      alert('Aucun élément dans le portfolio pour ce contrat');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Portfolio - ${contract.employer} - ${contract.activity}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .contract-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .portfolio-item { margin-bottom: 30px; page-break-inside: avoid; }
          .portfolio-item img { max-width: 100%; height: auto; border: 1px solid #ddd; }
          .item-description { margin-top: 10px; font-style: italic; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Portfolio de Travail</h1>
          <h2>${contract.employer}</h2>
          <h3>${contract.activity}</h3>
        </div>
        
        <div class="contract-info">
          <p><strong>Période:</strong> ${new Date(contract.startDate).toLocaleDateString('fr-BE')} ${contract.endDate ? '- ' + new Date(contract.endDate).toLocaleDateString('fr-BE') : ''}</p>
          <p><strong>Secteur:</strong> ${contract.sector}</p>
          <p><strong>Type de contrat:</strong> ${contract.contractType.toUpperCase()}</p>
          <p><strong>Rémunération:</strong> ${parseFloat(contract.grossPay).toFixed(2)}€</p>
          <p><strong>Jours calculés:</strong> ${contract.workDays.toFixed(2)}</p>
        </div>

        ${items.map((item, index) => `
          <div class="portfolio-item">
            <h4>Élément ${index + 1}</h4>
            ${item.type === 'image' ? `<img src="${item.data}" alt="${item.name}">` : ''}
            ${item.type === 'link' ? `<p><strong>Lien:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>` : ''}
            <p><strong>Nom:</strong> ${item.name}</p>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${contract.employer.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    
    alert('Portfolio exporté en HTML. Ouvrez le fichier et utilisez "Imprimer > Enregistrer en PDF" pour obtenir un PDF.');
  };

  const exportData = () => {
    const totalDays = getTotalWorkDays();
    const validContracts = getContractsInReferencePeriod();
    
    const exportData = {
      summary: {
        totalWorkDays: totalDays.toFixed(2),
        requiredDays: REQUIRED_DAYS,
        referencePeriod: `${REFERENCE_PERIOD_MONTHS} mois`,
        progress: `${getProgressPercentage().toFixed(1)}%`,
        exportDate: new Date().toLocaleDateString('fr-BE')
      },
      contracts: validContracts.map(contract => ({
        employeur: contract.employer,
        activite: contract.activity,
        dateDebut: contract.startDate,
        dateFin: contract.endDate,
        remunerationBrute: `${contract.grossPay}€`,
        joursCalcules: calculateWorkDays(contract.grossPay).toFixed(2),
        typeContrat: contract.contractType,
        secteur: contract.sector,
        portfolioItems: portfolioItems[contract.id] || []
      })),
      portfolioData: portfolioItems,
      employers: employers,
      choices: choices
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statut-artiste-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const totalDays = getTotalWorkDays();
  const validContracts = getContractsInReferencePeriod();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Suivi Statut Artiste - Belgique
          </h1>
          <p className="text-gray-600">
            Organisez vos contrats pour obtenir votre statut de travailleur des arts
          </p>
        </div>

        {/* Dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Jours acquis</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {totalDays.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">sur {REQUIRED_DAYS} requis</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Progression</h3>
                <p className="text-3xl font-bold text-green-600">
                  {progressPercentage.toFixed(1)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <Calendar className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Période référence</h3>
                <p className="text-xl font-bold text-purple-600">
                  {REFERENCE_PERIOD_MONTHS} mois
                </p>
                <p className="text-sm text-gray-500">
                  Depuis {getReferenceDate().toLocaleDateString('fr-BE')}
                </p>
              </div>
              <Euro className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau contrat
          </button>
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter données
          </button>
          <button
            onClick={() => setShowQuickList(!showQuickList)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            Liste rapide ({contracts.length})
          </button>
          <button
            onClick={() => setShowChoicesManager(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Gérer les choix
          </button>
        </div>

        {/* Choices Manager Modal */}
        {showChoicesManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Gestionnaire des choix multiples</h2>
                <button
                  onClick={() => setShowChoicesManager(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex">
                <div className="w-1/4 bg-gray-50 p-4 border-r">
                  <h3 className="font-semibold mb-4">Catégories</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'activities', label: 'Activités/Postes' },
                      { key: 'sectors', label: 'Secteurs' },
                      { key: 'contractTypes', label: 'Types de contrat' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveChoiceType(key)}
                        className={`w-full text-left p-2 rounded ${
                          activeChoiceType === key 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {activeChoiceType === 'activities' && 'Activités/Postes'}
                      {activeChoiceType === 'sectors' && 'Secteurs'}
                      {activeChoiceType === 'contractTypes' && 'Types de contrat'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {choices[activeChoiceType].length} éléments
                    </span>
                  </div>
                  
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter un nouvel élément..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addChoice(activeChoiceType, e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        if (input.value.trim()) {
                          addChoice(activeChoiceType, input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {choices[activeChoiceType].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <span className="flex-1">{item}</span>
                          <button
                            onClick={() => removeChoice(activeChoiceType, item)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employer Form Modal */}
        {showEmployerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Informations employeur</h2>
                <button
                  onClick={() => {
                    setShowEmployerForm(false);
                    resetEmployerForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'employeur *
                    </label>
                    <input
                      type="text"
                      value={employerData.name}
                      onChange={(e) => setEmployerData({...employerData, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personne de contact
                    </label>
                    <input
                      type="text"
                      value={employerData.contactPerson}
                      onChange={(e) => setEmployerData({...employerData, contactPerson: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={employerData.email}
                      onChange={(e) => setEmployerData({...employerData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone 1
                    </label>
                    <input
                      type="tel"
                      value={employerData.phone1}
                      onChange={(e) => setEmployerData({...employerData, phone1: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone 2
                    </label>
                    <input
                      type="tel"
                      value={employerData.phone2}
                      onChange={(e) => setEmployerData({...employerData, phone2: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de TVA
                    </label>
                    <input
                      type="text"
                      value={employerData.vatNumber}
                      onChange={(e) => setEmployerData({...employerData, vatNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={employerData.website}
                      onChange={(e) => setEmployerData({...employerData, website: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      value={employerData.address}
                      onChange={(e) => setEmployerData({...employerData, address: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={employerData.notes}
                      onChange={(e) => setEmployerData({...employerData, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </div>
                
                {/* Custom Fields */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Champs personnalisés</h3>
                    <button
                      onClick={() => setShowCustomFieldInput(true)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      + Ajouter un champ
                    </button>
                  </div>
                  
                  {showCustomFieldInput && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Nom du champ"
                          value={newCustomField.name}
                          onChange={(e) => setNewCustomField({...newCustomField, name: e.target.value})}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Valeur"
                          value={newCustomField.value}
                          onChange={(e) => setNewCustomField({...newCustomField, value: e.target.value})}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addCustomField}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomFieldInput(false);
                            setNewCustomField({ name: '', value: '' });
                          }}
                          className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {Object.entries(employerData.customFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                        <button
                          onClick={() => removeCustomField(key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowEmployerForm(false);
                    resetEmployerForm();
                  }}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={saveEmployer}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Modifier le contrat' : 'Nouveau contrat'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employeur *
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.employer}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setShowEmployerForm(true);
                        loadEmployerData('');
                      } else if (e.target.value === 'custom') {
                        setFormData({...formData, employer: ''});
                      } else {
                        setFormData({...formData, employer: e.target.value});
                        loadEmployerData(e.target.value);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un employeur</option>
                    {Object.values(employers).map(employer => (
                      <option key={employer.id} value={employer.name}>{employer.name}</option>
                    ))}
                    <option value="custom">✏️ Saisie manuelle</option>
                    <option value="new">➕ Nouvel employeur (avec contacts)</option>
                  </select>
                  
                  {(formData.employer === '' || !Object.values(employers).find(e => e.name === formData.employer)) && (
                    <input
                      type="text"
                      value={formData.employer}
                      onChange={(e) => setFormData({...formData, employer: e.target.value})}
                      placeholder="Nom de l'employeur..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {formData.employer && employers[formData.employer.toLowerCase().replace(/[^a-z0-9]/g, '_')] && (
                    <button
                      onClick={() => {
                        loadEmployerData(formData.employer);
                        setShowEmployerForm(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      📝 Voir/Modifier les infos de contact
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité / Poste *
                </label>
                <select
                  value={formData.activity}
                  onChange={(e) => setFormData({...formData, activity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez une activité</option>
                  {choices.activities.map(activity => (
                    <option key={activity} value={activity}>{activity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rémunération brute (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grossPay}
                  onChange={(e) => setFormData({...formData, grossPay: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.grossPay && (
                  <p className="text-sm text-blue-600 mt-1">
                    = {calculateWorkDays(formData.grossPay).toFixed(2)} jours de travail
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {choices.contractTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secteur
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {choices.sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lien Google Drive (PDF du contrat)
                </label>
                <input
                  type="url"
                  value={formData.driveLink}
                  onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Modifier' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      employer: '',
                      activity: '',
                      startDate: '',
                      endDate: '',
                      grossPay: '',
                      contractType: 'CDI',
                      sector: 'audiovisuel',
                      description: '',
                      driveLink: ''
                    });
                  }}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Modal */}
        {showPortfolio && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold">Portfolio - {selectedContract.employer}</h2>
                  <p className="text-gray-600">{selectedContract.activity}</p>
                </div>
                <div className="flex gap-2">
                  {(portfolioItems[selectedContract.id]?.length > 0) && (
                    <>
                      <button
                        onClick={() => startSlideshow(selectedContract)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Diaporama
                      </button>
                      <button
                        onClick={() => exportPortfolioPDF(selectedContract)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export PDF
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowPortfolio(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Ajouter des éléments</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📷 Upload d'images
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(selectedContract.id, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, GIF, etc.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔗 Ajouter un lien
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/video ou lien vers votre travail..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addPortfolioItem(selectedContract.id, {
                                type: 'link',
                                url: e.target.value.trim(),
                                name: e.target.value.trim(),
                                description: ''
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input[type="url"]');
                            if (input && input.value.trim()) {
                              addPortfolioItem(selectedContract.id, {
                                type: 'link',
                                url: input.value.trim(),
                                name: input.value.trim(),
                                description: ''
                              });
                              input.value = '';
                            }
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, portfolio en ligne, etc.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(portfolioItems[selectedContract.id] || []).map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.type === 'image' ? '📷 Image' : '🔗 Lien'} #{index + 1}
                        </span>
                        <button
                          onClick={() => removePortfolioItem(selectedContract.id, item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          title="Supprimer cet élément"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {item.type === 'image' && (
                        <div className="mb-2">
                          <img
                            src={item.data}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => startSlideshow(selectedContract)}
                            title="Cliquer pour voir en grand"
                          />
                        </div>
                      )}
                      
                      {item.type === 'link' && (
                        <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center border">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded transition-colors"
                            title="Ouvrir dans un nouvel onglet"
                          >
                            <ExternalLink className="w-8 h-8" />
                            <span className="text-xs text-center">Ouvrir le lien</span>
                          </a>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium truncate" title={item.name}>
                          {item.name}
                        </p>
                        
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            setPortfolioItems(prev => ({
                              ...prev,
                              [selectedContract.id]: (prev[selectedContract.id] || []).map(i =>
                                i.id === item.id ? { ...i, description: e.target.value } : i
                              )
                            }));
                          }}
                          placeholder="Ajoutez une description de votre travail..."
                          className="w-full p-2 text-xs border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {(!portfolioItems[selectedContract.id] || portfolioItems[selectedContract.id].length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">Portfolio vide</h4>
                    <p className="text-sm mb-4">Ajoutez des images et des liens pour documenter ce projet</p>
                    <p className="text-xs text-gray-400">
                      💡 Exemples: captures d'écran de votre travail, liens vers des vidéos YouTube, extraits de films, etc.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slideshow */}
        {showSlideshow && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <button
              onClick={() => setShowSlideshow(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronRight className="w-12 h-12" />
            </button>

            <div className="text-center">
              {(() => {
                const items = portfolioItems[selectedContract.id] || [];
                const currentItem = items[currentSlide];
                
                if (!currentItem) return <div className="text-white">Aucun élément</div>;
                
                return (
                  <div className="max-w-4xl">
                    {currentItem.type === 'image' && (
                      <img
                        src={currentItem.data}
                        alt={currentItem.name}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    )}
                    
                    {currentItem.type === 'link' && (
                      <div className="bg-white p-8 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Lien externe</h3>
                        <a
                          href={currentItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center"
                        >
                          <ExternalLink className="w-6 h-6" />
                          {currentItem.name}
                        </a>
                      </div>
                    )}
                    
                    <div className="text-white mt-4">
                      <p className="font-semibold">{currentItem.name}</p>
                      {currentItem.description && (
                        <p className="text-gray-300 mt-2">{currentItem.description}</p>
                      )}
                      <p className="text-gray-400 text-sm mt-2">
                        {currentSlide + 1} / {items.length}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Contrats dans la période de référence ({validContracts.length})
          </h2>
          
          {validContracts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun contrat dans la période de référence.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">Employeur</th>
                    <th className="text-left py-3 px-2">Activité</th>
                    <th className="text-left py-3 px-2">Date début</th>
                    <th className="text-left py-3 px-2">Rémunération</th>
                    <th className="text-left py-3 px-2">Jours</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {validContracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map(contract => (
                    <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{contract.employer}</td>
                      <td className="py-3 px-2">{contract.activity}</td>
                      <td className="py-3 px-2">
                        {new Date(contract.startDate).toLocaleDateString('fr-BE')}
                      </td>
                      <td className="py-3 px-2 text-green-600 font-medium">
                        {parseFloat(contract.grossPay).toFixed(2)}€
                      </td>
                      <td className="py-3 px-2 text-blue-600 font-medium">
                        {contract.workDays.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          {contract.driveLink && (
                            <a
                              href={contract.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedContract(contract);
                              setShowPortfolio(true);
                            }}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          {(portfolioItems[contract.id]?.length > 0) && (
                            <button
                              onClick={() => startSlideshow(contract)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(contract)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contract.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Informations sur le statut d'artiste
          </h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Vous devez justifier de 156 jours de travail sur 24 mois</li>
            <li>• Le calcul : rémunération brute ÷ 81,23€ = nombre de jours</li>
            <li>• Maximum 78 jours par trimestre comptabilisés</li>
            <li>• Tous types d'activité salariée comptent (artistique ou non)</li>
          </ul>
        </div>

        {totalDays >= REQUIRED_DAYS && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Félicitations !
            </h3>
            <p className="text-green-700">
              Vous avez atteint les {REQUIRED_DAYS} jours requis !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistStatusTracker;