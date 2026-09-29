# Alinhar “O Carro” ao site Factum

## Objetivo
Fazer a página do FB-06 parecer parte do mesmo site, preservando a garagem 3D, as peças clicáveis e o teste de reação.

## Mudanças
- Aplicar na página do carro a paleta Factum existente, os mesmos cantos arredondados, botões, cartões, sombras e ritmos de espaçamento das seções Início e Projeto Social.
- Remover da página do carro todos os ícones visuais: biblioteca, SVG, emojis e símbolos usados como ícones; manter apenas textos claros nos controles.
- Trocar a tipografia de todo o site para Montserrat no corpo e League Spartan nos títulos, carregadas pelo Google Fonts e registradas como fontes semânticas globais.
- Corrigir a largada para o FB-06 percorrer somente o eixo longitudinal da pista, com aceleração progressiva e sem deriva lateral.
- Sincronizar uma rajada branca curta de CO₂ na traseira exatamente com o início do movimento, com pico imediato e dissipação rápida.
- Manter intactos os textos técnicos do FB-06, as peças clicáveis, a garagem 3D e a sequência de cinco luzes.

## Validação
- Conferir a página inicial e a página do carro em desktop e celular.
- Executar o teste de reação no navegador e confirmar direção, aceleração e rajada de CO₂.
- Verificar que não restou nenhum ícone na interface da página do carro e que não há erros visuais ou de carregamento.

## Detalhes técnicos
- Os tokens globais de fonte serão definidos no sistema Tailwind/CSS existente; o HTML estático da página inicial usará as mesmas famílias.
- A animação da pista manterá a posição lateral fixa e animará somente a coordenada longitudinal, com curva de aceleração suavizada.
