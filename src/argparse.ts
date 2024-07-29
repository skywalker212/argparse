class ArgumentParserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ArgumentParserError';
    }
}

class ArgumentTypeError extends ArgumentParserError {
    constructor(argName: string, expectedType: string, receivedValue: any) {
        super(`Argument ${argName} expected ${expectedType}, but received ${JSON.stringify(receivedValue)}`);
        this.name = 'ArgumentTypeError';
    }
}

class UnknownArgumentError extends ArgumentParserError {
    constructor(argName: string) {
        super(`Unknown argument: ${argName}`);
        this.name = 'UnknownArgumentError';
    }
}

class MissingRequiredArgumentError extends ArgumentParserError {
    constructor(argName: string) {
        super(`Required argument ${argName} is missing`);
        this.name = 'MissingRequiredArgumentError';
    }
}

class InvalidChoiceError extends ArgumentParserError {
    constructor(argName: string, value: any, choices: any[]) {
        super(`Invalid choice for ${argName}: ${JSON.stringify(value)}. (choose from ${choices.map(c => JSON.stringify(c)).join(', ')})`);
        this.name = 'InvalidChoiceError';
    }
}

class InvalidNargsError extends ArgumentParserError {
    constructor(argName: string, expected: number | string, received: number) {
        super(`Argument ${argName} expected ${expected} value(s), but received ${received}`);
        this.name = 'InvalidNargsError';
    }
}

type ArgumentType = 'string' | 'number' | 'boolean';
type NargsOption = number | '?' | '*' | '+';

interface ArgumentOptions {
    type?: ArgumentType;
    default?: any;
    nargs?: NargsOption;
    choices?: any[];
    required?: boolean;
    help?: string;
    metavar?: string;
    dest?: string;
    flags: string[];
}

class ArgumentParser {
    private arguments: Map<string, ArgumentOptions> = new Map();
    private parsedArgs: Record<string, any> = {};
    private positionalArgs: ArgumentOptions[] = [];

    constructor(private description: string = '') { }

    addArgument(flags: string[], options: Partial<ArgumentOptions> = {}): ArgumentParser {
        this.validateArgumentOptions(options as ArgumentOptions);
        const name = flags[flags.length - 1].replace(/^-+/, '');
        const fullOptions: ArgumentOptions = { ...options, flags };

        if (flags[0].startsWith('-')) {
            this.arguments.set(name, fullOptions);
        } else {
            this.positionalArgs.push(fullOptions);
        }

        return this;
    }

    private parseArg(arg: string, index: number, args: string[]): number {
        if (arg.startsWith('--')) {
            return this.parseLongOption(arg, index, args);
        } else if (arg.startsWith('-')) {
            return this.parseShortOption(arg, index, args);
        } else {
            this.parsePositional(arg);
            return index;
        }
    }

    private parseLongOption(arg: string, index: number, args: string[]): number {
        const [name, value] = arg.slice(2).split('=');
        const option = this.arguments.get(name);
        if (!option) {
            throw new UnknownArgumentError(arg);
        }

        return this.handleOption(name, option, value, index, args);
    }

    private parseShortOption(arg: string, index: number, args: string[]): number {
        const chars = arg.slice(1).split('');
        let lastIndex = index;
        for (const char of chars) {
            const option = Array.from(this.arguments.entries()).find(([, opt]) => opt.flags.includes(`-${char}`));
            if (!option) {
                throw new UnknownArgumentError(`-${char}`);
            }

            const [name, opt] = option;
            lastIndex = this.handleOption(name, opt, undefined, lastIndex, args);
        }
        return lastIndex;
    }

    private handleOption(name: string, option: ArgumentOptions, value: string | undefined, index: number, args: string[]): number {
        const dest = option.dest || name;
        if (option.type === 'boolean') {
            this.parsedArgs[dest] = true;
            return index;
        }

        const nargs = option.nargs === undefined ? 1 : option.nargs;
        const values = this.collectValues(value, index, args, nargs);

        if (nargs === '?' && values.length === 0) {
            return index;
        }

        this.parsedArgs[dest] = this.parseValues(values, option, name);
        return index + (value === undefined ? values.length : 0);
    }

    private collectValues(value: string | undefined, index: number, args: string[], nargs: NargsOption): string[] {
        if (value !== undefined) return [value];

        const values: string[] = [];
        const remaining = args.slice(index + 1);
        const count = typeof nargs === 'number' ? nargs : (nargs === '+' ? 1 : 0);

        for (const arg of remaining) {
            if (arg.startsWith('-') && (values.length >= count || nargs === '?')) break;
            values.push(arg);
            if (nargs !== '*' && nargs !== '+' && values.length === count) break;
        }

        if (typeof nargs === 'number' && values.length !== nargs) {
            throw new InvalidNargsError(args[index], nargs, values.length);
        }

        if (nargs === '+' && values.length === 0) {
            throw new InvalidNargsError(args[index], 'at least one', 0);
        }

        return values;
    }

