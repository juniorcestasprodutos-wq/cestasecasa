
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export const sendWhatsAppMessage = (phone: string, message: string) => {
  const cleanedPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const generateRescheduleMessage = (clientName: string, dueDate: string) => {
  return `Olá ${clientName}, notamos que sua parcela com vencimento hoje não foi paga. Reagendamos o pagamento para ${formatDate(dueDate)}. Favor confirmar o recebimento desta mensagem. Atenciosamente, Cestas e Casa.`;
};

export const formatFirstName = (name: string) => {
  if (!name) return '';
  return name.trim().split(' ')[0];
};

export const applyCurrencyMask = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (!v) return '';
  v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',');
  v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return v;
};

export const parseCurrencyMask = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

export const applyDateMask = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) {
    return v.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d+)/, '$1/$2');
  }
  return v;
};
