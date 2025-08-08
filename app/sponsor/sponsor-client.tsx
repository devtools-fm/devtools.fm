"use client";

import { Navigation } from "@devtools-ds/navigation";
import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { NavigationTopBar } from "components/NavigationTopBar";
import { H1, H2, H3, HR, P, Ul } from "components/system";
import { Label } from "components/label";
import { Input } from "components/input";
import { Button } from "components/button";

const pastSponsors = [
  {
    name: "CodeCrafters",
    url: "https://codecrafters.io",
    logo: "https://codecrafters.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.e38048e3.png&w=48&q=75",
  },
  {
    name: "Raycast",
    url: "https://raycast.com",
    logo: "https://raycastapp.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F9dab15c5-70d8-4f0d-a8b1-604b0b85912b%2Fraycast-logo-256.png?table=block&id=ce1ccf83-06b1-4ac8-b8d4-7b3276bf34e0&spaceId=50d13040-8e7c-4990-aed4-0844f62c7aa2&width=250&userId=&cache=v2",
  },
];

export function SponsorClient() {
  return (
    <Page>
      <div className="mt-10 mb-12">
        <h1 className="flex justify-center mb-10">
          <Logo />
        </h1>

        <p className="text-lg text-center">
          A podcast about{" "}
          <ColoredText color="purple">developer tools</ColoredText> and the{" "}
          <ColoredText color="blue">people</ColoredText> who make them.
        </p>
      </div>

      <Browser>
        <Navigation index={2} onChange={() => {}}>
          <NavigationTopBar />
          <Navigation.Panels>
            <Navigation.Panel />
            <Navigation.Panel />
            <Navigation.Panel className="py-10 mx-3 md:mx-6 focus:outline-none">
              <H1>Sponsor</H1>
              <P>
                We built DevTools.fm to connect with people who, like us, are
                passionate about building tools. Our current goal is to reduce
                the overhead of the podcast, continue to schedule high quality
                guests, broaden our audience, and expand the frequency of
                episodes. We're in this to make an impact, not a profit, but
                sustainability is key.
              </P>

              <P>
                We're seeking a sponsorship partner within the developer tools
                space whose support will allow us to grow our audience while
                sharing content on their product. We're offering 2 sponsorship
                slots:
              </P>
              <Ul>
                <li>
                  1st - 60 second ad slot at the beginning of the shows.
                  Inclusion in social clips
                </li>
                <li>2nd - 30 second ad slot mid episode</li>
              </Ul>

              <div className="text-sm mt-8 mb-2">Past sponsors:</div>

              <ul className="flex gap-6 my-6">
                {pastSponsors.map((sponsor) => (
                  <li key={sponsor.name}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={sponsor.url}
                      className="flex flex-col gap-2 items-center"
                    >
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-12 w-12"
                      />
                      <span className="text-xs text-gray-400">
                        {sponsor.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <P>
                We're willing to collaborate with you on the contents of the
                placement or use pre-provided material so long as it fits with
                the form and theme of our show. The full offerings are described
                further down. We're open to discuss requests outside our listed
                offerings.
              </P>
              <P>
                We've published 6 episodes in the last 90 days with a total of
                11k podcast plays, 2.5k site page views, and 12k YouTube views.
                In the last 60 days we've had 130k views on TikTok. In the last
                30 days we've had 102k impressions on twitter with 7k profile
                visits.
              </P>

              <H2>Offerings</H2>
              <H3>1st - ($600)</H3>
              <Ul>
                <li>
                  60 second ad slot at the beginning of each weekly episode
                  released during the partnership period
                </li>
                <li>
                  Logo, links, and messaging on devtools.fm homepage during the
                  partnership period
                </li>
                <li>
                  Logo, links, and messaging on sponsored episode pages which
                  remains even after the partnership period ends
                </li>
                <li>
                  Refreshed social posts on sponsor's episode (if applicable)
                </li>
                <li>Sponsored links on episode social promotions</li>
                <li>
                  Consideration of collaboration opportunities or special
                  requests
                </li>
                <li>Input on guest lineup</li>
              </Ul>
              <H3>2nd - ($300)</H3>
              <Ul>
                <li>
                  30 second ad slot at the midpoint of each weekly episode
                  released during the partnership period
                </li>
                <li>
                  Logo, links, and messaging on devtools.fm homepage during the
                  partnership period
                </li>
                <li>
                  Logo, links, and messaging on sponsored episode pages which
                  remains even after the partnership period ends
                </li>
              </Ul>
              <H2>Terms</H2>
              <P>
                We're asking the above prices per episode for an initial
                partnership duration between 4 to 8 episodes. With longer
                partnerships we will also lower the price accordingly.
              </P>
              <HR />
              <H3>Apply</H3>
              <form
                action="/api/submit-sponsor-application"
                method="post"
                className="flex flex-col gap-6"
              >
                <label className="flex flex-col gap-4">
                  <Label>Name</Label>
                  <Input name="name" required />
                </label>
                <label className="flex flex-col gap-4">
                  <Label>Company</Label>
                  <Input name="company" required />
                </label>
                <label className="flex flex-col gap-4">
                  <Label>Email</Label>
                  <Input name="email" type="email" required />
                </label>
                <div className="flex">
                  <div className="flex-1" />
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}