import { parse } from '@plist/plist';

const [, , ...args] = process.argv;
const fileName = args[0];

if (args.length !== 1 || !fileName) {
  console.error('Usage: bun run src/inspect.ts <file>');
  process.exit(1);
}

const input = await Bun.file(fileName).arrayBuffer();
const result = parse(input);

if (!result) {
  throw new Error('Failed to parse');
}

console.group('Keys');

Object.keys(result)
  .toSorted()
  .forEach((v) => {
    console.log(v);
  });

console.groupEnd();
