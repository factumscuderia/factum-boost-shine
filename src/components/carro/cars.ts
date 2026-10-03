/** Tipo de acabamento usado para gerar o material realista da peça. */
export type Acabamento = "pintura" | "preto" | "abs" | "aco";

export type Peca = {
  id: string;
  nome: string;
  /** Nomes das malhas dentro do arquivo 3D que formam esta peça. */
  meshes: string[];
  material: string;
  cor: string;
  funcao: string;
};

export type Carro = {
  id: string;
  nome: string;
  subtitulo: string;
  arquivoModelo: string;
  formato: "glb" | "fbx";
  /** Rotação [x,y,z] em radianos para deixar o carro em pé e com a frente para +X. */
  rotacao: [number, number, number];
  pecas: Peca[];
};

const TXT = {
  chassi:
    "Segue o conceito de \"gota d'água\" (drop shape) em toda sua extensão, com transições suaves e pontas arredondadas para minimizar a área de contato com o ar. Essa forma reduz a diferença de pressão entre a frente e a traseira do carro — a principal causa do arrasto aerodinâmico — aplicando os princípios de Bernoulli e o efeito Coandă. Chegou à 4ª versão de desenvolvimento, sendo 0,64g mais leve que o primeiro protótipo.",
  asaD:
    "Gera downforce ao aproveitar o efeito Coandă — o ar que passa pela superfície curva da asa cria uma zona de baixa pressão embaixo e alta pressão em cima, \"puxando\" o carro contra a pista. O perfil aerodinâmico NACA 0006 foi escolhido por gerar boa sustentação com baixo arrasto. As pontas (endplates) usam um design \"outwash\", que joga o ar para fora do carro, criando uma zona de baixa pressão ao redor da carroceria e reduzindo a turbulência vinda dos pneus.",
  asaT:
    "Trabalha em conjunto com a dianteira para equilibrar a pressão aerodinâmica entre a parte de cima e de baixo do carro, aumentando estabilidade em alta velocidade. Usa o mesmo perfil NACA 0006 e uma ponta com corte em \"U\", que reduz o vórtice de esteira formado atrás da asa — um dos pontos que mais gera arrasto residual.",
  eixos:
    "Sustentam a rotação das rodas com o mínimo de atrito possível, usando um rolamento cerâmico por roda (mais eficiente que o rolamento híbrido testado). Como o cartucho de CO2 impulsiona o carro em apenas 1/3 da pista, o restante do percurso depende só da inércia — por isso, minimizar o atrito nos eixos é decisivo para o tempo final de prova.",
  rodas:
    "Foram projetadas com diâmetro reduzido de propósito — rodas menores exigem menos torque para começar a girar, o que faz o carro acelerar mais rápido e atingir a velocidade máxima mais cedo (mesmo que essa velocidade máxima seja um pouco menor). O material escolhido foi o ABS, por ter a menor densidade entre as opções testadas e ainda assim resistência suficiente. As rodas contam com hubcaps (tampas), que evitam a formação de vórtices de ar dentro da roda — sem eles, esse vórtice geraria mais arrasto e turbulência.",
  halo:
    "Componente de segurança obrigatório que protege a região do \"cockpit\". Foi redesenhado para ter uma transição suave até a câmara do CO2 (em vez de uma parede reta), reduzindo o arrasto gerado por essa região. É impresso em Nylon, material escolhido por ser leve e ainda assim resistente o bastante — passou em teste de estresse com 4x a carga de segurança exigida, sem qualquer risco de ruptura.",
  co2:
    "Sustenta e protege o cilindro de propulsão, a peça responsável por gerar toda a força que move o carro. Precisa resistir à pressão do disparo sem falhar — por isso passou por várias iterações estruturais (reforço de paredes) até atingir a resistência necessária nos testes de impacto.",
  sidepods:
    "Carenagens laterais desenhadas para acomodar a \"carga virtual\" exigida pelo regulamento, com formato afunilado até a traseira do carro para manter o fluxo de ar colado à carroceria e reduzir arrasto.",
  assoalho:
    "O assoalho usa o princípio de Bernoulli para acelerar o ar por baixo do carro, criando uma área de baixa pressão que \"cola\" o carro na pista (o mesmo princípio de um tubo Venturi). O difusor, na traseira, expande essa área aos poucos para que a pressão do ar volte ao normal de forma suave, evitando turbulência.",
  capacete:
    "Representa o piloto virtual exigido pelo regulamento da categoria; sua posição e dimensões seguem rigorosamente as medidas oficiais do cockpit.",
};

export const CARRO_FB06: Carro = {
  id: "fb06",
  nome: "FB-06",
  subtitulo: "Carro Oficial Factum Scuderia",
  arquivoModelo: "/assets/fb06.glb",
  formato: "glb",
  rotacao: [-Math.PI / 2, 0, 0],
  pecas: [
    { id: "chassi", nome: "Chassi", meshes: ["empty_4", "empty_23"], material: "Usinagem CNC / Acabamento Azul Metálico", cor: "#2052bf", funcao: TXT.chassi },
    { id: "asa-dianteira", nome: "Asa Dianteira", meshes: ["empty_2", "empty_22"], material: "Impressão 3D / Perfil NACA 0006 / Outwash", cor: "#3f3f3f", funcao: TXT.asaD },
    { id: "asa-traseira", nome: "Asa Traseira", meshes: ["empty_21"], material: "Impressão 3D / Perfil NACA 0006 / Corte em U", cor: "#3f3f3f", funcao: TXT.asaT },
    { id: "eixos", nome: "Eixos Dianteiro e Traseiro", meshes: ["empty_6", "empty_8"], material: "Aço satinado / Rolamentos Cerâmicos", cor: "#9aa3ad", funcao: TXT.eixos },
    { id: "rodas", nome: "Rodas", meshes: ["empty_11", "empty_12", "empty_13", "empty_14", "empty_9", "empty_10", "empty_15", "empty_16", "empty_17", "empty_18", "empty_19", "empty_20"], material: "ABS de baixa densidade / Hubcaps integrados", cor: "#f6f6f3", funcao: TXT.rodas },
    { id: "halo", nome: "Halo", meshes: ["empty_3"], material: "Nylon impresso 3D / Alta resistência estrutural", cor: "#404040", funcao: TXT.halo },
    { id: "co2", nome: "Estrutura de Suporte / Câmara do CO2", meshes: ["empty_7"], material: "Estrutura reforçada de retenção de propulsão", cor: "#a0a0a0", funcao: TXT.co2 },
    { id: "sidepods", nome: "Sidepods", meshes: ["empty_4"], material: "Carenagens laterais / Formato afunilado", cor: "#2a5cd6", funcao: TXT.sidepods },
    { id: "assoalho-difusor", nome: "Assoalho e Difusor", meshes: ["empty_23"], material: "Geometria Venturi / Difusor aerodinâmico traseiro", cor: "#183e8a", funcao: TXT.assoalho },
    { id: "capacete", nome: "Capacete do Piloto", meshes: ["empty_5"], material: "ABS / Piloto virtual regulamentar", cor: "#e0ded0", funcao: TXT.capacete },
  ],
};

export const CARROS: Carro[] = [CARRO_FB06];
