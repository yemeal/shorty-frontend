import React, { useMemo } from "react";
import PageHeaderReveal from "../components/PageHeaderReveal";
import { useLang } from "../LangContext";
import { getLegalCopy } from "../shared/config/legal";
import AppPageShell from "../shared/ui/AppPageShell";

const LegalPage = ({ docKey }) => {
  const { lang } = useLang();
  const legal = useMemo(() => getLegalCopy(lang), [lang]);
  const documentCopy = legal.documents[docKey];

  if (!documentCopy) {
    return null;
  }

  return (
    <AppPageShell mainClassName="w-full">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-36 pb-12">
        <PageHeaderReveal
          title={documentCopy.title}
          subtitle={documentCopy.intro}
          className="text-center space-y-3"
          titleClassName="type-display-title text-3xl sm:text-5xl text-slate-900 dark:text-white"
          subtitleClassName="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        />

        <div className="mt-8 sm:mt-10 flex justify-center">
          <span className="inline-flex items-center rounded-2xl border border-white/45 dark:border-white/10 bg-white/35 dark:bg-black/20 px-4 py-2 text-xs sm:text-sm type-ui-label text-slate-500 dark:text-slate-400">
            {legal.legalUpdated}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-5">
          {documentCopy.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/55 dark:bg-slate-900/35 backdrop-blur-[40px] shadow-lg dark:shadow-2xl p-5 sm:p-7"
            >
              <h2 className="type-ui-title text-xl sm:text-2xl text-slate-900 dark:text-white">
                {section.title}
              </h2>

              <div className="mt-4 space-y-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {section.body?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {section.list?.length ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppPageShell>
  );
};

export default LegalPage;
