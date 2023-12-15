const nodemailer = require("nodemailer");

export async function enviarEmail(emailDestino:string, tokenRedefinicaoSenha:string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'zzzz',
      pass: 'zzz',
    },
  });

  try {

    const htmlEmail = `
      <p>Foi feita uma solicitação de alteração de senha no Bushido Dojo nesse email.</p>
      <p>Se você solicitou essa alteração, utilize o token a seguir para prosseguir:</p>
      <p>Token: ${tokenRedefinicaoSenha}</p>
      <p>Se não reconhece esta solicitação, ignore esta mensagem.</p>
    `;
    const info = await transporter.sendMail({
      from: 'Bushido Dojo <joaocoromberk@gmail.com>',
      to: emailDestino,
      subject:"Redefinição de senha Bushido Dojo.",
      html:htmlEmail,
      text:"Foi feita uma solicitação de alteração de senha no Bushido Dojo nesse email, se não reconhece esta solicitação ignorar a mensagem.",

    });

    console.log('E-mail enviado com sucesso:', info);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}
