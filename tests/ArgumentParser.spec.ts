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
        parser = new ArgumentParser('test', 'Test parser');
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

    test('handle boolean type conversion', () => {
        parser.addArgument(['--flag'], { type: 'boolean' });
        expect(parser.parseArgs('--flag')).toEqual({ flag: true });
        expect(parser.parseArgs('--flag true')).toEqual({ flag: true });
        expect(parser.parseArgs('--flag false')).toEqual({ flag: false });
        expect(() => parser.parseArgs('--flag invalid')).toThrow(UnknownArgumentError);
    });

    test('handle boolean flag followed by positional argument', () => {
        parser.addArgument(['--flag'], { type: 'boolean' });
        parser.addArgument(['pos']);
        expect(parser.parseArgs('--flag true positional')).toEqual({ flag: true, pos: 'positional' });
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

    test('handle combined short options with value', () => {
        parser.addArgument(['-a'], { type: 'boolean' });
        parser.addArgument(['-b'], { type: 'string' });
        const args = parser.parseArgs('-ab value');
        expect(args).toEqual({ a: true, b: 'value' });
    });

    test('parse positional arguments', () => {
        parser.addArgument(['input']);
        parser.addArgument(['output']);
        const args = parser.parseArgs('file1.txt file2.txt');
        expect(args).toEqual({ input: 'file1.txt', output: 'file2.txt' });
    });

    test('throw error for missing required positional arguments', () => {
        parser.addArgument(['required'], { required: true });
        expect(() => parser.parseArgs('')).toThrow(MissingRequiredArgumentError);
    });

    test('throw error for unknown positional arguments', () => {
        parser.addArgument(['known']);
        expect(() => parser.parseArgs('known unknown')).toThrow(UnknownArgumentError);
    });

    test('handle default values', () => {
        parser.addArgument(['--name'], { type: 'string', default: 'Anonymous' });
        parser.addArgument(['--age'], { type: 'number', default: 0 });
        parser.addArgument(['file'], { type: 'string', default: 'file.txt'});
        const args = parser.parseArgs('');
        expect(args).toEqual({ name: 'Anonymous', age: 0, file: 'file.txt' });
    });

    test('handle --key=value syntax', () => {
        parser.addArgument(['--name'], { type: 'string' });
        const args = parser.parseArgs('--name=John');
        expect(args).toEqual({ name: 'John' });
    });

    test('handle --key=value syntax with spaces', () => {
        parser.addArgument(['--name'], { type: 'string' });
        const args = parser.parseArgs('--name="John Doe"');
        expect(args).toEqual({ name: 'John Doe' });
    });

    test('handle --key=value syntax with quotes', () => {
        parser.addArgument(['--message'], { type: 'string' });
        let args = parser.parseArgs('--message="Hello, \\"World\\""');
        expect(args).toEqual({ message: 'Hello, "World"' });
        args = parser.parseArgs("--message='Hello, \"World\"'");
        expect(args).toEqual({ message: "Hello, \"World\"" });
    });

    test('handle mixed --key value and --key=value syntax', () => {
        parser.addArgument(['--name'], { type: 'string' });
        parser.addArgument(['--age'], { type: 'number' });
        const args = parser.parseArgs('--name=John --age 30');
        expect(args).toEqual({ name: 'John', age: 30 });
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

    test('throw error for nargs "+" with no values', () => {
        parser.addArgument(['--nums'], { nargs: '+', type: 'number' });
        expect(() => parser.parseArgs('--nums')).toThrow(InvalidNargsError);
    });

    test('handle nargs with "*"', () => {
        parser.addArgument(['--names'], { nargs: '*' });
        let args = parser.parseArgs('--names');
        expect(args).toEqual({ names: [] });
        args = parser.parseArgs('--names Alice Bob');
        expect(args).toEqual({ names: ['Alice', 'Bob'] });
        args = parser.parseArgs('');
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

    test('usage output', () => {
        parser.addArgument(['input'], { help: 'Input file' });
        parser.addArgument(['--verbose'], { help: 'Increase output verbosity' });
        const usageText = parser.usage();
        expect(usageText).toContain('Input file');
        expect(usageText).toContain('Increase output verbosity');
    });

    test('parse mixed positional and optional arguments', () => {
        parser.addArgument(['input']);
        parser.addArgument(['--verbose'], { type: 'boolean' });
        parser.addArgument(['output']);
        const args = parser.parseArgs('file1.txt --verbose file2.txt');
        expect(args).toEqual({ input: 'file1.txt', verbose: true, output: 'file2.txt' });
    });

    test('handle multiple boolean flags', () => {
        parser.addArgument(['-v', '--verbose'], { type: 'boolean' });
        parser.addArgument(['-q', '--quiet'], { type: 'boolean' });
        const args = parser.parseArgs('-v -q');
        expect(args).toEqual({ verbose: true, quiet: true });
    });

    test('handle combined short options', () => {
        parser.addArgument(['-v', '--verbose'], { type: 'boolean' });
        parser.addArgument(['-n', '--name'], { type: 'string' });
        const args = parser.parseArgs('-vn John');
        expect(args).toEqual({ verbose: true, name: 'John' });
    });

    test('handle arguments with spaces', () => {
        parser.addArgument(['--name'], { type: 'string' });
        const args = parser.parseArgs('--name "John Doe"');
        expect(args).toEqual({ name: 'John Doe' });
    });

    test('handle arguments with quotes', () => {
        parser.addArgument(['--message'], { type: 'string' });
        const args = parser.parseArgs('--message "Hello, \\"World\\""');
        expect(args).toEqual({ message: 'Hello, "World"' });
    });

    test('handle single quotes', () => {
        parser.addArgument(['--message'], { type: 'string' });
        const args = parser.parseArgs("--message 'Hello, World'");
        expect(args).toEqual({ message: 'Hello, World' });
    });

    test('handle mixed quotes', () => {
        parser.addArgument(['--message'], { type: 'string' });
        const args = parser.parseArgs('--message "Hello, \'World\'"');
        expect(args).toEqual({ message: "Hello, 'World'" });
    });

    test('handle escaped single quotes', () => {
        parser.addArgument(['--message'], { type: 'string' });
        const args = parser.parseArgs("--message 'Hello, \\'World\\''");
        expect(args).toEqual({ message: "Hello, 'World'" });
    });

    test('handle unquoted arguments with spaces', () => {
        parser.addArgument(['pos1']);
        parser.addArgument(['pos2']);
        const args = parser.parseArgs('Hello World');
        expect(args).toEqual({ pos1: 'Hello', pos2: 'World' });
    });

    test('handle multiple occurrences of the same argument', () => {
        parser.addArgument(['--num'], { type: 'number' });
        const args = parser.parseArgs('--num 1 --num 2 --num 3');
        expect(args).toEqual({ num: 3 });
    });

    test('handle nargs with default value', () => {
        parser.addArgument(['--coords'], { nargs: 2, type: 'number', default: [0, 0] });
        let args = parser.parseArgs('');
        expect(args).toEqual({ coords: [0, 0] });
        args = parser.parseArgs('--coords 10 20');
        expect(args).toEqual({ coords: [10, 20] });
    });

    test('handle choices with different types', () => {
        parser.addArgument(['--value'], { choices: ['a', 1, true] });
        let args = parser.parseArgs('--value a');
        expect(args).toEqual({ value: 'a' });
        args = parser.parseArgs('--value 1');
        expect(args).toEqual({ value: 1 });
        args = parser.parseArgs('--value true');
        expect(args).toEqual({ value: true });
    });

    test('handle required argument with nargs', () => {
        parser.addArgument(['--required'], { required: true, nargs: 2 });
        expect(() => parser.parseArgs('')).toThrow(MissingRequiredArgumentError);
        const args = parser.parseArgs('--required value1 value2');
        expect(args).toEqual({ required: ['value1', 'value2'] });
    });

    test('handle optional arguments before positional', () => {
        parser.addArgument(['--opt'], { type: 'string' });
        parser.addArgument(['pos']);
        const args = parser.parseArgs('--opt value positional');
        expect(args).toEqual({ opt: 'value', pos: 'positional' });
    });

    test('handle nargs "?" with default', () => {
        parser.addArgument(['--opt'], { nargs: '?', default: 'default' });
        let args = parser.parseArgs('');
        expect(args).toEqual({ opt: 'default' });
        args = parser.parseArgs('--opt');
        expect(args).toEqual({ opt: 'default' });
        args = parser.parseArgs('--opt value');
        expect(args).toEqual({ opt: 'value' });
    });

    test('handle nargs "*" with default', () => {
        parser.addArgument(['--opt'], { nargs: '*', default: ['default'] });
        let args = parser.parseArgs('');
        expect(args).toEqual({ opt: ['default'] });
        args = parser.parseArgs('--opt');
        expect(args).toEqual({ opt: [] });
        args = parser.parseArgs('--opt value1 value2');
        expect(args).toEqual({ opt: ['value1', 'value2'] });
    });

    test('handle multiple positional arguments with nargs', () => {
        parser.addArgument(['pos1'], { nargs: 2 });
        parser.addArgument(['pos2'], { nargs: '+' });
        const args = parser.parseArgs('a b c d e');
        expect(args).toEqual({ pos1: ['a', 'b'], pos2: ['c', 'd', 'e'] });
    });

    test('handle arguments with metavar', () => {
        parser.addArgument(['--age'], { metavar: 'YEARS' });
        const usageText = parser.usage();
        expect(usageText).toContain('--age YEARS');
    });

    test('throw UnknownArgumentError for unknown option', () => {
        parser.addArgument(['--known']);
        expect(() => parser.parseArgs('--unknown')).toThrow(UnknownArgumentError);
        expect(() => parser.parseArgs('-u')).toThrow(UnknownArgumentError);
    });

    test('throw ArgumentTypeError for invalid type conversion', () => {
        parser.addArgument(['--age'], { type: 'number' });
        expect(() => parser.parseArgs('--age not-a-number')).toThrow(ArgumentTypeError);
    });

    test('throw error for invalid argument options', () => {
        expect(() => parser.addArgument(['--invalid'], { type: 'invalid' as any })).toThrow(ArgumentParserError);
        expect(() => parser.addArgument(['--invalid'], { nargs: 'invalid' as any })).toThrow(ArgumentParserError);
        expect(() => parser.addArgument(['--invalid'], { choices: 'not an array' as any })).toThrow(ArgumentParserError);
        expect(() => parser.addArgument(['--invalid'], { required: true, default: 'value' })).toThrow(ArgumentParserError);
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
        expect(() => parser.parseArgs('--coords 1')).toThrow();
    });
InvalidNargsError});