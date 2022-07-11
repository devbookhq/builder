import {
  useState,
  useEffect,
} from 'react'
import {
  GetServerSideProps,
} from 'next'
import {
  supabaseServerClient,
} from '@supabase/supabase-auth-helpers/nextjs'

import type {
  PublishedCodeSnippet,
} from 'types'
import { showErrorNotif } from 'utils/notification'
import Title from 'components/typography/Title'
import CodeEditor from 'components/CodeEditor'
import ExecutionButton from 'components/ExecutionButton'
import useSession from 'utils/useSession'
import Output from 'components/Output'
import VerticalResizer from 'components/VerticalResizer'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.query.slug as string | undefined
  if (!slug) {
    return {
      notFound: true,
    }
  }
  const splits = slug.split('-')
  const id = splits[splits.length - 1]
  if (!id) {
    return {
      notFound: true,
    }
  }

  // Try to get a code snippet from the DB based on a ID in the slug.
  const { data, error } = await supabaseServerClient(ctx)
    .from<PublishedCodeSnippet>('published_code_snippets')
    .select('*')
    .eq('code_snippet_id', id)

  if (error) {
    return {
      props: {
        error: error.message,
      }
    }
  } else if (!data.length) {
    return {
      notFound: true,
    }
  }
  const publishedCS = data[0]

  // We fetch the code snippet based on the ID at the end of a slug.
  // User can change the prefix however they want but we fix it once the page loads.
  // Example:
  // Correct slug: /code-snippet-name-:someid
  // User goes to: /foobar-:someid
  const csSlug = `${publishedCS.title}-${publishedCS.code_snippet_id}`
  if (slug !== csSlug) {
    return {
      redirect: {
        destination: `/${csSlug}`,
      },
      props: {
        publishedCodeSnippet: publishedCS,
      },
    }
  }

  return {
    props: {
      publishedCodeSnippet: publishedCS,
    },
  }
}

interface Props {
  error?: string
  publishedCodeSnippet: PublishedCodeSnippet
}

function CodeSnippet({
  error,
  publishedCodeSnippet: pcs,
}: Props) {
  const [hostname, setHostname] = useState<string>()

  const {
    csOutput,
    csState,
    run,
    stop,
    getHostname,
    ports,
  } = useSession({
    codeSnippetID: pcs.code_snippet_id,
  })

  useEffect(function obtainHostname() {
    getHostname().then(h => {
      if (!h) return
      setHostname(h)
    })
  }, [getHostname])

  useEffect(function checkForError() {
    if (error) {
      showErrorNotif(`Error: ${error}`)
    }
  }, [error])

  function runCode() {
    run(pcs.code, pcs.env_vars)
  }

  function stopCode() {
    stop()
  }

  return (
    <div className="
      flex-1
      flex
      flex-col
      items-start
    ">
      <div className="
        flex
        flex-col
        items-start
        justify-start
        min-h-[48px]
        mb-6
      ">
        <Title
          title={pcs.title}
        />
      </div>

      <div className="
        w-full
        flex-1
        flex
        flex-col
        justify-center
        items-center
        space-y-4
      ">
        <ExecutionButton
          state={csState}
          onRunClick={runCode}
          onStopClick={stopCode}
        />
        <div className="
          h-full
          w-full
          flex-1
          flex
          flex-row
          items-start
          justify-start
          space-x-4
        ">
          <div className="
          flex
          flex-col
          items-start
          justify-start
        ">
            <Title
              size={Title.size.T2}
              title="Open ports"
            />
            {hostname && ports.map(p => (
              <a
                key={`${p.Ip}-${p.Port}`}
                href={`https://${p.Port}-${hostname}`}
                className="
              max-w-full
              text-green-500
              overflow-hidden
              truncate
              cursor-pointer
              underline
            "
              >
                {`:${p.Port}`}
              </a>
            ))}
          </div>

          <div className="
            h-full
            w-full
            flex-1
            flex
            flex-col
            rounded-lg
            overflow-hidden
            border
            border-black-700
          ">
            <VerticalResizer initHeight={400}>
              <div className="
                rounded-t-lg
                flex-1
                relative
                overflow-hidden
                bg-black-800
              ">
                <CodeEditor
                  isReadOnly
                  language={pcs.template}
                  content={pcs.code}
                  className="
                    absolute
                    inset-0
                  "
                />
              </div>
            </VerticalResizer>
            <div className="
                rounded-t-lg
                flex-1
                relative
                overflow-hidden
              ">
              <Output
                output={csOutput}
                className="
                absolute
                inset-0
              "
              />
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}

export default CodeSnippet