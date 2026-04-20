export const LEGAL_ROUTES = {
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  cookies: "/legal/cookies",
  contacts: "/legal/contacts",
};

export const COOKIE_CONSENT_STORAGE_KEY = "shorty-cookie-consent-v1";
export const GITHUB_REPOSITORY_URL = "https://github.com/yemeal/shorty";

export const LEGAL_OWNER = {
  fullName: "Емельянов Александр Даниилович",
  city: "Новосибирск",
  email: "emelyalex@bk.ru",
  statusRu: "самозанятый",
  statusEn: "self-employed",
};

const COMMON_STORAGE_KEYS = [
  "`shorty-auth-user` — локальный снимок аккаунта для быстрого старта клиента",
  "`shorty-theme` — тема интерфейса",
  "`shorty-lang` — язык интерфейса",
  "`shorty-shorten-draft` — черновик формы сокращения ссылки",
  "`shorty-recent-links` — список недавних ссылок на устройстве",
  "`shorty-profile-draft` — черновик редактирования профиля",
  "`shorty-cookie-consent-v1` — отметка о просмотре cookie/local storage notice",
];

export const LEGAL_COPY = {
  ru: {
    footerLinks: {
      privacy: "Политика",
      terms: "Условия",
      cookies: "Cookies",
      contacts: "Контакты",
    },
    ownerLine: `${LEGAL_OWNER.fullName} · ${LEGAL_OWNER.city} · ${LEGAL_OWNER.statusRu}`,
    cookieNoticeTitle: "Cookies и локальное хранилище",
    cookieNoticeBody:
      "Сайт использует технические cookies и localStorage для авторизации, языка, темы, черновиков и недавних ссылок. Это нужно для корректной работы интерфейса.",
    cookieNoticeAccept: "Понятно",
    cookieNoticeDetails: "Подробнее",
    legalUpdated: "Актуально на 18 апреля 2026",
    consentLabel: "Я принимаю Пользовательское соглашение и Политику обработки персональных данных",
    consentError: "Для регистрации нужно принять условия и политику обработки персональных данных",
    documents: {
      privacy: {
        title: "Политика обработки персональных данных",
        intro:
          "Настоящая политика описывает, какие данные обрабатываются при использовании сервиса шорти.рф, для каких целей они используются и как пользователь может реализовать свои права.",
        sections: [
          {
            title: "1. Оператор персональных данных",
            body: [
              `Оператор: ${LEGAL_OWNER.fullName}.`,
              `Место нахождения: ${LEGAL_OWNER.city}.`,
              `Контактный email для обращений: ${LEGAL_OWNER.email}.`,
              `Статус: ${LEGAL_OWNER.statusRu}.`,
            ],
          },
          {
            title: "2. Какие данные обрабатываются",
            body: [
              "При регистрации и использовании аккаунта могут обрабатываться username, email, emoji-аватар, био, язык интерфейса, тема, часовой пояс и технические данные, связанные с активной сессией.",
              "При использовании формы сокращения ссылки могут обрабатываться исходные URL, выбранные slug и технические данные, необходимые для создания короткой ссылки.",
            ],
          },
          {
            title: "3. Цели и правовые основания обработки",
            body: [
              "Данные обрабатываются для регистрации аккаунта, аутентификации, работы профиля, создания коротких ссылок, сохранения пользовательских настроек и обеспечения безопасности сервиса.",
              "Основания обработки: согласие пользователя, исполнение пользовательского соглашения, а также законный интерес оператора в части обеспечения стабильной и безопасной работы сервиса.",
            ],
          },
          {
            title: "4. Хранение и защита данных",
            body: [
              "Данные хранятся не дольше, чем это необходимо для целей обработки, либо до удаления аккаунта и прекращения соответствующих обязательств по закону.",
              "Оператор принимает разумные организационные и технические меры для защиты данных от неправомерного доступа, изменения, раскрытия и уничтожения.",
            ],
          },
          {
            title: "5. Права пользователя",
            body: [
              "Пользователь вправе запросить сведения об обработке своих данных, потребовать их уточнения, блокирования или удаления, а также отозвать согласие в части, основанной на согласии.",
              `Запросы направляются на ${LEGAL_OWNER.email}.`,
            ],
          },
        ],
      },
      terms: {
        title: "Пользовательское соглашение",
        intro:
          "Настоящее соглашение регулирует использование сервиса шорти.рф, включая регистрацию аккаунта, создание коротких ссылок и работу пользовательского профиля.",
        sections: [
          {
            title: "1. Предмет соглашения",
            body: [
              "Пользователю предоставляется доступ к функциональности сокращения ссылок, управления профилем и просмотра своих коротких ссылок.",
            ],
          },
          {
            title: "2. Правила использования",
            body: [
              "Пользователь обязуется не использовать сервис для противоправного контента, фишинга, вредоносного ПО, обхода ограничений, спама и иных злоупотреблений.",
              "Оператор вправе ограничить доступ к аккаунту или отдельным ссылкам при нарушении правил или требований закона.",
            ],
          },
          {
            title: "3. Ограничение ответственности",
            body: [
              "Сервис предоставляется по модели 'как есть'. Оператор не гарантирует бесперебойную работу во всех сценариях и не несет ответственность за косвенные убытки пользователя.",
              "Пользователь самостоятельно отвечает за контент и адреса, которые он сокращает через сервис.",
            ],
          },
          {
            title: "4. Изменения сервиса и документов",
            body: [
              "Оператор вправе изменять функциональность сервиса, интерфейс и тексты правовых документов. Актуальная версия документов публикуется на сайте.",
            ],
          },
        ],
      },
      cookies: {
        title: "Использование cookies и localStorage",
        intro:
          "Сервис использует технические cookies и локальное хранилище браузера для нормальной работы интерфейса и авторизации.",
        sections: [
          {
            title: "1. Что используется",
            body: [
              "HTTP-only cookies backend-а используются для сессии авторизации и обновления сессии.",
              "В localStorage сохраняются только данные интерфейса и локальные черновики на текущем устройстве.",
            ],
            list: COMMON_STORAGE_KEYS,
          },
          {
            title: "2. Для чего это нужно",
            body: [
              "Эти данные позволяют сохранить вход в аккаунт, тему, язык, локальные черновики и быстрый доступ к недавним ссылкам.",
            ],
          },
          {
            title: "3. Как отключить",
            body: [
              "Пользователь может очистить cookies и localStorage через настройки браузера. Это может привести к выходу из аккаунта, потере локальных черновиков и сбросу настроек интерфейса.",
            ],
          },
        ],
      },
      contacts: {
        title: "Контакты и сведения о владельце",
        intro:
          "Эта страница содержит сведения о владельце сайта и контактные данные для обращений по вопросам работы сервиса и обработки персональных данных.",
        sections: [
          {
            title: "1. Владелец сайта",
            body: [
              `ФИО: ${LEGAL_OWNER.fullName}.`,
              `Город: ${LEGAL_OWNER.city}.`,
              `Статус: ${LEGAL_OWNER.statusRu}.`,
              "ИНН: 5404 4666 0050.",
            ],
          },
          {
            title: "2. Контакты для обращений",
            body: [
              `Email: ${LEGAL_OWNER.email}.`,
              "По этому адресу можно направлять запросы по персональным данным, правовым документам и работе сервиса.",
            ],
          },
        ],
      },
    },
  },
  en: {
    footerLinks: {
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      contacts: "Contacts",
    },
    ownerLine: `${LEGAL_OWNER.fullName} · ${LEGAL_OWNER.city} · ${LEGAL_OWNER.statusEn}`,
    cookieNoticeTitle: "Cookies and local storage",
    cookieNoticeBody:
      "This site uses technical cookies and localStorage for sign-in, language, theme, drafts, and recent links. They are required for the interface to work correctly.",
    cookieNoticeAccept: "Got it",
    cookieNoticeDetails: "Details",
    legalUpdated: "Updated on April 18, 2026",
    consentLabel: "I accept the Terms of Use and the Privacy Policy",
    consentError: "You need to accept the Terms of Use and the Privacy Policy before registration",
    documents: {
      privacy: {
        title: "Privacy Policy",
        intro:
          "This policy explains what data is processed when using shorty.rf, why it is processed, and how a user can exercise their rights.",
        sections: [
          {
            title: "1. Data operator",
            body: [
              `Operator: ${LEGAL_OWNER.fullName}.`,
              `Location: ${LEGAL_OWNER.city}.`,
              `Contact email: ${LEGAL_OWNER.email}.`,
              `Status: ${LEGAL_OWNER.statusEn}.`,
            ],
          },
          {
            title: "2. Data we process",
            body: [
              "When you register and use an account, we may process your username, email, emoji avatar, bio, interface language, theme, time zone, and technical session-related data.",
              "When you shorten a link, we may process the original URL, selected slug, and technical data required to create the short link.",
            ],
          },
          {
            title: "3. Purposes and legal grounds",
            body: [
              "Data is processed for account registration, authentication, profile settings, link shortening, interface personalization, and service security.",
              "Legal grounds include user consent, performance of the service agreement, and the operator's legitimate interest in running a stable and secure service.",
            ],
          },
          {
            title: "4. Storage and security",
            body: [
              "Data is stored no longer than required for the processing purposes or until account deletion and any legally required retention periods expire.",
              "The operator applies reasonable organizational and technical measures to protect data from unauthorized access, alteration, disclosure, and destruction.",
            ],
          },
          {
            title: "5. User rights",
            body: [
              "A user may request information about their data processing, ask for correction, blocking, or deletion, and withdraw consent where processing is based on consent.",
              `Requests can be sent to ${LEGAL_OWNER.email}.`,
            ],
          },
        ],
      },
      terms: {
        title: "Terms of Use",
        intro:
          "These terms govern the use of shorty.rf, including account registration, link shortening, and profile management.",
        sections: [
          {
            title: "1. Service scope",
            body: [
              "The service provides link shortening, profile management, and access to a user's own short-link list.",
            ],
          },
          {
            title: "2. Acceptable use",
            body: [
              "You must not use the service for unlawful content, phishing, malware, spam, abuse, or attempts to bypass restrictions.",
              "The operator may restrict access to an account or a link when the rules or applicable law are violated.",
            ],
          },
          {
            title: "3. Liability limitations",
            body: [
              "The service is provided on an 'as is' basis. The operator does not guarantee uninterrupted availability in every scenario and is not liable for indirect damages.",
              "The user remains responsible for the content and destinations they shorten through the service.",
            ],
          },
          {
            title: "4. Changes",
            body: [
              "The operator may update the service, interface, and legal documents. The current versions are published on the website.",
            ],
          },
        ],
      },
      cookies: {
        title: "Cookies and localStorage",
        intro:
          "The service uses technical cookies and browser local storage to keep authentication and interface preferences working.",
        sections: [
          {
            title: "1. What is used",
            body: [
              "HTTP-only backend cookies are used for authentication sessions and session refresh.",
              "localStorage stores client-side interface preferences and local drafts on the current device.",
            ],
            list: COMMON_STORAGE_KEYS,
          },
          {
            title: "2. Why it is needed",
            body: [
              "These items keep you signed in, preserve theme and language, restore local drafts, and surface recent links on your device.",
            ],
          },
          {
            title: "3. How to disable it",
            body: [
              "You can clear cookies and localStorage in your browser settings. This may sign you out, remove local drafts, and reset interface preferences.",
            ],
          },
        ],
      },
      contacts: {
        title: "Contacts and site owner details",
        intro:
          "This page provides owner details and a contact address for service questions and personal data requests.",
        sections: [
          {
            title: "1. Site owner",
            body: [
              `Name: ${LEGAL_OWNER.fullName}.`,
              `City: ${LEGAL_OWNER.city}.`,
              `Status: ${LEGAL_OWNER.statusEn}.`,
              "Tax ID: will be added after it is provided.",
            ],
          },
          {
            title: "2. Contact",
            body: [
              `Email: ${LEGAL_OWNER.email}.`,
              "This address can be used for personal data requests, legal questions, and service-related messages.",
            ],
          },
        ],
      },
    },
  },
};

export function getLegalCopy(lang) {
  return LEGAL_COPY[lang] ?? LEGAL_COPY.en;
}