    private parseValues(values: string[], option: ArgumentOptions, name: string): any {
        const parsed = values.map(value => this.parseValue(value, option, name));
        if (option.nargs === undefined || option.nargs === '?') {
            return parsed[0];
        }
        return parsed;
    }

    private parseValue(value: string, option: ArgumentOptions, name: string): any {
        let parsed: any;
        switch (option.type) {
            case 'number':
                parsed = Number(value);
                if (isNaN(parsed)) throw new ArgumentTypeError(name, 'number', value);
                break;
            case 'boolean':
                if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
                    throw new ArgumentTypeError(name, 'boolean', value);
                }
                parsed = value.toLowerCase() === 'true';
                break;
            default:
                parsed = value;
        }

        if (option.choices && !option.choices.includes(parsed)) {
            throw new InvalidChoiceError(name, parsed, option.choices);
        }

        return parsed;
    }

    private parsePositional(arg: string) {
        const option = this.positionalArgs[0];
        if (!option) {
            throw new UnknownArgumentError(arg);
        }

        const dest = option.dest || option.flags[0];
        const parsedValue = this.parseValue(arg, option, dest);

        if (option.nargs === undefined) {
            this.parsedArgs[dest] = parsedValue;
            this.positionalArgs.shift();
        } else {
            if (!this.parsedArgs[dest]) {
                this.parsedArgs[dest] = [];
            }
            this.parsedArgs[dest].push(parsedValue);

            if (typeof option.nargs === 'number' && this.parsedArgs[dest].length === option.nargs) {
                this.positionalArgs.shift();
            }
        }
    }

    parseArgs(argsString: string): Record<string, any> {
        const args = this.tokenize(argsString);
        for (let i = 0; i < args.length; i++) {
            i = this.parseArg(args[i], i, args);
        }

        this.setDefaults();
        this.validateRequired();

        return this.parsedArgs;
    }

    private tokenize(argsString: string): string[] {
        return argsString.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    }

    private setDefaults() {
        for (const [name, opt] of this.arguments.entries()) {
            const dest = opt.dest || name;
            if (opt.default !== undefined && this.parsedArgs[dest] === undefined) {
                this.parsedArgs[dest] = opt.default;
            }
        }
        for (const opt of this.positionalArgs) {
            const dest = opt.dest || opt.flags[0];
            if (opt.default !== undefined && this.parsedArgs[dest] === undefined) {
                this.parsedArgs[dest] = opt.default;
            }
        }
    }

    private validateArgumentOptions(options: ArgumentOptions): void {
        if (options.type && !['string', 'number', 'boolean'].includes(options.type)) {
            throw new ArgumentParserError(`Invalid argument type: ${options.type}`);
        }
        if (options.nargs !== undefined &&
            (typeof options.nargs !== 'number' && !['?', '*', '+'].includes(options.nargs))) {
            throw new ArgumentParserError(`Invalid nargs option: ${options.nargs}`);
        }
        if (options.choices && !Array.isArray(options.choices)) {
            throw new ArgumentParserError('Choices must be an array');
        }
        if (options.required && options.default !== undefined) {
            throw new ArgumentParserError('Cannot set both required and default for an argument');
        }
    }

    private validateRequired() {
        for (const [name, opt] of this.arguments.entries()) {
            const dest = opt.dest || name;
            if (opt.required && this.parsedArgs[dest] === undefined) {
                throw new MissingRequiredArgumentError(name);
            }
        }
        for (const opt of this.positionalArgs) {
            const dest = opt.dest || opt.flags[0];
            if (opt.required && this.parsedArgs[dest] === undefined) {
                throw new MissingRequiredArgumentError(opt.flags[0]);
            }
        }
    }

    formatHelp(): string {
        let help = `${this.description}\n\n`;
        help += 'positional arguments:\n';
        for (const arg of this.positionalArgs) {
            help += this.formatArgHelp(arg);
        }
        help += '\noptions:\n';
        for (const [, arg] of this.arguments) {
            help += this.formatArgHelp(arg);
        }
        return help;
    }

    private formatArgHelp(arg: ArgumentOptions): string {
        const metavar = arg.metavar || arg.dest || arg.flags[arg.flags.length - 1].replace(/^-+/, '');
        const flags = arg.flags.join(', ');
        const help = arg.help || '';
        return `  ${flags} ${metavar}    ${help}\n`;
    }
}

export { ArgumentParser, ArgumentOptions, ArgumentParserError, ArgumentTypeError, UnknownArgumentError, MissingRequiredArgumentError, InvalidChoiceError, InvalidNargsError };