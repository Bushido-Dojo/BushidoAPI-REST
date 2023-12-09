export function converteDataFormato(data: string): string | null {
    const partes = data.split('/');
    
    // Verifica se a string possui três partes (dia, mês, ano)
    if (partes.length !== 3) {
      console.error('Formato de data inválido. Use o formato dd/mm/yyyy.');
      return null;
    }
  
    // Extrai o dia, mês e ano da string
    const [dia, mes, ano] = partes.map(Number);
  
    // Verifica se as partes extraídas são números válidos
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
      console.error('Formato de data inválido. Use apenas números para dia, mês e ano.');
      return null;
    }
  
    // Cria um objeto Date com as partes extraídas
    const dataFormatada = new Date(ano, mes - 1, dia);
  
    // Verifica se a data é válida
    if (isNaN(dataFormatada.getTime())) {
      console.error('Data inválida.');
      return null;
    }
  
    // Obtém o formato yyyy-mm-dd
    const dataSQL = `${ano}-${(mes < 10 ? '0' : '') + mes}-${(dia < 10 ? '0' : '') + dia}`;
    
    return dataSQL;
  }
  
