import React, { useState, useEffect } from 'react';
import { sendRepairForm } from '../utils/sendRepairForm';
import { X, Upload, Check, AlertCircle, Save } from 'lucide-react';

interface RepairFormData {
  fullName: string;
  email: string;
  phone: string;
  equipmentType: string;
  brandModel: string;
  serialNumber: string;
  problemDescription: string;
  images: File[];
  urgency: 'Baixa' | 'Média' | 'Alta';
  contactPreference: string;
  additionalNotes: string;
}

interface RepairRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RepairRequestForm: React.FC<RepairRequestFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<RepairFormData>({
    fullName: '',
    email: '',
    phone: '',
    equipmentType: '',
    brandModel: '',
    serialNumber: '',
    problemDescription: '',
    images: [],
    urgency: 'Média',
    contactPreference: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Partial<RepairFormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const hasContent = Object.values(formData).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return typeof value === 'string' && value.trim() !== '';
      });

      if (hasContent) {
        try {
          localStorage.setItem('repairFormDraft', JSON.stringify({
            ...formData,
            images: []
          }));
          setIsDraftSaved(true);
          setTimeout(() => setIsDraftSaved(false), 2000);
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, isOpen]);

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      try {
        const savedDraft = localStorage.getItem('repairFormDraft');
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(prev => ({
            ...prev,
            ...parsedDraft,
            images: []
          }));
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RepairFormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Formato: (11) 99999-9999';
    }
    if (!formData.equipmentType.trim()) newErrors.equipmentType = 'Tipo de equipamento é obrigatório';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Descrição do problema é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof RepairFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value;
      } else if (value.length <= 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length <= 10) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
    }
    setFormData(prev => ({ ...prev, phone: value }));

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 3) {
      setErrors(prev => ({ ...prev, images: 'Máximo de 3 imagens permitidas' as any }));
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, images: 'Apenas imagens PNG/JPG até 5MB são permitidas' as any }));
      return;
    }

    const newImages = [...formData.images, ...validFiles];
    setFormData(prev => ({ ...prev, images: newImages }));

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);

    setErrors(prev => ({ ...prev, images: undefined as any }));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);

    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index]);
    }

    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await sendRepairForm(formData);
      if (response.success) {
        setIsSubmitted(true);
        localStorage.removeItem('repairFormDraft');
        setTimeout(() => {
          setIsSubmitted(false);
          setIsSubmitting(false);
          resetForm();
          onClose();
        }, 3000);
      } else {
        alert('Erro: ' + response.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Erro ao enviar o formulário. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      equipmentType: '',
      brandModel: '',
      serialNumber: '',
      problemDescription: '',
      images: [],
      urgency: 'Média',
      contactPreference: '',
      additionalNotes: ''
    });
    setErrors({});
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
  };

  const handleCancel = () => {
    const hasContent = Object.values(formData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === 'string' && value.trim() !== '';
    });

    if (hasContent) {
      const shouldSave = window.confirm('Deseja salvar o rascunho antes de sair?');
      if (shouldSave) {
        try {
          localStorage.setItem('repairFormDraft', JSON.stringify({
            ...formData,
            images: []
          }));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }
    }

    resetForm();
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitted) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitted, formData]);

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Solicitação Enviada!
          </h3>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de reparo. Nossa equipe técnica entrará em contato em até 24 horas.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Próximos passos:</strong><br />
              1. Análise técnica<br />
              2. Orçamento<br />
              3. Agendamento
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Solicitação de Reparo</h2>
              <p className="text-gray-600">Preencha os dados para diagnóstico técnico</p>
            </div>
            <div className="flex items-center space-x-2">
              {isDraftSaved && (
                <div className="flex items-center text-green-600 text-sm">
                  <Save className="h-4 w-4 mr-1" />
                  Rascunho salvo
                </div>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar formulário"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Digite seu nome completo"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail de Contato *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Digite seu e-mail"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairRequestForm;
