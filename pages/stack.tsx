import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { MetaTags } from "components/MetaTags";
import { NavigationTopBar } from "components/NavigationTopBar";
import { Blockquote, H1, H2, H3, Link, P, Ul } from "components/system";
import { useIsClient } from "utils/useIsClient";

export default function Episodes() {
  const isClient = useIsClient();
  const tags = (
    <MetaTags
      title="devtools.fm - Stack"
      description="The tools we use to produce and publish and episode of devtools.fm"
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
              <H1>Our Podcast's Stack</H1>
              <P>
                One thing that surprised us when creating this podcast about
                developer tools is how many tools it takes to make a podcast!
              </P>
              <P>
                This page will contain a list of a (mostly) up to date list of
                things we use to create, publish and distribute our podcast.
              </P>
              <H2>Hardware</H2>
              <P>
                One things that's a must for any podcast is a whole lot of
                hardware! You don't necessarily need to own all of these things
                to make a quality podcast but they're the things we've found
                help us produce a better product.
              </P>
              <H3>Andrew's Gear</H3>
              <Ul>
                <li>
                  <Link href="https://www.logitech.com/en-us/products/webcams/brio-4k-hdr-webcam.960-001105.html">
                    Logitech Brio
                  </Link>
                </li>
                <li>
                  <Link href="https://www.elgato.com/en/key-light">
                    Elgato Key Light (2)
                  </Link>
                </li>
                <li>
                  <Link href="https://www.shure.com/en-US/products/microphones/sm7b">
                    Shure SM7B
                  </Link>
                </li>
                <li>
                  <Link href="https://www.cloudmicrophones.com/cloudlifter-cl-1">
                    Cloudlifter CL-1
                  </Link>
                  {" - "}
                  Pre-amp for microphone
                </li>
                <li>
                  <Link href="https://www.bhphotovideo.com/c/product/1668624-REG/o_c_white_ulp_13_red_limited_edition_proboom_ultima.html/overview?ap=y&ap=y&smp=y&smp=y&lsft=BI%3A6879&gclid=CjwKCAiAtouOBhA6EiwA2nLKH8v1ksRPWxz8DV3uflYwV3HEsDqW930Nf2wOzWZL7tWptzQomu-ppRoC0hoQAvD_BwE">
                    O.C. White ProBoom Ultima Gen2 Ultralow-Profile Adjustable
                    Mic Boom
                  </Link>
                  {" - "}
                  While this is an expensive piece of equipment it is so much
                  better than my last one. This mic arm has no trouble holding
                  up heavy mics and very positionable.
                </li>
                <li>
                  <Link href="https://en-us.sennheiser.com/high-quality-headphones-around-ear-audio-surround-hd-650">
                    Sennheiser HD 650
                  </Link>
                </li>
                <li>
                  <Link href="https://www.schiit.com/products/magni-1">
                    Schiit Magni Heresy
                  </Link>
                  {" - "}
                  Pre-amp for headphones
                </li>
                <li>
                  <Link href="https://focusrite.com/en/usb-audio-interface/scarlett/scarlett-2i2">
                    Scarlett 2i2
                  </Link>
                  {" - "}
                  USB Interface (Hooks mic/headphones up to computer)
                </li>
              </Ul>
              <H3>Justin's Gear</H3>
              <Ul>
                <li>
                  <Link href="https://www.bluemic.com/en-us/products/yeti/">
                    Blue Yeti USB Mic
                  </Link>
                </li>
                <li>
                  <Link href="https://www.bluemic.com/en-us/products/compass/">
                    Yeti Compass Microphone Arm
                  </Link>
                </li>
              </Ul>
              <H2>Software</H2>
              <H3>Design</H3>
              <P>
                While we are developers by trade, we also like to flex our
                design skills when we can! All of the graphics for our podcast
                (cover, logos, video visuals) were made in{" "}
                <Link href="https://www.figma.com/">Figma</Link>. Our 3D logo
                was made in <Link href="https://spline.design">Spline</Link>.
              </P>
              <H3>Scheduling</H3>
              <P>
                Our podcast is mainly about the guests we feature. So we need a
                good easy tool that lets our potential guests find a spot where
                we are all available to record and episode. We went through a
                few different tools before settling on{" "}
                <Link href="https://savvycal.com">SavvyCal</Link> to schedule
                recordings.
              </P>
              <P>
                With SavvyCal all we need to do is send a link to the person
                we're trying to schedule. They get a calendar view were they can
                select a time where both the hosts are free. The meeting invite
                contains a link to our virtual recording studio (see below) so
                all we have to do is add the event to our calendar
              </P>
              <H3>Recording</H3>
              <P>
                <ColoredText color="blue">devtools.fm</ColoredText> is a remote
                podcast we need a way to record our podcasts that's easy for
                guests to join and gets us the best video and audio quality
                available. A zoom recording just won't do!
              </P>
              <P>
                Luckily there are a lot of solutions for this already. We went
                with a tool called{" "}
                <Link href="https://riverside.fm">Riverside</Link>. It enables
                use to record at the highest quality while still being easy to
                use and share with our guests.
              </P>
              <Blockquote>
                <b>Fun Fact:</b> Almost every guest on devtools.fm has asked us
                how Riverside works. Makes sense given they all also make tools!
              </Blockquote>
              <H3>Editing</H3>
              <P>
                Once a podcast has been recorded we edit it using{" "}
                <Link href="https://descript.com">Descript</Link>. Descript is a
                video editing tool where you first transcribe everything, then
                edit the transcript to edit the video. Editing this way is
                faster than traditional methods and it produces a transcript for
                all of our content. This makes our podcast much more accessible,
                searchable, and easier to share.
              </P>
              <Blockquote>
                <b>Fun Fact:</b> Andrew works at Descript and the creation of
                this podcast was in large part an exercise in{" "}
                <Link href="https://en.wikipedia.org/wiki/Eating_your_own_dog_food">
                  dogfooding
                </Link>
                .
              </Blockquote>
              <H3>Publishing</H3>
              <P>
                Podcasts can be published to a bunch of places and rely on
                creating and hosting an RSS feed of the podcast's episodes. We
                want the podcast everywhere it can be and that's a lot of work!
              </P>
              <P>
                To save us a bunch of time we use a tool called{" "}
                <Link href="https://www.buzzsprout.com">Buzzsprout</Link>. It
                hosts and creates the RSS feed for our podcast and also deals
                with listing our podcast on all major podcast directories. It
                also provide an aggregate view of our podcasts stats across all
                those directories making it easy to see how much our podcast is
                being downloaded day to day.
              </P>
              <P>
                We also publish our podcast to{" "}
                <Link href="https://www.youtube.com/channel/UCFsRlOn7gODgv6WUriLrzXg">
                  our YouTube channel
                </Link>
                .
              </P>
              <H3>Website</H3>
              <P>
                If you're not a developer you can use something to build your
                podcast's website for you.{" "}
                <Link href="https://www.buzzsprout.com">Buzzsprout</Link> will
                even do this for you. But since we're developers literally the
                first thing we did when we had the idea for devtools.fm was
                create this website.
              </P>
              <P>
                Each episode has an <Link href="https://mdxjs.com">MDX</Link>{" "}
                which is used to statically generate this website every time we
                add a new episode.
              </P>
              <Ul>
                <li>
                  <Link href="https://nextjs.org">Next.js</Link>
                </li>
                <li>
                  <Link href="https://tailwindcss.com">Tailwind</Link>
                </li>
                <li>
                  <Link href="https://github.com/intuit/devtools-ds">
                    Devtools DS
                  </Link>
                </li>
                <li>
                  <Link href="https://vercel.com">Vercel</Link>
                </li>
              </Ul>
              <P>
                For tracking website analytics we use{" "}
                <Link href="https://plausible.io/">Plausible</Link>.
              </P>
              <H3>Marketing</H3>
              <P>
                Getting you podcast in front of people is one of the hardest
                parts! We have experimented with some paid advertising but have
                found that good old fashioned viral interesting content is what
                works best to promote our podcast.
              </P>
              <P>
                To capture those viral moments we have social media accounts
                that we post 90-120s clips to throughout the week. To schedule
                these posts we use a tool called{" "}
                <Link href="https://later.com">Later</Link>. With later we can
                post to all of the platforms at the same time and customize the
                message that goes along with the video.
              </P>
              <P>
                While we are editing the podcast we are constantly on the look
                out for clips that might make good social videos. As we edit the
                podcast using <Link href="https://descript.com">Descript</Link>{" "}
                anything that could make a good video gets clipped into it's own
                "Composition" and then highlighted so that we know a clip
                already covers that content.s
              </P>
              <Ul>
                <li>
                  <Link href="https://www.tiktok.com/@devtools.fm">TikTok</Link>
                </li>
                <li>
                  <Link href="https://twitter.com/devtoolsfm">Twitter</Link>
                </li>
                <li>
                  <Link href="https://www.facebook.com/Devtoolsfm-103295305296154">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/company/74142607/">
                    LinkedIn
                  </Link>
                </li>
              </Ul>
              <hr className="my-12 border-gray-600" />
              Phew, that's it! Hopefully this helps you start your podcasting
              journey. If you have any questions feel free to tweet at us. And
              if you got any value out of this follow use wherever you consume
              podcasts!
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}
