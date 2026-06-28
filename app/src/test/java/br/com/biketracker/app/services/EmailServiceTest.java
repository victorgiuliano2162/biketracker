package br.com.biketracker.app.services;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;


    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        emailService = new EmailService(mailSender);

        // Injeta manualmente as propriedades @Value
        ReflectionTestUtils.setField(emailService, "fromEmail", "suporte@trakker.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://trakker.com");
    }

    @Test
    @DisplayName("Deve montar o SimpleMailMessage corretamente e enviar o e-mail de recuperação")
    void sendPasswordResetEmail_Sucesso() {
        String toEmail = "vitor@teste.com";
        String token = "uuid-token-123";
        String expectedLink = "https://trakker.com/reset-password?token=uuid-token-123";

        // Captura o objeto SimpleMailMessage enviado para fazermos os asserts internos dele
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        emailService.sendPasswordResetEmail(toEmail, token);

        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertThat(sentMessage.getFrom()).isEqualTo("suporte@trakker.com");
        assertThat(sentMessage.getTo()).containsExactly(toEmail);
        assertThat(sentMessage.getSubject()).isEqualTo("Trakker: Recuperação de senha");
        assertThat(sentMessage.getText())
                .contains(expectedLink)
                .contains("válido por 1 hora");
    }

    @Test
    @DisplayName("Deve capturar a MailException de forma segura e não estourar erro para o client")
    void sendPasswordResetEmail_TratamentoErro_Sucesso() {
        String toEmail = "vitor@teste.com";
        String token = "token";

        // Força uma exceção do Spring Mail ao tentar enviar
        doThrow(new MailSendException("Falha no servidor SMTP")).when(mailSender).send(any(SimpleMailMessage.class));

        // O método não deve propagar a exceção (pois tem um bloco try-catch interno que consome o erro)
        emailService.sendPasswordResetEmail(toEmail, token);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
