# Plano e Especificação de Casos de Teste (Cenários de Integração e Negócio)

**Componente Alvo:** `RouteService`  
**Objetivo:** Garantir a integridade das regras de negócio relacionadas ao gerenciamento de rotas de ciclismo (criação, privacidade, exclusão, replay e manipulação geométrica/espacial).

---

## 1. Fluxo de Criação de Rotas (`createRoute`)

### CT-01: Criar rota com sucesso
* **Descrição:** Garantir que um ciclista autenticado consiga registrar uma nova rota com todos os seus pontos de traçado válidos.
* **Pré-condições:** Usuário cadastrado no sistema.
* **Dados de Entrada:** * `userId` (E-mail): `"ciclista@teste.com"`
  * `CreateRouteRequest`: `[distanceInKm: 50.5, elevationInMeters: 600.0, startCity: "Recife", trackPoints: List.of(...)]`
* **Passos:**
  1. Chamar o endpoint/método de criação enviando o e-mail e o payload da rota.
  2. O sistema busca o usuário por e-mail.
  3. O sistema processa o `LineString` com o `GeometryFactory` e calcula o tempo da atividade.
  4. A rota é persistida.
* **Resultado Esperado:** Retorno de um `RouteResponse` preenchido, ID da rota gerado e invalidação do cache `userRoutes`.

### CT-02: Tentar criar rota com usuário inexistente
* **Descrição:** Validar o comportamento do sistema ao tentar salvar uma rota vinculada a uma credencial/e-mail inválida.
* **Dados de Entrada:** `userId` (E-mail): `"invalido@teste.com"`, `CreateRouteRequest` populado.
* **Passos:**
  1. Chamar o método enviando o e-mail inexistente.
* **Resultado Esperado:** O sistema interrompe a operação e lança uma exceção `ResourceNotFoundException` com a mensagem `"User not found"`. Nenhuma rota deve ser salva.

---

## 2. Busca e Segurança de Acesso (`getRouteById`)

### CT-03: Buscar rota com sucesso (Dono da Rota)
* **Descrição:** Validar se o proprietário da rota consegue visualizá-la detalhadamente.
* **Pré-condições:** Rota cadastrada no banco pertencente ao usuário requisitante.
* **Dados de Entrada:** `userId`: `"usr-123"`, `routeId`: `"rot-999"`
* **Resultado Esperado:** Retorna o `RouteResponse` correspondente. O resultado deve ser armazenado no cache `routes`.

### CT-04: Buscar rota de outro usuário (Acesso Negado)
* **Descrição:** Garantir que um usuário não consiga espionar ou obter dados de uma rota privada que pertença a outro ciclista.
* **Pré-condições:** A rota `"rot-999"` pertence exclusivamente ao `"usr-123"`. O usuário requisitante é o `"usr-hacker"`.
* **Dados de Entrada:** `userId`: `"usr-hacker"`, `routeId`: `"rot-999"`
* **Resultado Esperado:** O sistema identifica o conflito de propriedade e lança uma exceção `AccessDeniedException` com a mensagem `"Essa rota não pertence ao usuário"`.

### CT-05: Buscar rota com usuário inexistente
* **Descrição:** Garantir blindagem caso a requisição passe um identificador de usuário corrompido ou apagado.
* **Resultado Esperado:** Lança `ResourceNotFoundException` ("Usuário não encontrado").

### CT-06: Buscar rota inexistente
* **Descrição:** Validar o comportamento quando a rota solicitada não existe na base de dados.
* **Dados de Entrada:** `userId`: `"usr-123"`, `routeId`: `"id-fantasma"`
* **Resultado Esperado:** Lança `ResourceNotFoundException` ("Rota não encontrada: id-fantasma").

---

## 3. Fluxo de Exclusão (`deleteRoute`)

### CT-07: Deletar rota sendo o proprietário
* **Descrição:** Garantir a remoção completa dos dados de uma rota e de seus anexos (imagens) pelo seu criador.
* **Passos:**
  1. O sistema valida se `existsByIdAndUserId(routeId, userId)` é verdadeiro.
  2. Remove os arquivos de imagem associados via `activityImageService`.
  3. Remove o registro do banco de dados.
* **Resultado Esperado:** Retorna `true`. Todos os caches relacionados (`routes`, `routeReplays`, `userRoutes`, `routeStats`) são limpos/evictados.

### CT-08: Deletar rota sem ser o proprietário
* **Descrição:** Garantir que uma tentativa de deleção por terceiros seja rejeitada imediatamente.
* **Resultado Esperado:** Retorna `false`. O `routeRepository.deleteById` e o `activityImageService.deleteImageByRouteId` **nunca** devem ser chamados.

---

## 4. Controle de Privacidade (`toggleVisibility`)

### CT-09: Alternar visibilidade com sucesso
* **Descrição:** Validar que o usuário pode alternar o status de sua rota entre Público e Privado.
* **Resultado Esperado:** Se a rota era `isPublic = false`, passa a ser `true`. Retorna o `RouteResponse` atualizado e limpa os caches de rotas públicas.

### CT-10: Alternar visibilidade de rota alheia
* **Descrição:** Impedir a alteração de privacidade por usuários não autorizados.
* **Resultado Esperado:** Lança `AccessDeniedException` e o estado no banco permanece inalterado.

---

## 5. Mapeamento e Geolocalização (`getRouteReplay` e Bounding Box)

