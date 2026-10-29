# Calendário do Perdão

Jornada de 90 dias de oração. O progresso é guardado exclusivamente no `localStorage` do browser, após aceitação explícita. Não há API de progresso nem base de dados no servidor.

## Desenvolvimento e validação

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
```

O build descarrega as fontes Manrope e Cormorant Garamond através de `next/font/google`, pelo que necessita de acesso à rede.

## Publicação

```sh
docker compose up --build -d
```

A app fica disponível na porta 3333. O container não requer volumes nem base de dados. Usar um domínio estável com HTTPS: o armazenamento pertence à origem (protocolo, domínio e porta) e ao browser utilizado.

## Dados e regras

A chave `oracao.journey.v1` guarda a versão, a data de consentimento, o início da jornada, as datas/horas das conclusões e o número/data dos reinícios. Sem consentimento, a app funciona apenas para leitura e volta a pedir autorização quando se tenta registar uma conclusão. Não há sincronização entre dispositivos; limpar os dados do site elimina o progresso. Os separadores do mesmo browser sincronizam alterações.

Cada dia de oração termina às 05:00 do dia seguinte, no fuso horário do dispositivo. Uma conclusão em falta permite confirmação retroativa ou reinício. Duas ou mais permitem apenas reinício. Fechar o aviso mantém a leitura disponível e preserva o progresso, mas bloqueia alterações até resolver a sequência. O reinício é sempre voluntário. Dias futuros são apenas para leitura.

As afirmações são geradas pela lista fixa de `lib/content.ts`, repetida ao longo dos 90 dias. Dados antigos de SQLite não são importados e os ficheiros existentes em `data/` não são apagados nem incluídos no container.

Compatibilidade base: Chrome/Edge 111+, Firefox 111+ e Safari 16.4+ (incluindo iOS). A persistência exige que o browser permita armazenamento local.
