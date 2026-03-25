"use client";

import styles from "@/components/sections/Hero/HeroOfferingShowcase.module.scss";

type PartnerWorkspaceSettingsContent = {
  languageTitle: string;
  languageValue: string;
  appearanceBody: string;
  appearanceTitle: string;
  modes: {
    dark: string;
    light: string;
  };
  tabs: {
    appearance: string;
    profile: string;
  };
};

type PartnerWorkspaceSettingsPanelProps = {
  content: PartnerWorkspaceSettingsContent;
};

export default function PartnerWorkspaceSettingsPanel({
  content,
}: PartnerWorkspaceSettingsPanelProps) {
  return (
    <>
      <div className={styles.partnerWorkspaceSettingsTabs}>
        <span className={styles.partnerWorkspaceSettingsTab}>{content.tabs.profile}</span>
        <span className={`${styles.partnerWorkspaceSettingsTab} ${styles.partnerWorkspaceSettingsTabActive}`}>
          {content.tabs.appearance}
        </span>
      </div>

      <div className={styles.partnerWorkspaceSettings}>
        <div className={styles.partnerWorkspaceSettingsSection}>
          <div className={styles.partnerWorkspaceSettingMeta}>
            <span>{content.appearanceTitle}</span>
            <strong>{content.appearanceBody}</strong>
          </div>

          <div className={styles.partnerWorkspaceModes}>
            <article className={styles.partnerWorkspaceMode}>
              <div className={`${styles.partnerWorkspaceModePreview} ${styles.partnerWorkspaceModePreviewLight}`}>
                <span className={styles.partnerWorkspacePreviewSidebar} />
                <span className={styles.partnerWorkspacePreviewCanvas} />
              </div>
              <strong>{content.modes.light}</strong>
            </article>
            <article className={`${styles.partnerWorkspaceMode} ${styles.partnerWorkspaceModeActive}`}>
              <div className={`${styles.partnerWorkspaceModePreview} ${styles.partnerWorkspaceModePreviewDark}`}>
                <span className={styles.partnerWorkspacePreviewSidebar} />
                <span className={styles.partnerWorkspacePreviewCanvas} />
              </div>
              <strong>{content.modes.dark}</strong>
            </article>
          </div>
        </div>

        <div className={styles.partnerWorkspaceSettingsSection}>
          <div className={styles.partnerWorkspaceSettingsInlineHeader}>
            <span className={styles.partnerWorkspaceSettingsInlineLabel}>
              {content.languageTitle}
            </span>

            <div className={styles.partnerWorkspaceLanguage}>
              <span className={styles.partnerWorkspaceLanguageValue}>
                <span className={styles.partnerWorkspaceLanguageFlag} aria-hidden="true">
                  <span className={styles.partnerWorkspaceLanguageFlagVertical} />
                  <span className={styles.partnerWorkspaceLanguageFlagHorizontal} />
                </span>
                <span>{content.languageValue} (SE)</span>
              </span>
              <span>▾</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
