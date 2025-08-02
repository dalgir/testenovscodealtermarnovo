interface RepairFormData {
  fullName: string;
  email: string;
  phone: string;
  equipmentType: string;
  brandModel: string;
  serialNumber: string;
  problemDescription: string;
  images: File[];
  urgency: string;
  contactPreference: string;
  additionalNotes: string;
}

export async function sendRepairForm(data: RepairFormData): Promise<any> {
  const formData = new FormData();

  // Campos principais
  formData.append('fullName', data.fullName);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('equipmentType', data.equipmentType);
  formData.append('brandModel', data.brandModel);
  formData.append('serialNumber', data.serialNumber);
  formData.append('problemDescription', data.problemDescription);
  formData.append('urgency', data.urgency);
  formData.append('contactPreference', data.contactPreference);
  formData.append('additionalNotes', data.additionalNotes);

  // Corrigido: imagens todas com o nome 'images'
  data.images.forEach((file) => {
    formData.append('images', file); // ✅ nome deve ser exatamente 'images'
  });

  try {
    const response = await fetch('http://localhost:5000/api/repair-request', {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Resposta do servidor não é JSON válida.');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar o formulário:', error);
    return {
      success: false,
      message: 'Erro de rede ou resposta inválida do servidor.',
    };
  }
}

