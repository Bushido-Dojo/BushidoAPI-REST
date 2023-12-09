export function converteDataFormato(data: string): string | null {
    const partes = data.split('/');
    
    if (partes.length !== 3) {
      console.error('Formato de data inválido. Use o formato dd/mm/yyyy.');
      return null;
    }
  
    const [dia, mes, ano] = partes.map(Number);
  
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
      console.error('Formato de data inválido. Use apenas números para dia, mês e ano.');
      return null;
    }
  
    const dataFormatada = new Date(ano, mes - 1, dia);
  
    if (isNaN(dataFormatada.getTime())) {
      console.error('Data inválida.');
      return null;
    }
    
    const dataSQL = `${ano}-${(mes < 10 ? '0' : '') + mes}-${(dia < 10 ? '0' : '') + dia}`;
    
    return dataSQL;
  }
  
