// @flow
import chalk from 'chalk';
import { type Command } from './types';
import { bindAction } from '../../actions';

const printComponents = components => Object.keys(components)
  .map(component => `${component} => ${components[component]}`).join('\n');

const bindCommand: Command = {
  name: 'bind',
  description: 'create the bit module inside of node_modules and generate relevant links',
  action: () => bindAction(),
  report: components => `Bound ${chalk.bold(Object.keys(components).length)} components:
${chalk.green(printComponents(components))}`,
  loader: true,
};

export default bindCommand;