### CT-11: Obter pontos de replay com sucesso
* **Descrição:** Validar a recuperação da lista de coordenadas cronológicas (`TrackPoint`) para renderização do caminho percorrido na tela.
* **Comportamento Interno:** A camada de serviço deve converter com sucesso as colunas de data da query


# Plano e Especificação de Casos de Teste (Camada de Storage / MinIO)

**Componente Alvo:** `MinioStorageService`  
**Objetivo:** Garantir o funcionamento correto das operações de upload, remoção, verificação e geração de URLs dinâmicas para mídias (fotos de atividades e pré-visualizações de mapas) persistidas no MinIO S3.

---

## Configurações de Ambiente (Contexto Base)
Para a execução dos testes, o componente utiliza propriedades dinâmicas injetadas via `@Value` que ditam o comportamento de rede e nomenclatura dos diretórios:
* **Endpoint Interno (`minioEndpoint`):** `http://localhost:9000` (Usado pela aplicação para comunicação direta na infraestrutura).
* **Endpoint Público (`minioPublicEndpoint`):** `https://s3.biketracker.com` (Usado para expor os links acessíveis ao cliente final/frontend).
* **Bucket Padrão (`bucket`):** `biketracker-bucket`

---

## 1. Upload de Imagens de Atividades (`uploadActivityImage`)

### CT-01: Upload de imagem de atividade com sucesso
* **Descrição:** Validar se o sistema gera a estrutura correta de diretórios/Object Keys ao salvar a foto de um pedal associada a uma atividade.
* **Dados de Entrada:** * `activityId`: Um UUID aleatório (ex: `a1b2c3d4-...`)
  * `file`: Um arquivo multipart válido (ex: `foto.png`, tipo `image/png`).
* **Passos:**
  1. Chamar o método enviando o identificador da atividade e os bytes do arquivo.
  2. O sistema aciona o `MinioClient.putObject`.
* **Resultado Esperado:** O upload é concluído sem erros e retorna uma chave/path textual contendo exatamente a máscara estruturada: `activities/{activityId}/{nome-gerado}.png`.

---

## 2. Geração de Links Assinados (`generatePresignedUrl`)

### CT-02: Mascarar URL interna por endpoint público (Sucesso)
* **Descrição:** Garantir que o link temporário assinado retornado ao usuário substitua com sucesso os IPs/endereços da rede interna de contêineres pelo domínio de produção público.
* **Pré-condições:** O MinIO retorna originalmente o path resolvido com o host de infraestrutura interna: `http://localhost:9000/...`
* **Dados de Entrada:** `objectKey`: `"activities/123/foto.jpg"`
* **Resultado Esperado:** O método intercepta o retorno do SDK e faz o parse da String com sucesso, devolvendo: `https://s3.biketracker.com/biketracker-bucket/activities/123/foto.jpg?token=abc`.

---

## 3. Exclusão de Mídias (`deleteImage`)

### CT-03: Acionar comando de deleção física no bucket
* **Descrição:** Validar que a chamada do método dispara a remoção do objeto do storage.
* **Dados de Entrada:** `objectKey`: `"activities/123/foto.jpg"`
* **Resultado Esperado:** O método intercepta a chave informada e delega a operação invocando o `MinioClient.removeObject` exatamente uma vez com os argumentos corretos.

---

## 4. Pré-visualizações de Rotas (`uploadRoutePreview` e `getRoutePreviewUrl`)

### CT-04: Upload de preview de mapa (PNG bruto) com sucesso
* **Descrição:** Garantir o upload dos bytes gerados do mapa estático e o retorno imediato da URL pública correspondente.
* **Dados de Entrada:** `routeId`: `"rota-456"`, `pngBytes`: Array de bytes representando o arquivo PNG montado no frontend.
* **Passos:**
  1. O sistema verifica a existência ou cria o bucket específico de previews (`trakker-previews`).
  2. Executa o upload através do método `putObject`.
* **Resultado Esperado:** Retorna a URL final formatada com o domínio público sob o padrão: `https://s3.biketracker.com/trakker-previews/previews/rota-456.png`.

### CT-05: Buscar URL de preview existente no Storage
* **Descrição:** Validar se o sistema consegue checar a existência do arquivo de preview e retornar o link de acesso direto.
* **Dados de Entrada:** `routeId`: `"rota-789"`
* **Comportamento Interno:** Executa o método de metadados `MinioClient.statObject`. Caso o objeto exista, nenhum erro é lançado.
* **Resultado Esperado:** Retorna a String contendo a URL pública válida para o mapa da rota.

### CT-06: Tratar ausência de preview e retornar nulo de forma segura
* **Descrição:** Garantir que se uma rota ainda não possuir uma imagem estática persistida no MinIO, o sistema não quebre por exceção de IO, tratando o fluxo de forma limpa.
* **Dados de Entrada:** `routeId`: `"rota-inexistente"`
* **Comportamento Interno:** Ao chamar `statObject`, o SDK do MinIO lança uma exceção controlada do tipo `ErrorResponseException` (indicação de código HTTP 404 do servidor S3).
* **Resultado Esperado:** A exceção é capturada internamente e o método encerra graciosamente retornando `null`.

---

## Resumo dos Alvos de Validação do SDK (Mocks do `MinioClient`)

