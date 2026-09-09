export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  id: "privacy" | "legal";
  label: string;
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "privacy",
    label: "Confidentialité",
    title: "Politique de confidentialité",
    updatedAt: "2026-09-09",
    intro:
      "Cette politique décrit quelles données personnelles Artemis Foodlab collecte, pourquoi, et comment elles sont traitées.",
    sections: [
      {
        heading: "Responsable du traitement",
        body: [
          "Le responsable du traitement est Jason Duquenne, éditeur de l'application (voir les Mentions légales).",
          "Pour toute question relative à tes données ou pour exercer tes droits : duquennejason@gmail.com.",
        ],
      },
      {
        heading: "Données collectées",
        body: [
          "Compte : adresse e-mail, mot de passe (conservé sous forme hachée, jamais en clair), nom affiché si tu en renseignes un, rôle (administrateur ou invité). Les comptes sont créés par un administrateur ; l'application n'est pas ouverte à l'inscription libre.",
          "Contenu que tu saisis : planning de repas, contenu du congélateur, listes de courses et articles cochés, journal alimentaire (repas consommés, objectifs de calories et de macronutriments), préférences d'affichage.",
          "Données techniques : un jeton de session, et des journaux serveur (adresse IP, date et heure, type de requête) conservés à des fins de sécurité et de diagnostic pendant la durée de rétention de l'hébergeur (de l'ordre de 7 jours), puis supprimés automatiquement.",
          "Le journal alimentaire et les objectifs nutritionnels peuvent constituer des données relatives à la santé. Ils servent uniquement à te fournir le service et ne sont jamais partagés ni exploités à d'autres fins.",
        ],
      },
      {
        heading: "Finalités et base légale",
        body: [
          "Fournir et faire fonctionner l'application (compte, synchronisation, sauvegarde de tes données) : exécution du service que tu utilises.",
          "Assurer la sécurité du service et prévenir les abus : intérêt légitime de l'éditeur.",
          "Aucune donnée n'est utilisée à des fins publicitaires, de profilage ou de revente.",
        ],
      },
      {
        heading: "Hébergeurs et sous-traitants",
        body: [
          "Application web : GitHub Pages — GitHub, Inc. (États-Unis).",
          "Interface de programmation (API) : Render — Render Services, Inc. (États-Unis).",
          "Base de données : Supabase — Supabase, Inc. ; les données sont hébergées dans l'Union européenne (région de Paris).",
          "La base de données est hébergée dans l'Union européenne. L'application web (GitHub) et l'API (Render) reposent sur des prestataires établis aux États-Unis ; les transferts correspondants sont encadrés par les clauses contractuelles types de la Commission européenne.",
          "Aucun autre tiers n'a accès à tes données. L'application n'utilise aucun outil de mesure d'audience.",
        ],
      },
      {
        heading: "Durée de conservation",
        body: [
          "Tes données sont conservées tant que ton compte existe.",
          "À la suppression du compte, l'ensemble des données personnelles associées (planning, congélateur, journal, listes de courses, sessions) est supprimé. Le catalogue de recettes, commun à tous les comptes, n'est pas concerné.",
          "Les sauvegardes automatiques de la base sont conservées de l'ordre de 7 jours puis écrasées ; une donnée supprimée en disparaît définitivement dans ce délai.",
        ],
      },
      {
        heading: "Tes droits",
        body: [
          "Conformément au RGPD, tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de tes données.",
          "Tu peux modifier ton adresse e-mail et ton mot de passe depuis l'écran « Compte ». La suppression d'un compte, ou l'obtention d'une copie de tes données, s'effectue sur demande auprès de l'éditeur.",
          "Pour toute demande : duquennejason@gmail.com.",
          "Tu peux introduire une réclamation auprès de la CNIL (www.cnil.fr).",
        ],
      },
      {
        heading: "Sécurité",
        body: [
          "Les échanges entre ton appareil et les serveurs sont chiffrés (HTTPS). Les mots de passe sont hachés. Les sessions reposent sur des jetons à durée de vie limitée. L'accès à la base de données est restreint.",
        ],
      },
      {
        heading: "Cookies et stockage local",
        body: [
          "L'application n'utilise que des cookies et un stockage local strictement nécessaires à son fonctionnement :",
          "— un cookie de session (« refresh_token ») pour te garder connecté ;",
          "— le stockage local du navigateur pour tes préférences (thème, affichage), tes brouillons et la date de dernière consultation des nouveautés ;",
          "— une base locale (IndexedDB) qui conserve une copie de tes données pour l'accès hors ligne et la rapidité d'affichage.",
          "Aucun cookie tiers, aucun traceur publicitaire ou de mesure d'audience n'est déposé. Aucun consentement n'est donc requis à ce titre.",
        ],
      },
      {
        heading: "Modifications",
        body: [
          "Cette politique peut être mise à jour. La date de dernière mise à jour est indiquée en tête de document.",
        ],
      },
    ],
  },
  {
    id: "legal",
    label: "Mentions légales",
    title: "Mentions légales",
    updatedAt: "2026-09-09",
    intro: "Informations relatives à l'éditeur et à l'hébergement d'Artemis Foodlab.",
    sections: [
      {
        heading: "Éditeur",
        body: [
          "Artemis Foodlab est édité par Jason Duquenne, personne physique, à titre non professionnel et non commercial (aucune immatriculation).",
          "Contact : duquennejason@gmail.com.",
          "Application accessible à l'adresse https://jduquenne.github.io/artemis-foodlab/.",
        ],
      },
      {
        heading: "Directeur de la publication",
        body: ["Jason Duquenne."],
      },
      {
        heading: "Hébergement",
        body: [
          "Application web : GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.",
          "API : Render — Render Services, Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94103, États-Unis.",
          "Base de données : Supabase — Supabase, Inc. ; données hébergées dans l'Union européenne (région de Paris, eu-west-3).",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        body: [
          "Le nom « Artemis Foodlab », l'interface, les textes, le code et les éléments graphiques de l'application sont protégés. Toute reproduction ou réutilisation sans autorisation de l'éditeur est interdite.",
          "Les recettes et leurs illustrations restent la propriété de leurs auteurs respectifs.",
        ],
      },
      {
        heading: "Données personnelles",
        body: [
          "Le traitement des données personnelles est décrit dans la Politique de confidentialité.",
          "Responsable du traitement : Jason Duquenne. Une réclamation peut être introduite auprès de la CNIL (www.cnil.fr).",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "L'application n'utilise que des cookies et un stockage strictement nécessaires (authentification, préférences, cache hors ligne) et aucun traceur tiers. Voir la Politique de confidentialité.",
        ],
      },
    ],
  },
];
