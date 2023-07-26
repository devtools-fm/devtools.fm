import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { MetaTags } from "components/MetaTags";
import { NavigationTopBar } from "components/NavigationTopBar";
import { H1, H2, H3, H4, HR, Link, P, Ul } from "components/system";
import { useIsClient } from "utils/useIsClient";

export default function Episodes() {
  const isClient = useIsClient();
  const tags = (
    <MetaTags
      title="devtools.fm - Guest Info"
      description="A brief overview of what to expect when you're a guest on devtools.fm."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (!isClient) {
    return tags;
  }

  return (
    <Page>
      {tags}

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
              <H1>Guest Information</H1>
              <P>
                So you've been booked to come on the devtools.fm podcast, we're
                excited to have you!
              </P>
              <P>
                This page contains a brief overview of what to expect and how to
                prepare for your episode. If you have any questions or concerns
                please reach out to us on Twitter{" "}
                <Link href="https://twitter.com/devtoolsfm">@devtoolsfm</Link>.
              </P>
              <H2>Preparation</H2>
              <H3>Hardware</H3>
              <H4>Video</H4>
              <P>
                Devtools.fm release both audio and video versions of our
                episodes. For the video version all we ask is that you try to
                get the best possible lighting with what you have.
              </P>
              <H4>Audio</H4>
              <P>
                If you have a microphone it would be great if you could use it.
                Since you'll be doing the most talking the episode it really
                enhances the experience for our listeners.
              </P>
              <P>Please avoid using the following microphones:</P>
              <Ul>
                <li>Airpods</li>
                <li>Lapel Mic</li>
                <li>Laptop Mic</li>
              </Ul>
              <P>
                In the case that you don't have a microphone we can still record
                the episode. We'll just use the built in microphone on your
                computer.
              </P>
              <H3>Software</H3>
              <P>
                Devtools.fm is a remote podcast. We record our episodes over
                video chat. We use{" "}
                <Link href="https://www.riverside.fm/">Riverside</Link> for our
                video chat. It's a great tool that lets us record our sessions
                with the highest quality possible.
              </P>
              <P>
                You do not need to make an account to use Riverside. All you
                need to do is join the link in the calendar invitation.
              </P>
              <H2>Episode Content</H2>
              <P>
                For each podcast we prepare a rough outline with some questions
                we want to ask our guests. We'll send you this outline before
                the episode so you can prepare.
              </P>
              <P>
                You can find the outlines for all of our episodes{" "}
                <Link href="https://github.com/devtools-fm/devtools.fm/discussions">
                  here
                </Link>
                .
              </P>
              <H4>Tooltips</H4>
              <P>
                At the end of each episode we do a segments called "Tooltips".
                This is where we ask our guests to share some links to tools
                they're using or tools they think our listeners should check
                out.
              </P>
              <P>
                You can talk about anything from IDE plugins you've found useful
                to cooking appliances you can't live without.
              </P>
              <H3>Promotion</H3>
              <P>
                We'll be promoting your episode on{" "}
                <Link href="https://devtools.fm">Twitter</Link>, and a bunch of
                other places. If you could help us spread the word that would be
                amazing! You'll be tagged in all of our posts so you can just
                retweet them. If you have words on the topic a quote tweet is
                even better.
              </P>

              <HR />
              <P>That's it! We look forward to our full conversation.</P>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}