| Método do MinIO | Usado por qual fluxo | O que valida no teste |
| :--- | :--- | :--- |
| `putObject` | `uploadActivityImage` / `uploadRoutePreview` | Envio correto de fluxos de bytes e metadados de arquivo. |
| `getPresignedObjectUrl` | `generatePresignedUrl` | Geração do link seguro e assinável para arquivos privados. |
| `removeObject` | `deleteImage` | Exclusão lógica/física do binário no bucket. |
| `bucketExists` | `uploadRoutePreview` | Checagem de resiliência de infraestrutura antes da escrita. |
| `statObject` | `getRoutePreviewUrl` | Verificação rápida de metadados/existência do arquivo sem fazer download dele. |


# Plano e Especificação de Casos de Teste (Fluxo de Recuperação de Senha)

**Componente Alvo:** `PasswordResetService`  
**Objetivo:** Garantir a segurança e integridade do fluxo de redefinição de senhas, validando a geração de tokens, envio de e-mails informativos e o ciclo de vida/regras de expiração dos tokens gerados.

---

## 1. Fluxo de Solicitação de Redefinição (`requestPasswordReset`)

### CT-01: Solicitar redefinição com e-mail válido (Sucesso)
* **Descrição:** Garantir que quando um usuário cadastrado solicitar a recuperação de senha, o sistema limpe pendências antigas, crie um novo token e dispare a comunicação por e-mail.
* **Dados de Entrada:** `email`: `"vitor@teste.com"`
* **Passos:**
  1. O sistema busca o usuário pelo e-mail informado.
  2. Identificado o usuário, aciona o `tokenRepository.deleteAllByUserId` para invalidar tokens anteriores.
  3. Cria e persiste uma nova entidade `PasswordResetToken`.
  4. Dispara o e-mail contendo o link/token seguro através do `EmailService`.
* **Resultado Esperado:** O fluxo roda por completo sem exceções. O e-mail e o token são gerados exatamente uma vez para o ID do usuário correspondente.

### CT-02: Ignorar silenciosamente solicitação para e-mail inexistente
* **Descrição:** Garantir que o sistema não dê pistas de segurança (User Enumeration) e não dispare erros ou e-mails se a conta informada não existir na base.
* **Dados de Entrada:** `email`: `"invalido@teste.com"`
* **Passos:**
  1. O sistema busca pelo e-mail e o repositório retorna `Optional.empty()`.
* **Resultado Esperado:** O método encerra graciosamente sem realizar nenhuma interação com o banco de tokens (`tokenRepository`) ou com a infraestrutura de correio eletrônico (`emailService`).

---

## 2. Fluxo de Execução da Redefinição (`resetPassword`)

### CT-03: Redefinir a senha com sucesso
* **Descrição:** Validar a alteração da senha do usuário quando fornecido um token íntegro, ativo e dentro do prazo de validade.
* **Pré-condições:** O token fornecido existe, pertence a um usuário, não foi usado e possui data de expiração futura (`LocalDateTime.now().plusHours(1)`).
* **Dados de Entrada:** `token`: `"UUID-Valido"`, `novaSenha`: `"novaSenha123"`
* **Passos:**
  1. Recupera o token no banco de dados.
  2. Criptografa a nova senha usando o `PasswordEncoder`.
  3. Salva a nova credencial no objeto `User` e persiste as alterações no banco.
  4. Atualiza o estado do token para utilizado (`used = true`) e salva o registro do token.
* **Resultado Esperado:** Senha alterada com sucesso, persistência confirmada em ambas as tabelas (`User` e `Token`).

### CT-04: Rejeitar token inexistente (Token Inválido)
* **Descrição:** Impossibilitar a tentativa de alteração de senha caso o token fornecido seja malformado ou não conste na base de dados.
* **Dados de Entrada:** `token`: `"token-fantasma"`, `novaSenha`: `"123"`
* **Resultado Esperado:** O sistema interrompe o processamento lançando uma `RuntimeException` contendo a mensagem `"Token inválido"`. O encoder e a tabela de usuários não sofrem nenhuma chamada ou alteração.

### CT-05: Rejeitar token já utilizado anteriormente
* **Descrição:** Garantir o princípio de uso único do token, impedindo ataques de replay caso o link de redefinição seja interceptado ou reutilizado.
* **Pré-condições:** O token é localizado no banco, porém seu estado interno está marcado como `used = true`.
* **Dados de Entrada:** `token`: `"token-usado"`, `novaSenha`: `"123"`
* **Resultado Esperado:** O sistema lança uma `RuntimeException` contendo a mensagem `"Token já utilizado"`. A senha antiga do usuário permanece inalterada.

### CT-06: Rejeitar token com prazo de validade expirado
* **Descrição:** Garantir que tokens antigos ou fora da janela temporal de segurança definida pelo negócio percam a eficácia de alteração.
* **Pré-condições:** O token é localizado, mas o seu campo de expiração aponta para o passado (ex: `LocalDateTime.now().minusHours(1)`).
* **Dados de Entrada:** `token`: `"token-expirado"`, `novaSenha`: `"123"`
* **Resultado Esperado:** O método detecta a violação temporal e lança uma `RuntimeException` contendo a mensagem `"Token expirado"`.

---

## Ciclo de Estados de Validação do Token (`resetPassword`)

As validações de segurança da senha seguem uma árvore de decisão rigorosa na camada de serviço antes de efetivar qualquer modificação no banco de dados. O fluxo ideal de triagem segue a ordem descrita abaixo:

Existe no banco? ───(Não)───► [Lança: Token inválido]
│ (Sim)
▼

Já foi usado?    ───(Sim)───► [Lança: Token já utilizado]
│ (Não)
▼

