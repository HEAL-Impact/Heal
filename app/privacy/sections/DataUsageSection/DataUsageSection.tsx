import React from "react";

const contentData = [
  {
    type: "paragraph",
    text: 'Periodically, this Privacy Policy will change. Global API Factory will notify you when changes are made by revising the "Last Updated" date at the top of this document, providing additional notice by adding a statement to our homepage, or sending you an email notification for material changes. We reserve the right to alter this Privacy Policy at any time and for any reason. Any changes or modifications will be effective immediately upon posting the updated policy on Globalapifactory.com, and you waive the right to receive specific notice of each such change or modification.',
  },
  {
    type: "paragraph",
    text: "We encourage you to review this Privacy Policy whenever you access the Global API Factory website or Global API Factory's API Hub to stay informed about our information governance practices and how you can help protect your privacy.",
  },
  {
    type: "paragraph",
    text: "If you disagree with any changes to this Privacy Policy and do not wish your information to be subject to the revised Privacy Policy, you will need to discontinue using the services.",
  },
];

export const DataUsageSection = (): React.ReactElement => {
  return (
    <section className="w-full">
      <h2 className=" font-bold text-black text-base tracking-[0] leading-[26.4px] mb-4">
        Changes to this Privacy Policy
      </h2>

      <div className="flex flex-col gap-[26.4px]">
        {contentData.map((item, index) => (
          <p
            key={index}
            className=" font-normal text-black text-base tracking-[0] leading-[26.4px]"
          >
            {item.text}
          </p>
        ))}
      </div>
    </section>
  );
};
