import React from "react";

export const UpdatePreferencesSection = (): React.ReactElement => {
  return (
    <div className="w-full [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
      <p className="text-black">
        You may update, correct, or delete information about you at any time by
        logging into your online account and modifying your information or by
        emailing us at{" "}
        <a
          href="mailto:info@heal-impact.org"
          className="text-[#021577] hover:underline"
        >
          info@heal-impact.org
        </a>
        . We will retain your personal information for the period necessary to
        fulfill the purposes outlined in this Notice. If you wish to deactivate
        your account, please email us at{" "}
        <a
          href="mailto:info@heal-impact.org"
          className="text-[#021577] hover:underline"
        >
          info@heal-impact.org
        </a>
        , but note that we may retain certain information as required by law or
        for legitimate business purposes. We may also retain cached or archived
        copies of information about you for a certain period of time. We will
        respond to your access request within 30 days.
      </p>
    </div>
  );
};