Está expirado?   ───(Sim)───► [Lança: Token expirado]
│ (Não)
▼
[Executa a Criptografia e Atualiza Senha]



# Plano e Especificação de Casos de Teste (Autenticação e Tokens JWT)

**Componente Alvo:** `AuthService`  
**Objetivo:** Garantir a segurança do processo de autenticação de usuários, emissão de tokens JWT pareados (Access Token e Refresh Token) e a validação estrita durante o ciclo de renovação (Refresh).

---

## 1. Fluxo de Autenticação (`login`)

### CT-01: Autenticar usuário com credenciais corretas (Sucesso)
* **Descrição:** Validar se um usuário que fornece e-mail e senha corretos é autenticado com sucesso e recebe um novo par de tokens.
* **Dados de Entrada:** `LoginRequest`: `[email: "vitor@teste.com", senha: "senha123"]`
* **Passos:**
  1. O sistema delega as credenciais brutas para o `AuthenticationManager` através de um `UsernamePasswordAuthenticationToken`.
  2. Após a validação da segurança, recupera o e-mail do principal autenticado.
  3. Busca a entidade do usuário via `userService.findByEmail`.
  4. Invoca o `JwtEncoder` consecutivamente duas vezes para gerar, respectivamente, o **Access Token** e o **Refresh Token**.
* **Resultado Esperado:** Retorno de um `LoginResponse` contendo as strings dos dois tokens gerados (`"access-token-string"` e `"refresh-token-string"`).

### CT-02: Rejeitar autenticação com credenciais inválidas
* **Descrição:** Garantir que tentativas de login com senhas ou e-mails incorretos sejam barradas imediatamente, impedindo a geração de tokens de acesso.
* **Dados de Entrada:** `LoginRequest`: `[email: "vitor@teste.com", senha: "senhaErrada"]`
* **Comportamento Interno:** O `AuthenticationManager` interrompe o fluxo disparando uma `BadCredentialsException`.
* **Resultado Esperado:** O método captura o erro de infraestrutura e expõe uma exceção customizada `UnauthorizedException` com a mensagem `"E-mail ou senha incorretos"`. O `jwtEncoder` e o `userService` **nunca** são acionados.

---

## 2. Fluxo de Renovação de Tokens (`refresh`)

### CT-03: Renovar Access Token com Refresh Token válido
* **Descrição:** Garantir que o portador de um Refresh Token íntegro consiga obter um novo par de chaves sem precisar reintroduzir a senha.
* **Pré-condições:** O Refresh Token enviado deve ser decodificável pelo `JwtDecoder` e possuir a claim `token_type` configurada explicitamente como `"refresh"`.
* **Dados de Entrada:** `RefreshRequest`: `[refreshToken: "valido-refresh-token"]`
* **Passos:**
  1. O sistema decodifica a string usando o `jwtDecoder`.
  2. Valida se a claim `token_type` corresponde a `"refresh"`.
  3. Extrai o subject (e-mail) de dentro do token e carrega o usuário atualizado da base de dados.
  4. Gera um novo par de tokens (Access e Refresh) e devolve as novas assinaturas.
* **Resultado Esperado:** Retorna um objeto `LoginResponse` populado com os novos valores gerados pelo encoder (`"novo-access-token"` e `"novo-refresh-token"`).

### CT-04: Rejeitar renovação se o tipo do token for inválido
* **Descrição:** Impedir que o usuário tente usar um Access Token comum (ou qualquer token que não tenha o propósito de refresh) no endpoint de renovação de sessão.
* **Pré-condições:** O token enviado é decodificado com sucesso, porém sua claim interna de tipo aponta algo diferente de refresh (ex: `token_type = "access"`).
* **Dados de Entrada:** `RefreshRequest`: `[refreshToken: "access-token-invalido-para-isso"]`
* **Resultado Esperado:** O sistema aborta o processo de renovação e lança uma `IllegalArgumentException` com a mensagem `"Token inválido para refresh"`. Nenhuma consulta ao banco de dados ou nova assinatura de token é efetuada.

---

## Fluxograma do Ciclo de Autenticação JWT

Abaixo está mapeada a esteira de validação lógica aplicada pelo serviço para mitigar falhas de autenticação:

[Fluxo de Login]
│
▼

AuthenticationManager ───(BadCredentials)───► [Lança: UnauthorizedException]
│ (Sucesso)
▼

Obter Dados Usuário
│
▼

Encoder JWT (1ª Chamada) ──► Gera Access Token
│
▼

Encoder JWT (2ª Chamada) ──► Gera Refresh Token
│
▼
[Retorna LoginResponse]

# Plano e Especificação de Casos de Teste (Serviço de E-mail / SMTP)

**Componente Alvo:** `EmailService`  
**Objetivo:** Garantir a montagem correta de correspondências eletrônicas textuais para fluxos críticos do sistema e validar a resiliência da aplicação contra falhas externas de infraestrutura de rede (servidores SMTP).

---

## Configurações de Ambiente (Contexto Base)
O componente depende de propriedades de ambiente que ditam a identidade da plataforma e as rotas do client-side:
* **Remetente Oficial (`fromEmail`):** `suporte@trakker.com`
* **Endereço do Frontend (`frontendUrl`):** `https://trakker.com` (Usado para a ancoragem de links de redirecionamento dinâmicos).

---

## 1. Envio de Links de Recuperação (`sendPasswordResetEmail`)

