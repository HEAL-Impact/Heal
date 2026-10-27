import React from "react";

export const RequestInformationSection = (): React.ReactElement => {
  return (
    <section className="w-full">
      <p className="[font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px] text-black">
        To request the removal of your personal information from our blog or
        testimonials, contact us at{" "}
        <a
          href="mailto:info@heal-impact.org"
          className="text-[#021577] hover:underline"
        >
          info@heal-impact.org
        </a>{" "}
        In some cases, we may not be able to remove your personal information,
        in which case we will let you know if we are unable to do so and why.
      </p>
    </section>
  );
};
