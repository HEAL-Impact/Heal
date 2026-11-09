import React from "react";

const purposes = [
  "Provide, operate, maintain and improve the Services",
  "Enabling you to access and use the Services",
  "Sending you technical notices, security alerts, support and administrative messages, and updates to the Services as necessary.",
  "Provide and deliver the Services and features you request, process, and complete transactions, and send you related information, including purchase confirmations and invoices;",
  "Respond to your comments, questions, and requests and provide customer service and support;",
  "Communicate with you about services, features, surveys, newsletters, offers, promotions, contests, and events, and provide other news or information about Global API Factory and our select partners;",
  "Monitor and analyze trends, usage, and activities in connection with the Services and for marketing or advertising purposes;",
  "Investigate and prevent fraudulent transactions, unauthorized access to the Services, and other illegal activities;",
  "Personalize and improve the Services, and provide content, features, and/or advertisements that match your interests and preferences or otherwise customize your experience on the Services;",
  "Send you push notifications from time to time in order to update you about events or activities related to the Services. If you no longer wish to receive these types of communications, you may turn them off at the device level. To ensure you receive proper notifications, we collect certain information about your device such as operating system and user identification information;",
  "Link or combine with other information we receive from third parties to help understand your needs and provide you with better service;",
  'For other purposes about which we will provide you with prior notice as described in the "Changes to This Policy" section.',
];

export const TermsAndConditionsSection = (): React.ReactElement => {
  return (
    <section className="w-full">
      <p className=" font-normal text-black text-base tracking-[0] leading-[26.4px] mb-[27px]">
        The information may be used for the following purposes;
      </p>

      <div className="flex flex-col gap-0">
        {purposes.map((purpose, index) => (
          <p
            key={index}
            className=" font-normal text-black text-base tracking-[0] leading-[26.4px]"
          >
            {purpose}
          </p>
        ))}
      </div>
    </section>
  );
};