### CT-01: Construir mensagem e enviar e-mail com sucesso
* **Descrição:** Validar que, ao solicitar a redefinição de senha, o corpo do e-mail é montado com o link correto contendo o token, o remetente oficial está configurado e o prazo de expiração é informado textualmente.
* **Dados de Entrada:** * `toEmail`: `"vitor@teste.com"`
  * `token`: `"uuid-token-123"`
* **Mecanismo de Validação:** Utilização de um `ArgumentCaptor` para interceptar o objeto `SimpleMailMessage` disparado pelo framework.
* **Passos:**
  1. O método concatena a `frontendUrl` com o token recebido para gerar o link: `https://trakker.com/reset-password?token=uuid-token-123`.
  2. Configura as propriedades do envelope (`From`, `To`, `Subject`).
  3. Aciona o `JavaMailSender.send`.
* **Resultado Esperado:** O e-mail é enviado com sucesso. As asserções interceptadas validam que:
  * O remetente é exatamente `suporte@trakker.com`.
  * O destinatário coincide com a entrada.
  * O assunto está padronizado como `"Trakker: Recuperação de senha"`.
  * O corpo do texto contém explicitamente o link gerado e o aviso de que ele é `"válido por 1 hora"`.

### CT-02: Isolar falhas do servidor SMTP de forma resiliente
* **Descrição:** Garantir que se a infraestrutura externa de e-mails (como o provedor SMTP) estiver fora do ar ou recusar a conexão, a API trate o erro internamente através de um bloco `try-catch` e impeça que a falha interrompa o fluxo do usuário ou estoure um erro 500 no cliente final.
* **Dados de Entrada:** `toEmail`: `"vitor@teste.com"`, `token`: `"token"`
* **Comportamento Interno:** O método `mailSender.send` é forçado a lançar uma `MailSendException` ("Falha no servidor SMTP").
* **Resultado Esperado:** O método captura a `MailException` de forma segura. A execução termina graciosamente sem propagar nenhuma exceção para as camadas superiores da aplicação.

---

## Fluxo de Captura e Intercepção de Argumentos (`ArgumentCaptor`)

Para garantir que as propriedades internas da mensagem do Spring Mail não sofram alterações indesejadas, o teste faz o isolamento do objeto em tempo de execução:

[Invocação do Método] ──► emailService.sendPasswordResetEmail(...)
│
▼
Instancia SimpleMailMessage
│
▼
[Interceptador de Teste] ──► mailSender.send( Captura o Objeto )
│
▼
[Validações do Teste]
├── From == suporte@trakker.com
├── To == vitor@teste.com
└── Text contém link + validade


# Plano e Especificação de Casos de Teste (Gerenciamento de Usuários)

**Componente Alvo:** `UserService`  
**Objetivo:** Garantir a integridade das operações de CRUD de usuários, aplicando regras estritas de integridade de dados (e-mails únicos), segurança (criptografia de senhas) e validação de intervalos lógicos (idades e períodos temporais).

---

## 1. Fluxo de Busca Básica (`findAll` e `findById`)

### CT-01: Listar todos os usuários cadastrados
* **Descrição:** Garantir que o sistema retorne a listagem completa de usuários sem filtros adicionais.
* **Resultado Esperado:** Retorna uma coleção (`List<User>`) contendo todos os registros retornados pelo repositório.

### CT-02: Localizar usuário por ID com sucesso
* **Descrição:** Validar a recuperação de um perfil específico através do seu identificador único.
* **Dados de Entrada:** `id`: `"123"`
* **Resultado Esperado:** Retorna a instância do `User` correspondente com o ID idêntico ao solicitado.

### CT-03: Lançar erro ao buscar ID inexistente
* **Descrição:** Garantir que o sistema trate de forma explícita a busca por um identificador que não consta na base de dados.
* **Dados de Entrada:** `id`: `"999"`
* **Resultado Esperado:** A execução é interrompida lançando uma `EntityNotFoundException` contendo a mensagem `"User not found with id: 999"`.

---

## 2. Validação de Intervalos (`findByAgeBetween` e `findByBornAtBetween`)

### CT-04: Rejeitar intervalo de idade logicamente invertido
* **Descrição:** Impedir consultas em que a idade mínima fornecida seja maior do que a idade máxima.
* **Dados de Entrada:** `minAge`: `30`, `maxAge`: `20`
* **Resultado Esperado:** Lança uma `IllegalArgumentException` com a mensagem `"minAge não pode ser maior que maxAge"`.

### CT-05: Buscar usuários por intervalo de idade válido
* **Descrição:** Confirmar o retorno correto de dados quando os parâmetros de idade seguem a ordem crescente.
* **Dados de Entrada:** `minAge`: `20`, `maxAge`: `30`
* **Resultado Esperado:** Retorna a listagem filtrada de usuários que se enquadram no escopo.

### CT-06: Rejeitar intervalo de datas logicamente invertido
* **Descrição:** Impedir buscas temporais por data de nascimento onde a data inicial seja posterior ao prazo limite final.
* **Dados de Entrada:** `start`: `LocalDateTime.now()`, `end`: `start.minusDays(1)`
* **Resultado Esperado:** Lança uma `IllegalArgumentException` com a mensagem `"A data inicial não pode ser posterior à data final"`.

---

## 3. Fluxo de Persistência e Alterações (`save`, `update`, `delete`)

