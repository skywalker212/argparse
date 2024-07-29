import {
    ArgumentParser,
    ArgumentParserError,
    ArgumentTypeError,
    UnknownArgumentError,
    MissingRequiredArgumentError,
    InvalidChoiceError,
    InvalidNargsError
} from '../src/argparse';

describe('ArgumentParser', () => {
    let parser: ArgumentParser;

    beforeEach(() => {
        parser = new ArgumentParser('Test parser');
    });

    test('parse simple string argument', () => {
        parser.addArgument(['--name'], { type: 'string' });
        const args = parser.parseArgs('--name John');
        expect(args).toEqual({ name: 'John' });
    });

    test('parse simple number argument', () => {
        parser.addArgument(['--age'], { type: 'number' });
        const args = parser.parseArgs('--age 30');
        expect(args).toEqual({ age: 30 });
    });

    test('parse boolean flag', () => {
        parser.addArgument(['--verbose'], { type: 'boolean' });
        const args = parser.parseArgs('--verbose');
        expect(args).toEqual({ verbose: true });
    });

    test('parse multiple arguments', () => {
        parser.addArgument(['--name'], { type: 'string' });
        parser.addArgument(['--age'], { type: 'number' });
        parser.addArgument(['--verbose'], { type: 'boolean' });
        const args = parser.parseArgs('--name Alice --age 25 --verbose');
        expect(args).toEqual({ name: 'Alice', age: 25, verbose: true });
    });

    test('parse short options', () => {
        parser.addArgument(['-n', '--name'], { type: 'string' });
        parser.addArgument(['-a', '--age'], { type: 'number' });
        parser.addArgument(['-v', '--verbose'], { type: 'boolean' });
        const args = parser.parseArgs('-n Bob -a 40 -v');
        expect(args).toEqual({ name: 'Bob', age: 40, verbose: true });
    });

    test('parse positional arguments', () => {
        parser.addArgument(['input']);
        parser.addArgument(['output']);
        const args = parser.parseArgs('file1.txt file2.txt');
        expect(args).toEqual({ input: 'file1.txt', output: 'file2.txt' });
    });

    test('handle default values', () => {
        parser.addArgument(['--name'], { type: 'string', default: 'Anonymous' });
        parser.addArgument(['--age'], { type: 'number', default: 0 });
        const args = parser.parseArgs('');
        expect(args).toEqual({ name: 'Anonymous', age: 0 });
    });

    test('handle nargs', () => {
        parser.addArgument(['--coords'], { type: 'number', nargs: 2 });
        const args = parser.parseArgs('--coords 10 20');
        expect(args).toEqual({ coords: [10, 20] });
    });

    test('handle nargs with "+"', () => {
        parser.addArgument(['--names'], { nargs: '+' });
        const args = parser.parseArgs('--names Alice Bob Charlie');
        expect(args).toEqual({ names: ['Alice', 'Bob', 'Charlie'] });
    });

    test('handle nargs with "*"', () => {
        parser.addArgument(['--names'], { nargs: '*' });
        const args = parser.parseArgs('--names');
        expect(args).toEqual({ names: [] });
    });

    test('handle nargs with "?"', () => {
        parser.addArgument(['--name'], { nargs: '?' });
        let args = parser.parseArgs('--name Alice');
        expect(args).toEqual({ name: 'Alice' });
        args = parser.parseArgs('');
        expect(args).toEqual({});
        args = parser.parseArgs('--name');
        expect(args).toEqual({});
    });

    test('parse positional arguments with nargs', () => {
        parser.addArgument(['input'], { nargs: 2 });
        parser.addArgument(['output']);
        const args = parser.parseArgs('file1.txt file2.txt file3.txt');
        expect(args).toEqual({ input: ['file1.txt', 'file2.txt'], output: 'file3.txt' });
    });

    test('handle dest option', () => {
        parser.addArgument(['--name'], { dest: 'username' });
        const args = parser.parseArgs('--name John');
        expect(args).toEqual({ username: 'John' });
    });

    test('formatHelp output', () => {
        parser.addArgument(['input'], { help: 'Input file' });
        parser.addArgument(['--verbose'], { help: 'Increase output verbosity' });
        const helpText = parser.formatHelp();
        expect(helpText).toContain('Input file');
        expect(helpText).toContain('Increase output verbosity');
    });

    test('throw UnknownArgumentError for unknown option', () => {
        parser.addArgument(['--known']);
        expect(() => parser.parseArgs('--unknown')).toThrow(UnknownArgumentError);
    });

    test('throw ArgumentTypeError for invalid type conversion', () => {
        parser.addArgument(['--age'], { type: 'number' });
        expect(() => parser.parseArgs('--age not-a-number')).toThrow(ArgumentTypeError);
    });

    test('throw MissingRequiredArgumentError for missing required argument', () => {
        parser.addArgument(['--required'], { required: true });
        expect(() => parser.parseArgs('')).toThrow(MissingRequiredArgumentError);
    });

    test('throw InvalidChoiceError for invalid choice', () => {
        parser.addArgument(['--color'], { choices: ['red', 'green', 'blue'] });
        expect(() => parser.parseArgs('--color yellow')).toThrow(InvalidChoiceError);
    });

    test('throw InvalidNargsError for incorrect number of values', () => {
        parser.addArgument(['--coords'], { nargs: 2 });
        expect(() => parser.parseArgs('--coords 1')).toThrow(InvalidNargsError);
    });
});