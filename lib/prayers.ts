import type { Language } from "./i18n";

type PrayerSource = { fatherOpening: string; motherOpening: string; paragraphs: readonly string[] };

// Transcribed from the three supplied PDFs. Parent addresses follow the existing
// app's four insertion points; gender placeholders are resolved for each day.
export const prayers: Record<Language, PrayerSource> = {
  "pt-BR": {
    fatherOpening: "Pai que me trouxe à vida",
    motherOpening: "Mãe que me trouxe à vida",
    paragraphs: [
      "Eu perdoo você, por favor, me perdoe.",
      "Você nunca teve culpa,",
      "Eu também nunca tive culpa,",
      "Eu perdoo você, me perdoe, por favor.",
      "A vida nos ensina através das discórdias, {role}...",
      "E eu aprendi a amá-l{object} e a deixá-l{object} ir de minha mente.",
      "Você precisa viver suas próprias lições e eu também.",
      "Eu perdoo você, {role}... me perdoe em nome de Deus.",
      "Agora, vá ser feliz, para que eu seja também.",
      "Que Deus {object} proteja e perdoe os nossos mundos,",
      "As mágoas desapareceram do meu coração e só há luz e paz em minha vida.",
      "Quero você alegre, sorrindo, onde quer que você esteja, {role}...",
      "É tão bom soltar, parar de resistir e deixar fluir novos sentimentos!",
      "Eu perdoei você do fundo de minha alma, porque sei que você nunca fez nada por mal,",
      "E sim, porque acreditou que era a melhor maneira de ser feliz, {role}...",
      "Me perdoe por ter nutrido ódio e mágoa por tanto tempo em meu coração. Eu não sabia como era bom perdoar e soltar; eu não sabia como era bom deixar ir, o que nunca me pertenceu.",
      "Agora sei que só podemos ser felizes quando soltamos as vidas, para que sigam seus próprios sonhos e seus próprios erros. Não quero mais controlar nada, nem ninguém. Por isso, peço que me perdoe e solte também, para que seu coração se encha de amor, assim como o meu.",
    ],
  },
  en: {
    fatherOpening: "Father who brought me to life",
    motherOpening: "Mother who brought me to life",
    paragraphs: [
      "I forgive you, please forgive me.",
      "You were never to blame,",
      "I was never to blame either,",
      "I forgive you, forgive me, please.",
      "Life teaches us through disagreements, {role}...",
      "and I’ve learned to love you and let you go from my mind.",
      "You need to live your own lessons, and I need to as well.",
      "I forgive you, {role}... forgive me in God’s name.",
      "Now, go be happy so I can be too.",
      "May God protect you and forgive our worlds.",
      "The hurt has disappeared from my heart, and now there’s only Light and Peace in my life.",
      "I want you happy, smiling, wherever you are, {role}...",
      "It feels so good to let go, stop resisting, and let new feelings flow!",
      "I forgave you with all my soul because I know you never meant harm, you just believed it was the best way to be happy, {role}...",
      "Forgive me for holding onto hate and hurt for so long in my heart. I didn’t know how good it was to forgive and let go; I didn’t know how good it was to let go of what never belonged to me.",
      "Now I know that we can only be happy when we let go of lives, so they can follow their own dreams and make their own mistakes. I don’t want to control anything or anyone anymore. So, I ask that you forgive me and let me go too, so your heart can fill with love, just like mine.",
      "Thank you so much!",
    ],
  },
  it: {
    fatherOpening: "Padre che mi hai dato la vita",
    motherOpening: "Madre che mi hai dato la vita",
    paragraphs: [
      "Io ti perdono ... per favore, perdonami ... Tu non ha mai avuto colpa … E neanche io ho mai avuto colpa … Io ti perdono … perdonami, per favore.",
      "La vita ci insegna attraverso le discordie, {role} … e io ho imparato ad amarti e lasciarti andare.",
      "Tu hai bisogno di vivere ciò che hai imparato e anch’io. Io ti perdono, {role} … perdonami in nome di Dio.",
      "Adesso, sii felice, in modo tale che anch’io lo sia. Chi Dio ti protegga e perdoni i nostri mondi.",
      "Il risentimento è sparito dal mio cuore e ci sono solo Luce e Pace nella mia vita. Voglio che tu sia {adjective} e sorridente dovunque tu sia, {role} …",
      "È davvero piacevole lasciarsi andare, smettere di resistere e dare spazio a nuovi sentimenti! Io ti ho perdonato dal fondo dell’anima, perché so che tu non hai fatto mai niente per farmi male e, al contrario, perché credevi che era il modo migliore di essere felice, {role} …",
      "… perdonami per aver alimentato odio e risentimento per tanto tempo nel mio cuore. Io non sapevo come era bello perdonarti e lasciarti andare; non sapevo come era bello liberare ciò che non mi è mai appartenuto.",
      "Adesso so che possiamo essere felici quando liberiamo la vita, in modo che ognuno segua i propri sogni e commetta i propri errori. Non voglio più controllare niente e nessuno. Per questo ti chiedo di perdonarmi e di lasciarmi, in modo che il tuo cuore si riempia di amore, così come il mio. Grazie.",
    ],
  },
};