### CT-07: Cadastrar usuário com senha criptografada (Sucesso)
* **Descrição:** Garantir que o fluxo de criação de contas intercepte a senha em texto puro, aplique o hash de segurança e adicione os metadados de auditoria.
* **Dados de Entrada:** Instância de `User` com `password = "rawPassword"` e `email = "vitor@teste.com"`.
* **Passos:**
  1. O sistema verifica a disponibilidade do e-mail via `userRepository.existsByEmail`.
  2. Aciona o `passwordEncoder.encode` para mascarar a credencial.
  3. Injeta a data corrente no campo `createdAt`.
  4. Persiste o registro.
* **Resultado Esperado:** O usuário é salvo com a senha atualizada para `"encryptedPassword"` e a data de criação preenchida.

### CT-08: Impedir cadastro com e-mail duplicado
* **Descrição:** Validar a restrição de unicidade da chave de e-mail na plataforma.
* **Dados de Entrada:** Instância de `User` com `email = "vitor@teste.com"`.
* **Comportamento Interno:** `existsByEmail` retorna `true`.
* **Resultado Esperado:** Lança uma `IllegalStateException` contendo `"Já existe um usuário cadastrado com o email"`. O método `userRepository.save` **nunca** deve ser invocado.

### CT-09: Atualizar dados cadastrais com sucesso
* **Descrição:** Garantir a alteração de propriedades do perfil (como nome e e-mail) mantendo a consistência do registro sem afetar a credencial de autenticação.
* **Dados de Entrada:** Objeto contendo as modificações (`id = "123"`, `name = "Vitor Novo"`, `email = "vitor.novo@teste.com"`).
* **Passos:**
  1. Recupera o registro original do banco pelo ID.
  2. Valida a disponibilidade do novo e-mail.
  3. Mescla e salva os novos dados.
* **Resultado Esperado:** O registro retornado reflete as atualizações sem corromper os demais campos da entidade.

### CT-10: Excluir usuário cadastrado por ID
* **Descrição:** Garantir a remoção física de uma conta quando um ID válido for passado.
* **Dados de Entrada:** `id`: `"123"`
* **Resultado Esperado:** O sistema valida a existência (`existsById == true`) e invoca o `userRepository.deleteById("123")` exatamente uma vez.

### CT-11: Falhar ao tentar excluir ID inexistente
* **Descrição:** Impedir que o sistema acione rotinas de remoção para chaves fantasmas.
* **Dados de Entrada:** `id`: `"999"`
* **Resultado Esperado:** Lança `EntityNotFoundException`. O método `deleteById` é bloqueado e não sofre nenhuma interação.

---

## Matriz de Exceções Mapeadas

| Falha Operacional | Condição Disparadora | Classe da Exceção | Mensagem Esperada |
| :--- | :--- | :--- | :--- |
| Busca por ID nulo/vazio | Chave ausente no banco | `EntityNotFoundException` | `"User not found with id: ..."` |
| Filtro de idade corrompido | `minAge > maxAge` | `IllegalArgumentException` | `"minAge não pode ser maior que maxAge"` |
| Filtro cronológico corrompido | `start > end` | `IllegalArgumentException` | `"A data inicial não pode ser posterior à data final"` |
| Conflito de cadastro | E-mail já utilizado por outra conta | `IllegalStateException` | `"Já existe um usuário cadastrado com o email"` |
| Exclusão órfã | Tentar deletar ID inválido | `EntityNotFoundException` | N/A |




# Plano e Especificação de Casos de Teste (Integração e Camada Espacial PostGIS)

**Componente Alvo:** `RouteServiceIntegrationTest`  
**Objetivo:** Validar a integração real entre a camada de negócio (`RouteService`), os repositórios JPA e o banco de dados relacional com extensões espaciais/geográficas (`PostgreSQL` + `PostGIS`), garantindo a persistência, conversão de tipos nativos de tempo (`Timestamp`/`Instant`) e reconstrução exata de geometrias de traçado.

---

## Infraestrutura e Configuração do Ambiente de Testes
Diferente dos testes unitários isolados com Mocks, este ecossistema levanta uma infraestrutura real e efêmera utilizando **Testcontainers**:
* **Banco de Dados de Integração:** Container Docker rodando a imagem oficial `postgis/postgis:16-3.4`.
* **Gerenciamento de Schema:** Configurado como `create-drop` para criar as tabelas antes dos testes e desalocá-las ao encerrar.
* **Isolamento de Estado:** Métodos de limpeza ativa (`deleteAll()`) executados no `@BeforeEach` para garantir que um teste não herde dados corrompidos ou estados de execuções passadas.
* **Componentes Simulados (Mocks parciais):** Serviços que tocam infraestruturas de terceiros externas ao banco (como `MinioStorageService` e `ActivityImageService`) permanecem declarados como `@MockitoBean` para focar o teste puramente na integração de dados e geolocalização.

---

## 1. Ciclo de Vida e Integração Espacial (`createRoute` + `getRouteReplay`)

### CT-01: Validar persistência e decodificação de pontos xeográficos (PostGIS)
* **Descrição:** Garantir que o fluxo completo de persistência consiga serializar as coordenadas de latitude/longitude enviadas pelo ciclista para o formato geométrico binário do PostGIS e, posteriormente, ler e decodificar esses dados de volta para objetos Java (`TrackPoint`) sem perdas de precisão decimal ou corrupção de fusos horários.
* **Pré-condições:** Um registro real de usuário inserido previamente no banco PostgreSQL do container (`victor@teste.com`).
* **Dados de Entrada:** * `userId` (E-mail): `"victor@teste.com"`
  * `CreateRouteRequest`: Contendo metadados do pedal e uma lista ordenada com 3 pontos geográficos:
    1. `[Long: -34.87, Lat: -8.05, Elev: 10.0, Time: Agora]`
    2. `[Long: -34.88, Lat: -8.06, Elev: 15.0, Time: Agora + 5min]`
    3. `[Long: -34.89, Lat: -8.07, Elev: 20.0, Time: Agora + 10min]`
