// @flow
import chalk from 'chalk';
import { type Command } from './types';
import { fetchAction } from '../../actions';
import { VERSION_DELIMITER } from '../../constants';

const printComponents = components => components.map((component) => {
  const [name, version] = component.split(VERSION_DELIMITER);
  return `\t> ${name} - ${version || 'latest'}`;
}).join('\n');

const fetchCommand: Command = {
  name: 'fetch',
  description: 'fetch components and put them in components directory',
  arguments: [
    {
      name: '[ids...]',
      description: 'a list of component ids seperated by spaces',
    },
  ],
  action: args => fetchAction((args && args.ids) || []),
  report: components => chalk.underline('successfully fetched the following Bit components.\n')
  + chalk.cyan(printComponents(components)),
  loaderText: 'Fetching components',
  loader: true,
};

export default fetchCommand;
