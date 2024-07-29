import * as argparse from '../src/index';

describe('index exports', () => {
    test('should export ArgumentParser', () => {
        expect(argparse.ArgumentParser).toBeDefined();
    });

    test('should export all error types', () => {
        expect(argparse.ArgumentParserError).toBeDefined();
        expect(argparse.ArgumentTypeError).toBeDefined();
        expect(argparse.UnknownArgumentError).toBeDefined();
        expect(argparse.MissingRequiredArgumentError).toBeDefined();
        expect(argparse.InvalidChoiceError).toBeDefined();
        expect(argparse.InvalidNargsError).toBeDefined();
    });
});