* **Passos:**
  1. O `RouteService` intercepta a requisição e usa a biblioteca `GeometryFactory (SRID 4326)` para converter os pontos em uma estrutura `LineString`.
  2. A entidade `Route` é salva no banco PostGIS através do `routeRepository.save()`.
  3. O identificador gerado (`createdRoute.id()`) é utilizado para acionar o método `routeService.getRouteReplay()`.
  4. O sistema roda a query nativa do banco de dados, recupera as linhas brutas (`Object[]`), faz o parse dinâmico das colunas temporais de banco (`Timestamp`/`Instant`) e monta o objeto de resposta.
* **Resultado Esperado:** * O objeto `RouteReplayResponse` retornado deve ser populado com sucesso.
  * A lista de pontos reconstruída deve conter exatamente 3 posições.
  * O primeiro ponto da lista deve bater exatamente com os dados originais enviados (`longitude == -34.87` e `latitude == -8.05`), comprovando que a álgebra e os tipos espaciais do banco de dados estão perfeitamente integrados com a aplicação Java.

---

## Fluxo de Infraestrutura do Teste de Integração

O ecossistema do teste simula a esteira exata de dados que ocorre nos servidores de produção ao interagir com recursos de hardware e banco de dados real:

┌────────────────────────────────────────────────────────┐\
│              Ambiente de Testes JUnit 5                │\
│                                                        │\
│  [MOCK] MinioStorageService                            │\
│  [MOCK] ActivityImageService                           │\
│                                                        │\
│  [REAL] RouteService ──► [REAL] Repositories (JPA)     │\
└───────────────────────────┬────────────────────────────┘\
│ (Leitura / Escrita SQL)\
▼
┌──────────────────────────────────────────────────────┐\
│             Container Docker (Testcontainers)        │\
│                                                      │\
│             PostgreSQL 16 + PostGIS 3.4              │\
│                                                      │\
│  - Valida Geometria Espacial (SRID 4326)             │\
│  - Conversão Nativa de Tipos Temporais               │\
└──────────────────────────────────────────────────────┘\

---

# Plano e Especificação de Casos de Teste (Camada Web / Controller de Imagens)

**Componente Alvo:** `ActivityImageController` (Testado via `MockMvc` Standalone)  
**Objetivo:** Garantir a exposição correta dos endpoints HTTP de gerenciamento de mídias anexadas às atividades, validando o recebimento de arquivos múltiplos (`Multipart`), o retorno de payloads JSON e o comportamento seguro em cenários de falha.

---

## Contexto de Segurança e Configuração da Requisição
Como os endpoints exigem um contexto de usuário autenticado, a suíte de testes configura de forma programática um ambiente seguro simulado:
* **Autenticação Injetada:** Um token JWT fictício (`fake-token`) gerado com a claim `sub: "victor@teste.com"`.
* **Escopo:** O `SecurityContextHolder` é limpo ativamente após a execução de cada caso de teste (`@AfterEach`) para impedir vazamento de escopo (*state bleed*) entre as requisições.

---

## 1. Fluxo de Upload de Imagens (`POST /api/activities/{activityId}/images`)

### CT-01: Fazer upload de múltiplos arquivos com sucesso
* **Descrição:** Garantir que o endpoint aceita uma lista de arquivos de mídia em uma única requisição multipart e devolve as chaves identificadoras geradas no storage com status HTTP 200.
* **Dados de Entrada:** * Variável de Path `activityId`: Um UUID aleatório.
  * Arquivo 1 (`MultipartFile`): Nome: `"files"`, Arquivo: `"image1.png"`, Tipo: `image/png`.
  * Arquivo 2 (`MultipartFile`): Nome: `"files"`, Arquivo: `"image2.jpg"`, Tipo: `image/jpeg`.
* **Passos:**
  1. Disparar uma requisição `multipart` simulada para a URI correspondente anexando os dois arquivos físicos na chave `"files"`.
  2. O controller encaminha o fluxo para a camada `activityImageService.uploadImages`.
* **Resultado Esperado:** * HTTP Status retornado deve ser **200 OK**.
  * O corpo da resposta deve vir estruturado como um array JSON com as chaves geradas: `["key-1", "key-2"]`.

### CT-02: Propagar exceção de forma íntegra quando o Service falhar
* **Descrição:** Garantir que erros internos vindos da camada de serviço ou do client do MinIO não sejam mascarados incorretamente no motor de servlet.
* **Dados de Entrada:** `activityId` (UUID) e um arquivo multipart genérico.
* **Comportamento Interno:** O método `activityImageService.uploadImages` é mockado para estourar uma `RuntimeException("Falha no MinIO")`.
* **Resultado Esperado:** A requisição falha e propaga o erro de execução, resultando no lançamento de uma `jakarta.servlet.ServletException` encapsulada pela infraestrutura do MockMvc.

---

## 2. Fluxo de Recuperação de URLs (`GET /api/activities/{activityId}/images`)

