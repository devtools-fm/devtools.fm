import Head from 'next/head'
import {
  chrome,
  firefox,
  useTheme,
  Theme,
  ColorScheme,
} from '@devtools-ds/themes'
import {
  ConsoleIcon,
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
} from '@devtools-ds/icon'
import { Navigation } from '@devtools-ds/navigation'
import { ObjectInspector } from '@devtools-ds/object-inspector'

type ColoredTextColors = 'blue' | 'purple'

const coloredTextTheme: Record<
  Theme,
  Record<ColorScheme, Record<ColoredTextColors, string>>
> = {
  chrome: {
    light: {
      blue: chrome.light.blue03,
      purple: chrome.light.purple03,
    },
    dark: {
      blue: chrome.dark.blue02,
      purple: chrome.dark.purple02,
    },
  },
  firefox: {
    light: {
      blue: firefox.light.blue03,
      purple: firefox.light.pink01,
    },
    dark: {
      blue: firefox.dark.blue03,
      purple: firefox.dark.pink02,
    },
  },
}

const ColoredText = (props: {
  children: React.ReactNode
  color: 'blue' | 'purple'
}) => {
  const { currentColorScheme, currentTheme } = useTheme({})
  const color = coloredTextTheme[currentTheme][currentColorScheme][props.color]

  return (
    <span className="font-semibold" style={{ color }}>
      {props.children}
    </span>
  )
}

const FooterLink = (
  props: Omit<React.ComponentProps<'a'>, 'target' | 'rel' | 'className'>
) => {
  return <a {...props} target="_blank" rel="noopener" className="underline" />
}

interface HostData {
  twitter: string
  github: string
  location: string
  employer: string
  [key: string]: unknown
}

interface HostProps {
  name: string
  data: HostData
}

const Host = ({ name, data }: HostProps) => {
  const { currentColorScheme, currentTheme } = useTheme({})

  return (
    <div>
      <h3 className="mb-2">
        <a
          target="_blank"
          rel="noopener"
          href={data.twitter}
          className="hover:underline"
          style={{
            color: coloredTextTheme[currentTheme][currentColorScheme].blue,
          }}
        >
          {name}
        </a>
      </h3>
      <ObjectInspector data={data} />
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-6">
      <Head>
        <title>devtools.fm</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col flex-1">
        <div className="mt-10 mb-12">
          <div className="flex justify-center mb-10">
            <h1 className=" bg-[#881180] py-4 px-6 w-[fit-content] rounded-xl">
              <span
                className="flex items-center space-x-4 w-[fit-content] rounded-xl !text-black"
                style={{ filter: 'invert()' }}
              >
                <ConsoleIcon
                  height="0"
                  width="0"
                  className="!w-12 md:!w-[60px] !h-12 md:!h-[60px] fill-current"
                />
                <span className="font-bold text-3xl md:text-5xl">
                  devtools.fm
                </span>
              </span>
            </h1>
          </div>

          <p className="text-lg text-center">
            A podcast about{' '}
            <ColoredText color="purple">developer tools</ColoredText> and the{' '}
            <ColoredText color="blue">people</ColoredText> who make them.
          </p>
        </div>

        <Navigation>
          <Navigation.Controls>
            <Navigation.TabList>
              <Navigation.Tab id="about" icon={<InfoIcon inline />}>
                About
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<DataIcon inline />}>
                Episodes
              </Navigation.Tab>
            </Navigation.TabList>

            <Navigation.Right>
              <Navigation.Button
                icon={<NewWindowIcon inline />}
                aria-label="New Window"
              />

              <Navigation.Divider />
              <Navigation.Button
                icon={<MoreInfoIcon inline />}
                aria-label="More settings"
              />
            </Navigation.Right>
          </Navigation.Controls>
          <Navigation.Panels>
            <Navigation.Panel className="pt-4 md:pt-6">
              <p
                className="mb-6 md:mb-10"
                style={{
                  fontFamily:
                    "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, Arial, sans-serif",
                }}
              >
                No matter what type of code you write, you're going to be
                dealing with developer tools. This podcast will explore the
                bleeding edge of modern developer tooling all up and down the
                stack. Come learn with us as we talk with industry leaders and
                taste-makers from all of the programming world.
              </p>

              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Hosts</h2>

              <div className="space-y-4 md:space-y-6">
                <Host
                  name="Andrew Lisowski"
                  data={{
                    description:
                      'A front-end dev with a passion for ergonomic developer tools, buttery smooth UX, and open source..',
                    twitter: 'https://twitter.com/hipstersmoothie',
                    github: 'https://github.com/hipstersmoothie',
                    location: 'San Diego, CA',
                    employer: 'Descript',
                    pets: [
                      { type: 'dog', name: 'Bonsai' },
                      { type: 'dog', name: 'Fred' },
                    ],
                  }}
                />
                <Host
                  name="Justin Bennett"
                  data={{
                    description:
                      'An engineer who loves building tools and thinking about ways to make tech more human',
                    twitter: 'https://twitter.com/Zephraph',
                    github: 'https://github.com/Zephraph',
                    site: 'https://just-be.dev',
                    location: 'Brooklyn, NY',
                    employer: 'Artsy',
                    pets: [{ type: 'dog', name: 'API' }],
                  }}
                />
              </div>
            </Navigation.Panel>
            <Navigation.Panel className="pt-4 md:pt-6">
              Work in progress...
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </main>

      <footer className="text-center mb-12 md:mb-16">
        <p className="mb-6">
          Copyright © 2020{' '}
          <FooterLink href="https://twitter.com/hipstersmoothie">
            Andrew Lisowski
          </FooterLink>
          .{' '}
        </p>

        <p className="text-sm">
          Built with <FooterLink href="https://nextjs.org">Next.js</FooterLink>{' '}
          and{' '}
          <FooterLink href="https://tailwindcss.com">tailwindcss</FooterLink>.
          Hosted on <FooterLink href="https://vercel.com">Vercel</FooterLink>{' '}
          and the source code is on{' '}
          <FooterLink href="https://github.com/devtools-fm/devtools.fm">
            GitHub
          </FooterLink>
          .
        </p>
      </footer>
    </div>
  )
}
