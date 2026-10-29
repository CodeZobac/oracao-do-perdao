import { translate, type Language } from "./i18n";
import { prayers } from "./prayers";

export const TOTAL_DAYS = 90;
export const RESET_HOUR = 5;

export type RoleType = "pai" | "mãe";

export const affirmations: Record<Language, readonly string[]> = {
  "pt-BR": [
    "Todo o meu Eu, todo o meu corpo, todas as minhas células vibram amor",
    "Eu sei o que é viver minha versão mais elevada",
    "Eu sei o que é me sentir amado(a)",
    "Eu sei o que é me sentir belo(a)",
    "Eu sei o que é me sentir cuidado(a)",
    "Tudo é sobre mim, nada é sobre o outro",
    "Eu me conecto ao meu curador interno",
    "Eu sei o que é me sentir seguro(a)",
    "Eu sei o que é viver meu potencial máximo",
    "Eu sou meu melhor e único curador",
    "Eu liberto a vítima que há em mim",
    "Eu liberto os ganhos que minha mente criou nas mais diversas situações às quais me aprisiono",
    "Eu tenho clareza sobre o momento do meu processo",
    "Eu liberto a doença em mim e através de mim",
    "Eu honro e agradeço cada obstáculo, cada desafio que me trouxe à minha versão mais elevada",
    "Eu volto a mim mesmo(a)",
    "Eu liberto o julgamento em mim e através de mim",
    "Eu sei o que é viver livre de julgamento",
    "Eu liberto a condenação em mim e através de mim",
    "Eu sei o que é viver livre da condenação",
    "Eu abro mão do controle",
    "Eu me liberto",
    "Eu sei o que é viver livremente minha própria história",
    "Eu crio minha realidade",
    "Eu sei o que é estar comigo mesmo(a), cuidar de mim",
    "Eu sei o que é viver em plena atenção",
    "Eu sei o que é estar em estado de presença",
    "Eu liberto a dependência emocional do outro, lembrando que a nutrição e o amor vêm de dentro",
    "Eu sei como me nutrir e cuidar de mim",
    "Eu me amo, muito",
    "Eu honro meu corpo com todas as suas marcas, histórias e imperfeições",
    "Eu honro cada uma das minhas escolhas, pois hoje sei que foram para meu crescimento e evolução",
    "Eu honro e agradeço a todos que passaram pela minha história e todos os papéis que tiveram que desempenhar para que eu enxergasse tanto sobre mim",
    "Eu estou pronto(a)",
    "Eu sou capaz",
    "Eu escrevo minha própria história",
    "Eu estou no comando da minha jornada",
    "Eu me valorizo",
    "Eu sei o que é me sentir valorizado(a)",
    "Eu sei o que é me sentir acolhido(a)",
    "Eu sei o que é me sentir amparado(a)",
    "Eu sou suficiente",
    "Eu me curo",
    "Meu propósito é me curar",
    "Eu ultrapasso os limites que minha mente reptiliana diz que tenho",
    "Eu me supero",
    "Eu desperto"
  ],
  "en": [
    "My whole self, my whole body, every cell vibrates with love",
    "I know what it means to live as my highest self",
    "I know what it feels like to be loved",
    "I know what it feels like to be beautiful",
    "I know what it feels like to be cared for",
    "It is all about me, not about the other person",
    "I connect with my inner healer",
    "I know what it feels like to be safe",
    "I know what it means to live to my fullest potential",
    "I am my own best and only healer",
    "I release the victim within me",
    "I release the benefits my mind has created from the situations in which I imprison myself",
    "I am clear about where I am in my process",
    "I release illness within me and through me",
    "I honor and give thanks for every obstacle and challenge that brought me to my highest self",
    "I return to myself",
    "I release judgment within me and through me",
    "I know what it means to live free from judgment",
    "I release condemnation within me and through me",
    "I know what it means to live free from condemnation",
    "I let go of control",
    "I set myself free",
    "I know what it means to live my own story freely",
    "I create my reality",
    "I know what it means to be with myself and care for myself",
    "I know what it means to live mindfully",
    "I know what it means to be present",
    "I release emotional dependence on others, remembering that nourishment and love come from within",
    "I know how to nourish and care for myself",
    "I love myself deeply",
    "I honor my body with all its marks, stories, and imperfections",
    "I honor each of my choices, because now I know they served my growth and evolution",
    "I honor and thank everyone who has been part of my story and every role they played so I could see so much about myself",
    "I am ready",
    "I am capable",
    "I write my own story",
    "I am in charge of my journey",
    "I value myself",
    "I know what it feels like to be valued",
    "I know what it feels like to be welcomed",
    "I know what it feels like to be supported",
    "I am enough",
    "I heal myself",
    "My purpose is to heal myself",
    "I go beyond the limits my reptilian mind tells me I have",
    "I surpass myself",
    "I awaken"
  ],
  "it": [
    "Tutto il mio essere, tutto il mio corpo, tutte le mie cellule vibrano d’amore",
    "So cosa significa vivere la versione più elevata di me",
    "So cosa significa sentirmi amato/a",
    "So cosa significa sentirmi bello/a",
    "So cosa significa sentirmi accudito/a",
    "Tutto riguarda me, nulla riguarda l’altro",
    "Mi connetto con il mio guaritore interiore",
    "So cosa significa sentirmi al sicuro",
    "So cosa significa vivere il mio pieno potenziale",
    "Sono il mio migliore e unico guaritore",
    "Libero la vittima che è in me",
    "Lascio andare i vantaggi che la mia mente ha creato nelle diverse situazioni in cui mi imprigiono",
    "Ho chiarezza sul momento del mio percorso",
    "Libero la malattia in me e attraverso di me",
    "Onoro e ringrazio ogni ostacolo, ogni sfida che mi ha portato alla versione più elevata di me",
    "Ritorno a me stesso/a",
    "Libero il giudizio in me e attraverso di me",
    "So cosa significa vivere senza giudizio",
    "Libero la condanna in me e attraverso di me",
    "So cosa significa vivere senza condanna",
    "Lascio andare il controllo",
    "Mi libero",
    "So cosa significa vivere liberamente la mia storia",
    "Creo la mia realtà",
    "So cosa significa stare con me stesso/a e prendermi cura di me",
    "So cosa significa vivere in piena consapevolezza",
    "So cosa significa essere presente",
    "Lascio andare la dipendenza emotiva dall’altro, ricordando che il nutrimento e l’amore vengono da dentro",
    "So come nutrirmi e prendermi cura di me",
    "Mi amo, molto",
    "Onoro il mio corpo con tutti i suoi segni, le sue storie e le sue imperfezioni",
    "Onoro ogni mia scelta, perché oggi so che è servita alla mia crescita ed evoluzione",
    "Onoro e ringrazio tutti coloro che hanno fatto parte della mia storia e tutti i ruoli che hanno svolto affinché potessi comprendere tanto di me",
    "Sono pronto/a",
    "Sono capace",
    "Scrivo la mia storia",
    "Sono al comando del mio percorso",
    "Riconosco il mio valore",
    "So cosa significa sentirmi apprezzato/a",
    "So cosa significa sentirmi accolto/a",
    "So cosa significa sentirmi sostenuto/a",
    "Sono abbastanza",
    "Mi guarisco",
    "Il mio scopo è guarirmi",
    "Supero i limiti che la mia mente rettiliana mi dice di avere",
    "Supero me stesso/a",
    "Mi risveglio"
  ]
};
export const AFFIRMATIONS = affirmations["pt-BR"];

export function getRoleForDay(dayNumber: number): RoleType {
  return dayNumber % 2 === 1 ? "pai" : "mãe";
}

export function getRoleLabel(roleType: RoleType, language: Language = "pt-BR"): string {
  return translate(language, roleType === "pai" ? "father" : "mother");
}

export function getAffirmationForDay(dayNumber: number, language: Language = "pt-BR"): string {
  return affirmations[language][(dayNumber - 1) % AFFIRMATIONS.length];
}

export function buildPrayer(roleType: RoleType, language: Language = "pt-BR") {
  const source = prayers[language];
  const father = roleType === "pai";
  const role = getRoleLabel(roleType, language).toLocaleLowerCase(language);
  const replacements: Record<string, string> = {
    role,
    object: father ? "o" : "a",
    adjective: father ? "allegro" : "allegra",
  };
  return {
    title: translate(language, "prayerTitle"),
    opening: father ? source.fatherOpening : source.motherOpening,
    paragraphs: source.paragraphs.map(paragraph => paragraph.replace(/\{(\w+)\}/g, (match, key: string) => replacements[key] ?? match)),
  };
}