### CT-03: Obter links públicos assinados das fotos com sucesso
* **Descrição:** Validar se a rota HTTP de consulta recupera e formata corretamente a lista de URLs pré-assinadas para renderização direta de imagens no cliente/frontend.
* **Dados de Entrada:** Variável de Path `activityId` textual (String contendo um UUID).
* **Passos:**
  1. Realizar uma chamada HTTP GET para `/api/activities/{activityId}/images`.
  2. O serviço retorna uma lista de URLs estáticas previamente mockadas.
* **Resultado Esperado:** * HTTP Status devolvido deve ser **200 OK**.
  * O payload JSON deve conter exatamente o array de strings mapeado: `["https://s3.url/img1.png", "https://s3.url/img2.jpg"]`.

---

## Mapeamento de Contratos HTTP do Controller

| Método HTTP | Endpoint URI | Tipo de Payload | Status Sucesso | Dependência Direta (Service) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/activities/{activityId}/images` | `multipart/form-data` | `200 OK` | `activityImageService.uploadImages` |
| **GET** | `/api/activities/{activityId}/images` | `application/json` | `200 OK` | `activityImageService.getPresignedUrls` |



# Plano e Especificação de Casos de Teste (Regras de Negócio de Imagens da Atividade)

**Componente Alvo:** `ActivityImageService`  
**Objetivo:** Garantir a aplicação das regras de validação de arquivos recebidos (guardrails de tamanho e formato), a persistência correta de metadados associados a uma atividade de ciclismo e o ciclo de deleção individual ou em lote das mídias físicas e lógicas.

---

## 1. Fluxo de Upload e Validação de Arquivos (`uploadImages`)

### CT-01: Fazer upload de arquivo válido com sucesso
* **Descrição:** Garantir que um arquivo de imagem que atenda a todos os critérios de tamanho, formato e integridade seja enviado ao MinIO e tenha seus metadados persistidos no banco de dados.
* **Dados de Entrada:** * `activityId`: Um UUID aleatório.
  * `file`: `MultipartFile` íntegro (ex: `"foto.jpg"`, tipo `"image/jpeg"`, com conteúdo binário).
* **Passos:**
  1. O sistema valida as propriedades físicas do arquivo.
  2. Associa a imagem ao traçado carregando a rota equivalente via `routeRepository.findRouteById`.
  3. Envia o binário para o bucket através do `minioStorageService.uploadActivityImage`.
  4. Salva a nova instância de `ActivityImage` ligada ao ID da atividade no `activityImageRepository`.
* **Resultado Esperado:** Retorna a lista contendo as chaves estruturadas geradas pelo storage (`"activities/{id}/foto.jpg"`).

### CT-02: Rejeitar arquivo com conteúdo vazio
* **Descrição:** Impedir o processamento e consumo de banda com arquivos corrompidos ou com 0 bytes de tamanho.
* **Dados de Entrada:** `file` contendo `new byte[0]`.
* **Resultado Esperado:** O sistema aborta o upload e lança uma `IllegalArgumentException` contendo a mensagem `"Arquivo vazio"`. Nenhuma interação com o banco ou storage deve ocorrer.

### CT-03: Rejeitar arquivos com formatos proibidos (Extensão Inválida)
* **Descrição:** Garantir que apenas extensões de imagem permitidas (como JPEG/PNG) passem pela validação do serviço, bloqueando arquivos maliciosos ou formatos incompatíveis.
* **Dados de Entrada:** `file` simulando um documento PDF (`"documento.pdf"`, tipo `"application/pdf"`).
* **Resultado Esperado:** Lança uma `IllegalArgumentException` e bloqueia o fluxo de upload.

### CT-04: Bloquear arquivos que excedam o tamanho limite de segurança
* **Descrição:** Mitigar ataques de negação de serviço (DoS) ou estouro de storage impedindo o upload de arquivos excessivamente grandes.
* **Dados de Entrada:** `file` contendo um array de bytes equivalente a 11MB (`11 * 1024 * 1024`).
* **Resultado Esperado:** O validador detecta o estouro do limite interno de tamanho e lança uma `IllegalArgumentException`.

---

## 2. Consulta de Mídias (`getPresignedUrls`)

### CT-05: Listar URLs assinadas das imagens da atividade
* **Descrição:** Validar a recuperação da coleção de imagens de uma atividade convertendo as chaves internas em links temporários de visualização.
* **Dados de Entrada:** `activityId`: `"route-uuid"`
* **Passos:**
  1. Busca todas as entidades registradas para a atividade no `activityImageRepository.findByRouteId`.
  2. Para cada registro encontrado, submete a chave ao `minioStorageService.generatePresignedUrl`.
* **Resultado Esperado:** Retorna uma lista de strings contendo as URLs geradas e prontas para consumo.

---

## 3. Fluxos de Remoção (`deleteImage` e `deleteAllActivityImages`)

### CT-06: Deletar imagem individual por ID com sucesso
* **Descrição:** Garantir o sincronismo na remoção de uma mídia específica, apagando o arquivo físico do storage antes de remover os metadados do banco de dados.
* **Dados de Entrada:** `imageId`: `1L`
* **Passos:**
  1. Localiza a entidade pelo ID de registro.
  2. Extrai a Object Key (`"key1"`) e solicita a exclusão ao `minioStorageService.deleteImage`.
  3. Remove a linha da tabela usando `activityImageRepository.delete`.
* **Resultado Esperado:** Deleção concluída com sucesso em ambas as camadas.

### CT-07: Falhar ao tentar apagar ID de imagem inexistente
* **Descrição:** Garantir que o sistema não tente