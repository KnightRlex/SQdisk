import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import al from './locales/al.json';
import ar from './locales/ar.json';
import bi from './locales/bi.json';
import bul from './locales/bul.json';
import chSim from './locales/ch-sim.json';
import chTr from './locales/ch-tr.json';
import chec from './locales/chec.json';
import core from './locales/core.json';
import croat from './locales/croat.json';
import dan from './locales/dan.json';
import en from './locales/en.json';
import es from './locales/es.json';
import eslov from './locales/eslov.json';
import fin from './locales/fin.json';
import fr from './locales/fr.json';
import gri from './locales/gri.json';
import hindi from './locales/hindi.json';
import hol from './locales/hol.json';
import island from './locales/island.json';
import it from './locales/it.json';
import jp from './locales/jp.json';
import mon from './locales/mon.json';
import nor from './locales/nor.json';
import per from './locales/per.json';
import pol from './locales/pol.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ruma from './locales/ruma.json';
import suec from './locales/suec.json';
import tail from './locales/tail.json';
import turc from './locales/turc.json';
import viet from './locales/viet.json';

const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      
      de: { translation: al },       // Alemán
      ar: { translation: ar },       // Árabe
      id: { translation: bi },       // Bahasa Indonesia
      bg: { translation: bul },      // Búlgaro
      "zh-CN": { translation: chSim }, // Chino Simplificado
      "zh-TW": { translation: chTr }, // Chino Tradicional
      cs: { translation: chec },     // Checo
      ko: { translation: core },     // Coreano
      hr: { translation: croat },    // Croata
      da: { translation: dan },      // Danés
      en: { translation: en },       // Inglés
      es: { translation: es },       // Español
      sk: { translation: eslov },    // Eslovaco
      fi: { translation: fin },      // Finlandés
      fr: { translation: fr },       // Francés
      el: { translation: gri },      // Griego
      hi: { translation: hindi },    // Hindi
      nl: { translation: hol },      // Holandés
      is: { translation: island },   // Islandés
      it: { translation: it },       // Italiano
      ja: { translation: jp },       // Japonés
      mn: { translation: mon },      // Mongol
      no: { translation: nor },      // Noruego
      fa: { translation: per },      // Persa
      pl: { translation: pol },      // Polaco
      pt: { translation: pt },       // Portugués
      ru: { translation: ru },       // Ruso
      ro: { translation: ruma },     // Rumano
      sv: { translation: suec },     // Sueco
      th: { translation: tail },     // Tailandés
      tr: { translation: turc },     // Turco
      vi: { translation: viet },     // Vietnamita
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;