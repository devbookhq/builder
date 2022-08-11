import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Terminal as XTermTerminal } from 'xterm'
import {
  TerminalManager,
  TerminalSession,
  ChildProcess,
} from '@devbookhq/sdk'

export interface Opts {
  terminalManager?: TerminalManager
}

function useTerminal({
  terminalManager,
}: Opts) {
  const [terminal, setTerminal] = useState<XTermTerminal>()
  const [terminalSession, setTerminalSession] = useState<TerminalSession>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [childProcesses, setChildProcesss] = useState<ChildProcess[]>([])
  const [runningProcessCmd, setRunningProcessCmd] = useState<string>()

  useEffect(function initialize() {
    async function init() {
      if (!terminalManager) return

      setIsLoading(true)
      const xterm = await import('xterm')

      const term = new xterm.Terminal({
        bellStyle: 'none',
        cursorStyle: 'block',
        fontSize: 13,
        theme: {
          background: '#1A191D',
          foreground: '#E9E9E9',
          cursor: '#E9E9E9',
        },
      })

      try {
        const session = await terminalManager.createSession(
          (data) => term.write(data),
          setChildProcesss,
          { cols: term.cols, rows: term.rows },
        )

        term.onData((data) => session.sendData(data))
        term.onResize((size) => session.resize(size))

        setTerminal(term)
        setTerminalSession(session)
        setError(undefined)
        setIsLoading(false)

        return () => {
          term.dispose()
          session.destroy()
          setTerminal(undefined)
        }
      } catch (err: any) {
        console.error(err.message)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    const disposePromise = init()

    return () => {
      setChildProcesss([])
      disposePromise.then((dispose) => dispose?.())
    }
  }, [terminalManager])

  const runningProcessID = runningProcessCmd
    ? childProcesses.find(p => runningProcessCmd.startsWith(p.cmd))?.pid
    : undefined

  const runCmd = useCallback(async (cmd: string) => {
    await terminalSession?.sendData('\x0C' + cmd + '\n')

    setRunningProcessCmd(cmd)
  }, [terminalSession])

  const stopCmd = useCallback(() => {
    if (!runningProcessID) return

    terminalManager?.killProcess(runningProcessID)
  }, [
    runningProcessID,
    terminalManager,
  ])

  return useMemo(() => ({
    terminal,
    terminalSession,
    error,
    isLoading,
    stopCmd,
    isCmdRunning: !!runningProcessID,
    runCmd,
    childProcesses,
  }), [
    terminal,
    childProcesses,
    isLoading,
    error,
    runningProcessID,
    stopCmd,
    runCmd,
    terminalSession,
  ])
}

export default useTerminal
