import React, { useState } from 'react';
import { MessageCircle, Wrench, X, Send, Upload, Check, AlertCircle, FileText, User, Mail, Phone, Calendar, Tag, MessageSquare } from 'lucide-react';

interface RepairFormData {
  // Dados pessoais
  fullName: string;
  phone: string;
  email: string;
  
  // Dados do equipamento
  equipmentType: string;
  brandModel: string;
  serialNumber: string;
  purchaseDate: string;
  problemDescription: string;
  
  // Anexos
  images: File[];
}

interface MessageFormData {
  // Dados pessoais
  fullName: string;
  phone: string;
  email: string;
  
  // Dados da mensagem
  subject: string;
  category: string;
  message: string;
}

interface FormStatus {
  isSubmitting: boolean;
  status: 'idle' | 'success' | 'error';
  message: string;
}

const CustomerServiceForms = () => {
  const [activeForm, setActiveForm] = useState<'repair' | 'message' | null>(null);
  
  // Estados dos formulários
  const [repairForm, setRepairForm] = useState<RepairFormData>({
    fullName: '',
    phone: '',
    email: '',
    equipmentType: '',
    brandModel: '',
    serialNumber: '',
    purchaseDate: '',
    problemDescription: '',
    images: []
  });

  const [messageForm, setMessageForm] = useState<MessageFormData>({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const [repairStatus, setRepairStatus] = useState<FormStatus>({
    isSubmitting: false,
    status: 'idle',
    message: ''
  });

  const [messageStatus, setMessageStatus] = useState<FormStatus>({
    isSubmitting: false,
    status: 'idle',
    message: ''
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
    }
    return value;
  };

  // Validação de email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Manipulação de imagens
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + repairForm.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Máximo de 5 imagens permitidas' }));
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, images: 'Apenas imagens PNG/JPG até 10MB são permitidas' }));
      return;
    }

    const newImages = [...repairForm.images, ...validFiles];
    setRepairForm(prev => ({ ...prev, images: newImages }));

    // Preview das imagens
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);

    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    const newImages = repairForm.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index]);
    }
    
    setRepairForm(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  // Validação do formulário de reparo
  const validateRepairForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!repairForm.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
    if (!repairForm.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!repairForm.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(repairForm.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!repairForm.equipmentType) newErrors.equipmentType = 'Tipo de equipamento é obrigatório';
    if (!repairForm.problemDescription.trim()) newErrors.problemDescription = 'Descrição do problema é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validação do formulário de mensagem
  const validateMessageForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!messageForm.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
    if (!messageForm.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!messageForm.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(messageForm.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!messageForm.subject.trim()) newErrors.subject = 'Assunto é obrigatório';
    if (!messageForm.category) newErrors.category = 'Categoria é obrigatória';
    if (!messageForm.message.trim()) newErrors.message = 'Mensagem é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário de reparo
  const handleRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRepairForm()) return;

    setRepairStatus({ isSubmitting: true, status: 'idle', message: '' });

    try {
      const formData = new FormData();
      
      // Adicionar dados do formulário
      Object.entries(repairForm).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, value as string);
        }
      });

      // Adicionar imagens
      repairForm.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/repair-request', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setRepairStatus({
          isSubmitting: false,
          status: 'success',
          message: 'Solicitação de reparo enviada com sucesso! Nossa equipe entrará em contato em breve.'
        });
        
        // Reset form
        setRepairForm({
          fullName: '',
          phone: '',
          email: '',
          equipmentType: '',
          brandModel: '',
          serialNumber: '',
          purchaseDate: '',
          problemDescription: '',
          images: []
        });
        setImagePreview([]);
        setErrors({});
      } else {
        throw new Error(result.message || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      setRepairStatus({
        isSubmitting: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  };

  // Envio do formulário de mensagem
  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMessageForm()) return;

    setMessageStatus({ isSubmitting: true, status: 'idle', message: '' });

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageForm)
      });

      const result = await response.json();

      if (response.ok) {
        setMessageStatus({
          isSubmitting: false,
          status: 'success',
          message: 'Mensagem enviada com sucesso! Responderemos em breve.'
        });
        
        // Reset form
        setMessageForm({
          fullName: '',
          phone: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
        setErrors({});
      } else {
        throw new Error(result.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      setMessageStatus({
        isSubmitting: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  };

  // Componente de seleção de formulário
  if (!activeForm) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Atendimento ao Cliente
            </h2>
            <p className="text-lg text-gray-600">
              Escolha o tipo de atendimento que você precisa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulário de Reparo */}
            <div 
              onClick={() => setActiveForm('repair')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Solicitação de Reparo
                </h3>
                <p className="text-gray-600 mb-6">
                  Precisa de reparo em algum equipamento? Preencha os dados e nossa equipe técnica entrará em contato.
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-2">
                  <li>• Diagnóstico técnico especializado</li>
                  <li>• Orçamento sem compromisso</li>
                  <li>• Garantia em todos os serviços</li>
                  <li>• Atendimento em até 24h</li>
                </ul>
              </div>
            </div>

            {/* Formulário de Mensagem */}
            <div 
              onClick={() => setActiveForm('message')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:transform hover:scale-105 border-2 border-transparent hover:border-green-500"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Enviar Mensagem
                </h3>
                <p className="text-gray-600 mb-6">
                  Tem alguma dúvida, sugestão ou precisa de informações? Entre em contato conosco.
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-2">
                  <li>• Dúvidas técnicas</li>
                  <li>• Informações sobre produtos</li>
                  <li>• Sugestões e feedback</li>
                  <li>• Suporte geral</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Formulário de Reparo
  if (activeForm === 'repair') {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Solicitação de Reparo</h2>
                    <p className="text-blue-100">Preencha os dados para diagnóstico técnico</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveForm(null)}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {repairStatus.status === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-700">{repairStatus.message}</p>
                </div>
              </div>
            )}

            {repairStatus.status === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700">{repairStatus.message}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRepairSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={repairForm.fullName}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite seu nome completo"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={repairForm.phone}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={repairForm.email}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Dados do Equipamento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Dados do Equipamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Equipamento *
                    </label>
                    <select
                      value={repairForm.equipmentType}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, equipmentType: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.equipmentType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="inversor">Inversor de Frequência</option>
                      <option value="placa">Placa Eletrônica</option>
                      <option value="motor">Motor Elétrico</option>
                      <option value="sensor">Sensor Industrial</option>
                      <option value="controlador">Controlador/PLC</option>
                      <option value="fonte">Fonte de Alimentação</option>
                      <option value="servo">Servo Motor</option>
                      <option value="outro">Outro</option>
                    </select>
                    {errors.equipmentType && <p className="mt-1 text-sm text-red-600">{errors.equipmentType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca e Modelo
                    </label>
                    <input
                      type="text"
                      value={repairForm.brandModel}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, brandModel: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Siemens G120, ABB ACS550"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Série
                    </label>
                    <input
                      type="text"
                      value={repairForm.serialNumber}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Se disponível"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Compra
                    </label>
                    <input
                      type="date"
                      value={repairForm.purchaseDate}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição do Problema */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Detalhada do Problema *
                </label>
                <textarea
                  value={repairForm.problemDescription}
                  onChange={(e) => setRepairForm(prev => ({ ...prev, problemDescription: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.problemDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descreva o problema em detalhes: sintomas, quando começou, condições de uso, etc."
                />
                {errors.problemDescription && <p className="mt-1 text-sm text-red-600">{errors.problemDescription}</p>}
              </div>

              {/* Upload de Imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos do Equipamento (até 5 imagens)
                </label>
                
                {repairForm.images.length < 5 && (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Clique para adicionar fotos ou arraste aqui</p>
                    <p className="text-sm text-gray-500">PNG, JPG até 10MB cada</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}

                {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}

                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={repairStatus.isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {repairStatus.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Formulário de Mensagem
  if (activeForm === 'message') {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Enviar Mensagem</h2>
                    <p className="text-green-100">Entre em contato conosco</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveForm(null)}
                  className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {messageStatus.status === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-700">{messageStatus.message}</p>
                </div>
              </div>
            )}

            {messageStatus.status === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700">{messageStatus.message}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleMessageSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={messageForm.fullName}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite seu nome completo"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={messageForm.phone}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={messageForm.email}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Dados da Mensagem */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Sua Mensagem
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Qual o assunto da sua mensagem?"
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={messageForm.category}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="duvida">Dúvida Técnica</option>
                      <option value="orcamento">Solicitação de Orçamento</option>
                      <option value="informacao">Informações sobre Produtos</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="elogio">Elogio</option>
                      <option value="outro">Outro</option>
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem Detalhada *
                    </label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Descreva sua mensagem em detalhes..."
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={messageStatus.isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {messageStatus.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default CustomerServiceForms;