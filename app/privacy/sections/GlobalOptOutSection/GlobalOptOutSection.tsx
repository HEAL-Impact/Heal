import React from "react";

export const GlobalOptOutSection = (): React.ReactElement => {
  return (
    <p className="text-black [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
      Upon request, Global API Factory will provide you with information about
      whether we hold, or process on behalf of a third party, any of your
      personal information that we are aware of. To request this information,
      contact us at{" "}
      <a href="mailto:info@heal-impact.org" className="text-[#021577]">
        info@heal-impact.org
      </a>
      .
    </p>
  );
};
