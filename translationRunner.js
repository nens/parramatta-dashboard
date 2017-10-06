const manageTranslations = require("react-intl-translations-manager").default;

manageTranslations({
  messagesDirectory: "src/translations/extracted/",
  translationsDirectory: "src/translations/locales/",
  languages: ["nl"], // any language you need
  singleMessagesFile: false
});
