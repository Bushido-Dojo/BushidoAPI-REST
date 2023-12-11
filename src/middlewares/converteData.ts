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
  

export function converteIso8601(dataISO:Date){
    const day = dataISO.getUTCDate().toString().padStart(2, '0');
    const month = (dataISO.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = dataISO.getUTCFullYear();

    return `${day}/${month}/${year}`;
}
