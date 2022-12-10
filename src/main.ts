import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    // prepare
    await exec.exec(
      'dart pub global activate -sgit https://github.com/rrousselGit/riverpod.git --git-path packages/riverpod_graph'
    )

    // execute
    let outputs = ''
    const workingDirectory = path.resolve(
      process.env.GITHUB_WORKSPACE ?? '',
      core.getInput('working-directory', {required: true})
    )
    const options: exec.ExecOptions = {cwd: workingDirectory}

    options.listeners = {
      stdout: data => {
        outputs += data.toString()
      }
    }
    await exec.exec(
      'dart pub global run riverpod_graph:riverpod_graph $GITHUB_WORKSPACE > raw_output.md',
      [],
      options
    )

    const lines = outputs.trim().split(/\r?\n/)
    for (const line of lines) {
      core.debug(line)
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
