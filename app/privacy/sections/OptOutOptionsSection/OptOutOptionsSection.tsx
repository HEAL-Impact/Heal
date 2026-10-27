import React from "react";

export const OptOutOptionsSection = (): React.ReactElement => {
  return (
    <section className="w-full [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
      <p className="text-black">
        <span className="text-black">
          You may opt-out of receiving promotional and newsletter emails from
          Global API Factory by following the opt-out instructions provided in
          those emails. You may also opt-out of receiving promotional emails and
          other promotional communications from us at any time by emailing{" "}
        </span>
        <a
          href="mailto:info@heal-impact.org"
          className="text-[#021577] hover:underline"
        >
          info@heal-impact.org
        </a>
        <span className="text-black">
          {" "}
          with your specific request. If you opt out, we may still send you
          non-promotional communications, such as security alerts and notices
          related to your access to or use of the Services or those about your
          online account or our ongoing business relations.
        </span>
      </p>
    </section>
  );
};
