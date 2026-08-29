"use client";

import { Navigation } from "@devtools-ds/navigation";
import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { NavigationTopBar } from "components/NavigationTopBar";
import { H1, HR, Link, P } from "components/system";
import { Label } from "components/label";
import { Input } from "components/input";
import { Textarea } from "components/textarea";
import { Button } from "components/button";

export function GuestsClient() {
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
              <H1>Guest Application</H1>
              <P>
                Do you work on a developer tool? Do you want to share your
                story? We'd love to have you on the show!
              </P>
              <P>
                This page contains a form to apply to be a guest on the show. If
                you're already scheduled to be a guest head over to the{" "}
                <Link href="/guest-info">guest info page</Link> for information
                on how to prepare for the episode.
              </P>
              <HR />

              <form
                action="/api/submit-guest-application"
                method="post"
                className="flex flex-col gap-6"
              >
                <label className="flex flex-col gap-4">
                  <Label>Name</Label>
                  <Input name="name" required />
                </label>
                <label className="flex flex-col gap-4">
                  <Label>Email</Label>
                  <Input name="email" type="email" required />
                </label>
                <label className="flex flex-col gap-4">
                  <Label>Twitter</Label>
                  <Input name="twitter" type="url" />
                </label>
                <label className="flex flex-col gap-4">
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    required
                    placeholder="Links to social, tools, and a description of why you should be a guest."
                  />
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