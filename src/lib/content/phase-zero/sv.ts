// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const SV: PhaseZeroContent = {
  letters: [
    {
      id: "sv-vowels",
      title: "Las tres letras extra: å, ä, ö",
      intro: "El sueco tiene tres vocales más al final del abecedario, y la u y la y suenan distinto.",
      letters: [
        S("å", "o", "una o", ["två", "tvo", "dos"]),
        S("ä", "e abierta", "una e con la boca abierta", ["äpple", "épple", "manzana"]),
        S("ö", "ö", "una e con los labios redondos", ["öl", "öl", "cerveza"]),
        S("u", "u sueca", "entre u y ü, con los labios muy redondos y apretados", ["hus", "hüs", "casa"]),
        S("y", "ü", "una i con los labios en forma de u", ["ny", "nü", "nuevo"]),
      ],
    },
    {
      id: "sv-cons",
      title: "Sonidos «sj» y consonantes suaves",
      intro: "El famoso sj-ljudet y las consonantes que se suavizan.",
      letters: [
        S("sj", "sj (soplo)", "un soplo entre sh y j, con los labios redondos; también sk ante e, i, y, ä, ö", ["sju", "shü", "siete"]),
        S("k", "sh suave", "ante e, i, y, ä, ö, la k suena como una sh suave (tj)", ["kök", "shök", "cocina"]),
        S("g", "y", "ante e, i, y, ä, ö, la g suena y", ["göra", "yöra", "hacer"]),
        S("j", "y de yo", "y de «yo»; dj, gj, hj, lj suenan igual", ["ja", "ya", "sí"]),
        S("rs", "sh", "r + s se funden en sh", ["först", "fösht", "primero"]),
      ],
    },
  ],
  rules: [
    {
      id: "soft-k-g",
      title: "k, g y sk se suavizan ante e, i, y, ä, ö",
      explain: "Delante de las vocales «suaves» (e, i, y, ä, ö), la k suena como una sh suave, la g suena y, y sk suena como el soplo sj.",
      examples: [
        { w: "kött", r: "shött", es: "carne" },
        { w: "göra", r: "yöra", es: "hacer" },
        { w: "skina", r: "shina", es: "brillar" },
      ],
      check: { q: "¿Cómo suena la k de «kött» (carne)?", show: "kött", options: ["sh suave (shött)", "k (kött)"], answer: "sh suave (shött)", lang: "es", why: "k ante ö se suaviza." },
    },
    {
      id: "long-short",
      title: "Vocal larga ante una consonante, corta ante dos",
      explain: "Una vocal seguida de una sola consonante es larga; seguida de dos, corta. Cambia el significado.",
      examples: [
        { w: "tak", r: "taak", es: "techo" },
        { w: "tack", r: "tak", es: "gracias" },
        { w: "glas", r: "glaas", es: "vaso" },
      ],
      check: { q: "¿Cuál tiene la a corta?", options: ["tack", "tak"], answer: "tack", lang: "target", why: "Dos consonantes detrás (ck): vocal corta." },
    },
    {
      id: "o-u",
      title: "La o a menudo suena u",
      explain: "Una o larga suele sonar como una u cerrada: sol suena «suul».",
      examples: [
        { w: "sol", r: "suul", es: "sol" },
        { w: "bok", r: "buuk", es: "libro" },
        { w: "stor", r: "stuur", es: "grande" },
      ],
      check: { q: "¿Cómo suena «bok» (libro)?", show: "bok", options: ["buuk", "bok", "bak"], answer: "buuk", lang: "es", why: "La o larga suena u." },
    },
    {
      id: "rs",
      title: "r + s, t, d, n se funden",
      explain: "Tras una r, las letras s, t, d, n se pronuncian con la lengua hacia atrás y la r casi desaparece: rs suena sh.",
      examples: [
        { w: "först", r: "fösht", es: "primero" },
        { w: "Lars", r: "lash", es: "Lars (nombre)" },
        { w: "barn", r: "baan", es: "niño" },
      ],
      check: { q: "¿Cómo suena «rs» en «först» (primero)?", show: "först", options: ["sh", "rs", "s"], answer: "sh", lang: "es" },
    },
    {
      id: "silent-first",
      title: "dj, gj, hj, lj al principio: y",
      explain: "Al principio de palabra, la primera letra de dj, gj, hj y lj no suena: todas se dicen «y».",
      examples: [
        { w: "djur", r: "yuur", es: "animal" },
        { w: "hjälp", r: "yelp", es: "ayuda" },
        { w: "gjort", r: "yort", es: "hecho" },
      ],
      check: { q: "¿Cómo suena «hjälp» (ayuda)?", show: "hjälp", options: ["yelp", "jyelp", "hielp"], answer: "yelp", lang: "es", why: "La h de hj no suena." },
    },
  ],
};
