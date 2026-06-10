package br.com.biketracker.app.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Trakker: Recuperação de senha");
        message.setText(
                "Olá,\n\n" +
                        "Recebemos uma solicitação para redefinir sua senha.\n\n" +
                        "Clique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n" +
                        resetLink + "\n\n" +
                        "Se você não solicitou isso, ignore este e-mail.\n\n" +
                        "Atenciosamente,\nEquipe de Suporte"
        );
        try {
        mailSender.send(message);

        } catch (MailException ex) {
            ex.printStackTrace();
        }
    }
}
