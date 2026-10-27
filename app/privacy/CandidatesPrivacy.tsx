import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CaliforniaPrivacyRightsSection } from "./sections/CaliforniaPrivacyRightsSection";
import { ChildrenPrivacySection } from "./sections/ChildrenPrivacySection";
import { ContactInformationSection } from "./sections/ContactInformationSection";
import { DataUsageSection } from "./sections/DataUsageSection";
import { GlobalApiSection } from "./sections/GlobalApiSection";
import { GlobalOptOutSection } from "./sections/GlobalOptOutSection";
import { GlobalPrivacyPolicySection } from "./sections/GlobalPrivacyPolicySection";
import { InformationCollectionSection } from "./sections/InformationCollectionSection";
import { LastUpdatedSection } from "./sections/LastUpdatedSection";
import { OptOutOptionsSection } from "./sections/OptOutOptionsSection";
import { RequestInformationSection } from "./sections/RequestInformationSection";
import { TermsAndConditionsSection } from "./sections/TermsAndConditionsSection";
import { UpdatePreferencesSection } from "./sections/UpdatePreferencesSection";
import { UserRightsSection } from "./sections/UserRightsSection";

export const CandidatesPrivacy = (): React.JSX.Element => {
  return (
    <div className="bg-[#fcf4e3] overflow-hidden w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-around bg-transparent shadow-sm">
        <div className="flex items-center">
          <Image
            src="/images/heal-impact-logo.png"
            alt="HEAL-Impact"
            width={204}
            height={52}
            className="h-12 w-auto object-contain"
          />
        </div>
        <Link
          href="/"
          className="font-acme bg-brand-primary hover:bg-brand-accent text-white py-2.5 px-6 rounded-full transition-all duration-300 text-sm uppercase tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5"
            >
          Back Home
        </Link>
      </header>
      
      {/* Content */}
      <div className="lg:px-80 flex flex-col gap-[87px] p-6">
      <UserRightsSection />
      <div className="flex h-[6240.05px] w-full self-center relative flex-col gap-3.5">
        <LastUpdatedSection />
        <DataUsageSection />
        <div className="flex items-center justify-center [font-family:'Jost',Helvetica] whitespace-nowrap font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Global API Factory Services
        </div>

        <div className="flex items-center justify-center [font-family:'Jost',Helvetica] whitespace-nowrap font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Global API Factory&#39;s API Hub for Enterprise
        </div>

        <div className="[font-family:'Jost',Helvetica] font-normal text-black text-base tracking-[0] leading-[26.4px]">
          The Global API Factory&#39;s API Hub for Enterprise is a customizable,
          next-generation API Hub that can be used by developers across all
          industries to find, manage, and connect to hundreds of internal APIs
          as well as external subscription APIs. API Hub for Enterprise
          integrates seamlessly with internal systems, supports the current APIs
          used within the Enterprise, works with any API Gateway, and is
          deployed in a multi-tenant cloud environment. API Hub for Enterprise
          users can publish their own APIs or discover existing APIs that enable
          them to innovate faster by sharing services. API Hub for Enterprise
          also includes a dedicated dashboard that provides valuable insights
          into API consumption, service level, and other key metrics to
          facilitate detailed analytics and monitoring of API performance.
        </div>

        <GlobalPrivacyPolicySection />
        <div className="flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-transparent text-base tracking-[0] leading-[26.4px]">
          <span className="text-black">
            In the event that you have any questions about this Privacy Policy,
            please contact Global API Factory at 85 2nd St, 4th Floor, San
            Francisco, CA 94105 or by emailing us at{" "}
          </span>

          <span className="text-[#021577]">info@heal-impact.org</span>

          <span className="text-black">.</span>
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Information Collected
        </div>

        <div className="flex items-center justify-center text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We may collect certain user information (including personal
          information and/or sensitive personal information) in the following
          ways:
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Information you provide to us
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We collect the information you provide directly to us including when
          you visit our website, register, and use the Global API Factory&#39;s
          API Hub or Global API Factory&#39;s API Hub for Enterprise.
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          For example, we collect information when you interact with Global API
          Factory, register as a Global API Factory user, create or modify your
          profile, interact with your Global API Factory online account, access
          and use API Hub, participate in any interactive feature of the
          Services, participate in a Global API Factory sponsored event, apply
          for a role at Global API Factory, or request customer support or
          communicate with us via third-party social media sites.
        </div>

        <div className="h-[106px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          The type of information we may collect directly from you includes your
          name, user name, email address, your picture, your address and contact
          phone number,
          <br />
          information about your preferences in configuration, employer name,
          job title, transactional data relating to your use of API Hub. Please
          keep in mind that the
          <br />
          information you choose to provide in your Global API Factory profile
          may also be considered as PII or be considered as sensitive
          information that can identify you as an individual.
        </div>

        <InformationCollectionSection />
        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Usage information: We monitor user activity connected with the
          Services and may collect information about the features and
          functionality used, the APIs uploaded or downloaded.
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Login information: We log information about you when you access and
          use API Hub including your Internet Protocol (IP) address, access
          times, browser types and language, Internet Service Provider (ISP)
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Device Information: We collect information about the device that you
          log into the Services from, including the hardware model, operating
          system and version, and the unique device identifiers
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Information collected by cookies and other tracking technologies: We
          use various technologies to collect information, which may include
          saving cookies to your computer. Cookies are small data files stored
          on your hard drive or in device memory that help us improve the
          Services and your user experience and preferences, allowing you to
          access and use the Services.
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          third-party cookies: If you sign up for access to Global API Factory
          using a third-party service, those third-party services may be using
          cookies that are subject to those third- party services’ own rules and
          policies. Global API Factory does not control the use of third-party
          cookies and other tracking technologies.
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Local Shared Objects “LSO” (Flash Cookies): Global API Factory uses
          LSO’s to collect and store information in order to provide certain
          features on our website. Third parties that we may partner with may
          also use LSO’s in order to provide certain features on our website.
        </div>

        <div className="relative self-stretch [font-family:'Jost',Helvetica] whitespace-nowrap h-[27px] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Information we collect from other sources
        </div>

        <div className="h-[106px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Global API Factory may also obtain information from third parties and
          combine that with information that we collect via the Services. Any
          access that we may have to such information from a third-party service
          is in accordance with the privacy notice and authorization procedures
          determined by that third-party service. We protect data obtained from
          third parties in accordance with the practices described within this
          Privacy Policy, plus any additional restrictions imposed by the source
          of the data.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Use of Information
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Global API Factory may use information collected for the limited
          purpose of providing the Services and relating functionality and
          services, as described in this Privacy Policy and permitted by
          applicable laws. These limited purposes include circumstances where it
          is necessary to provide or fulfill services requested by or for you or
          where you have given us your consent.
        </div>

        <TermsAndConditionsSection />
        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Third-party Applications
        </div>

        <div className="text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Global API Factory provides you with opportunities to connect with
          third-party applications or services via the Services. This Privacy
          Policy does not apply to your use of such third- party applications
          and services, and we are not responsible for how those third parties
          collect, use and disclose your information and data. We encourage you
          to review the privacy policies of those third parties before
          connecting to or using their applications or services to learn more
          about their information security and privacy practices.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Compliance with Laws
        </div>

        <div className="h-[106px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We may disclose your information to a third party if (a) we believe
          that disclosure is reasonably necessary to comply with any applicable
          law, regulation, legal process, or governmental request, (b) to
          enforce our agreements, policies, and Terms of Service, (c) to protect
          the security or integrity of the Services, (d) to protect Global API
          Factory, our customers or the public from harm or illegal activities,
          (e) to respond to an emergency which we believe in the good faith
          requires us to disclose information to assist in preventing the death
          or serious bodily injury of any person or (f) to any other third party
          with your prior consent.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Business Transfers
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We may share or transfer your information in connection with, or
          during negotiations of, any merger, sale of company assets, financing,
          or acquisition of all or a portion of our business to another company.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Aggregated or Anonymized Data
        </div>

        <div className="flex items-center justify-center text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We may also share aggregated or anonymized information with third
          parties that does not directly identify you.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Security
        </div>

        <div className="text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          While no service is completely secure, Global API Factory takes
          reasonable measures to help protect information about you from loss,
          theft, misuse, and unauthorized access, disclosure, alteration, and
          destruction. The servers on which personal information is stored are
          kept in a controlled environment with limited and managed access.
        </div>

        <div className="h-[106px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          You may access your account information and Services only through the
          use of an individual user ID and password. To protect the
          confidentiality of personal information, you must keep your password
          confidential and not disclose it to any other person. Please advise us
          immediately if you believe your password has been misused. In
          addition, always log out and close your browser when you finish your
          session. Please note that we will never ask you to disclose your
          password in an unsolicited phone call or email.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-transparent text-base tracking-[0] leading-[26.4px]">
          <span className="text-black">
            If you have any questions about the security of your personal
            information, you can contact us at{" "}
          </span>

          <span className="text-[#021577]">info@heal-impact.org</span>

          <span className="text-black">.</span>
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Your Choices
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Account Information &amp; Retention
        </div>

        <UpdatePreferencesSection />
        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We will retain your information for as long as your account is active
          or as needed to provide you the Services. We will retain and use your
          information to comply with our legal obligations, resolve disputes and
          enforce our agreements.
        </div>

        <div className="relative self-stretch h-[27px] [font-family:'Jost',Helvetica] font-normal text-black text-base tracking-[0] leading-[26.4px] whitespace-nowrap">
          Global API Factory will retain this personal information as necessary
          to comply with legal obligations, resolve disputes, and enforce
          agreements.
        </div>

        <GlobalOptOutSection />
        <div className="relative self-stretch [font-family:'Jost',Helvetica] whitespace-nowrap h-[27px] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Promotional and Newsletter Communications
        </div>

        <OptOutOptionsSection />
        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          COOKIES
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Global API Factory uses cookies and other tracking technologies to
          improve, track, customize, and secure Global API Factory&#39;s API
          Hub. For the purpose of this Privacy Policy, Global API Factory will
          refer to all these technologies as “cookies.” This Privacy Policy
          provides information on what, who, and how these technologies are used
          at Global API Factory website and Services. By using
          Globalapifactory.com, you agree to be bound by this Privacy Policy.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          USE OF COOKIES
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          A “cookie” is a small file that is sent and stored on your browser or
          mobile device when accessing a website. Cookies may contain
          information that can identify a user or device whenever you return to
          the Services. Global API Factory leverages cookies to keep track of
          services used, records user preferences, keeps track of browser
          sessions, delivers relevant advertising, and tracks pages you visit in
          order to improve the user experience.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          TYPES OF COOKIES
        </div>

        <div className="flex items-center justify-center text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          The following types of cookies may be used when you visit the Global
          API Factory:
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Necessary Cookies
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Global API Factory uses temporary (“session cookies”) and permanent
          (“persistent cookies”) on the platform. Session cookies will expire as
          you close your browser, while persistent cookies remain on your device
          after you close your browser, and can be used again the next time you
          access the Services. These cookies are to allow the site to operate as
          expected, and disabling these cookies may negatively impact the user
          experience.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Security Cookies
        </div>

        <div className="flex items-center justify-center text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Security cookies help identify and prevent security risks. We use
          these cookies to authenticate users and protect user data from
          unauthorized parties.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Third-party Cookies
        </div>

        <div className="relative flex items-center justify-center self-stretch h-[53px] [font-family:'Jost',Helvetica] font-normal text-black text-base tracking-[0] leading-[26.4px]">
          Third-party cookies may be placed on your device when you visit the
          Services. These cookies allow third parties to gather and track
          certain information about user activity or experience. These cookies
          can help us analyze how you use the platform and help us detect or
          prevent security risks.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Analytics Cookies
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Analytics cookies monitor how users reach and interact with the
          Services. These cookies let us know what features are performing
          appropriately and evaluate the best user experience for our users.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Functional Cookies
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          These cookies enable the website to provide enhanced functionality and
          personalization, to help you navigate the site and pixel tracking for
          performance/feature tracking. If you do not allow these cookies then
          some or all of the Services may not function properly.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          OPT-OUT OF COOKIES
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Most browsers are set to accept cookies by default. However, you can
          remove or reject cookies in your browser’s settings. Please be aware
          that such action could affect the availability and functionality of
          the Global API Factory website and Services.
        </div>

        <div className="flex items-center justify-center text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          For more information on how to control cookies, check your browser or
          device’s settings for how you can control or reject cookies, or visit
          the following links:
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-[#021577] text-base tracking-[0] leading-[26.4px]">
          Apple Safari
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-[#021577] text-base tracking-[0] leading-[26.4px]">
          Google Chrome
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-[#021577] text-base tracking-[0] leading-[26.4px]">
          Mozilla Firefox
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-[#021577] text-base tracking-[0] leading-[26.4px]">
          Microsoft Edge
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-normal text-[#021577] text-base tracking-[0] leading-[26.4px]">
          Microsoft Internet Explorer
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          California Residents
        </div>

        <CaliforniaPrivacyRightsSection />
        <div className="relative self-stretch [font-family:'Jost',Helvetica] whitespace-nowrap h-[27px] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Single Sign-On
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          You can log in to our website using sign-in services such as Facebook
          Connect or an Open ID provider. These services will authenticate your
          identity and provide you the option to share certain personal
          information with us such as your name and email address to
          pre-populate our sign-up form. Services like Facebook Connect give you
          the option to post information about your activities on this website
          to your profile page to share with others within your network.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Social Media Features and Widgets
        </div>

        <div className="h-20 text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          The Services may include social media features. These features may
          collect your IP address, which page you are visiting on our website,
          and may set a cookie to enable the feature to function properly.
          Social media features are either hosted by a third party or hosted
          directly on the Services. Your interactions with these features are
          governed by the privacy notice of the company providing it.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Community Forums and Blogs
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          Our website offers publicly accessible blogs or community forums. You
          should be aware that any information you provide in these areas may be
          read, collected, and used by others who access them.
        </div>

        <RequestInformationSection />
        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Testimonials
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We display personal testimonials of satisfied Developers/users on our
          website in addition to other endorsements. With your consent, we may
          post your testimonial along with your name.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Links to third-party Websites
        </div>

        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          We may place links on the Services. When you click on a link to a
          third-party website from our website, your activity and use on the
          linked website is governed by that website’s policies, not by those of
          Global API Factory. We encourage you to visit their websites and
          review their privacy and user policies.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          Our Policy Toward Children
        </div>

        <GlobalApiSection />
        <ContactInformationSection />
        <div className="h-[53px] text-black relative self-stretch [font-family:'Jost',Helvetica] font-normal text-base tracking-[0] leading-[26.4px]">
          If you are in the EEA or Switzerland and feel we have not dealt with
          your concerns and that we are failing to meet our legal obligations,
          you can report this to your local data protection regulator, who in
          turn will contact Global API Factory and comment.
        </div>

        <div className="relative flex items-center justify-center self-stretch [font-family:'Jost',Helvetica] font-bold text-black text-base tracking-[0] leading-[26.4px]">
          CONTACT US
        </div>

        <ChildrenPrivacySection />
      </div>
      </div>
    </div>
  );
};
