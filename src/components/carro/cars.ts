import fb09 from "@/assets/fb09.fbx.asset.json";
import fb06 from "@/assets/fb06.glb.asset.json";

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
    "Estrutura central que sustenta todos os componentes do carro; seu formato é otimizado para reduzir o arrasto aerodinâmico e ao mesmo tempo manter rigidez estrutural suficiente para suportar o impacto do disparo do cartucho de CO2.",
  asaD:
    "Gera parte da carga aerodinâmica (downforce) na frente do carro, ajudando a manter a estabilidade e o contato com a pista nos primeiros instantes de aceleração, além de direcionar o fluxo de ar ao longo da carroceria.",
  asaT:
    "Complementa a carga aerodinâmica gerada na frente, equilibrando o carro e reduzindo turbulência na esteira de ar (efeito de arrasto induzido).",
  eixos:
    "Permitem a rotação das rodas com o mínimo de atrito possível (geralmente sobre rolamentos), sendo responsáveis por transformar o impulso do CO2 em movimento linear eficiente.",
  rodas:
    "Seu formato, diâmetro e material influenciam diretamente o atrito de rolamento — quanto menor o atrito, maior a velocidade final atingida em pista.",
  halo:
    'Elemento estrutural de proteção, inspirado no halo da F1, protegendo a área do "cockpit"/piloto simbólico contra impactos.',
  co2:
    "Fixa e alinha o cartucho de gás pressurizado ao eixo do carro, garantindo que a força do disparo seja aplicada de forma reta e eficiente.",
  capacete:
    "Representa o piloto virtual exigido pelo regulamento da STEM Racing; sua posição e tamanho seguem as medidas oficiais do cockpit.",
};

export const CARROS: Carro[] = [
  {
    id: "fb09",
    nome: "FB09",
    subtitulo: "Temporada atual",
    arquivoModelo: fb09.url,
    formato: "fbx",
    rotacao: [0, 0, 0],
    pecas: [
      { id: "chassi", nome: "Chassi", meshes: ["Chassi"], material: "Pintura azul metálica escura / Preto", cor: "#0b2a6b", funcao: TXT.chassi },
      { id: "asa-dianteira", nome: "Asa Dianteira", meshes: ["Asa_dianteira"], material: "Pintura azul metálica escura", cor: "#0b2a6b", funcao: TXT.asaD },
      { id: "asa-traseira", nome: "Asa Traseira", meshes: ["Asa_Traseira"], material: "Pintura azul metálica escura", cor: "#0b2a6b", funcao: TXT.asaT },
      { id: "eixos", nome: "Eixos", meshes: ["Eixo_dianteiro", "Eixo_traseiro"], material: "Aço satinado", cor: "#9aa3ad", funcao: TXT.eixos },
      { id: "rodas", nome: "Rodas", meshes: ["Roda_Dianteira_esquerda", "Roda_dianteira_direita", "Roda_traseira_esquerda", "Roda_traseira_direita"], material: "ABS branco / Preto", cor: "#f6f6f3", funcao: TXT.rodas },
      { id: "halo", nome: "Halo", meshes: ["Halo_V2"], material: "ABS branco", cor: "#f6f6f3", funcao: TXT.halo },
      { id: "capacete", nome: "Capacete do Piloto", meshes: ["capacete"], material: "ABS branco", cor: "#f6f6f3", funcao: TXT.capacete },
    ],
  },
  {
    id: "fb06",
    nome: "FB06",
    subtitulo: "Geração anterior",
    arquivoModelo: fb06.url,
    formato: "glb",
    rotacao: [-Math.PI / 2, 0, 0],
    pecas: [
      { id: "chassi", nome: "Chassi", meshes: ["empty_4", "empty_23"], material: "Pintura azul metálica", cor: "#2052bf", funcao: TXT.chassi },
      { id: "asa-dianteira", nome: "Asa Dianteira", meshes: ["empty_2", "empty_22"], material: "Preto brilhante", cor: "#3f3f3f", funcao: TXT.asaD },
      { id: "asa-traseira", nome: "Asa Traseira", meshes: ["empty_21"], material: "Preto brilhante", cor: "#3f3f3f", funcao: TXT.asaT },
      { id: "eixos", nome: "Eixos", meshes: ["empty_6", "empty_8"], material: "Aço satinado", cor: "#9aa3ad", funcao: TXT.eixos },
      { id: "rodas", nome: "Rodas", meshes: ["empty_11", "empty_12", "empty_13", "empty_14", "empty_9", "empty_10", "empty_15", "empty_16", "empty_17", "empty_18", "empty_19", "empty_20"], material: "ABS branco / Azul", cor: "#f6f6f3", funcao: TXT.rodas },
      { id: "halo", nome: "Halo", meshes: ["empty_5"], material: "Preto brilhante", cor: "#404040", funcao: TXT.halo },
      { id: "capacete", nome: "Capacete do Piloto", meshes: ["empty_3"], material: "ABS branco", cor: "#e0ded0", funcao: TXT.capacete },
      { id: "co2", nome: "Suporte do Cartucho de CO2", meshes: ["empty_7"], material: "Aço satinado", cor: "#a0a0a0", funcao: TXT.co2 },
    ],
  },
];
