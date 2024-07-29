# js-argparse

A lightweight, client-side JavaScript port of Python's argparse library. This library allows you to parse command-line-style arguments in the browser or any JavaScript environment.

## Installation

You can install js-argparse using npm:

```bash
npm install js-argparse
```

## Usage

### Basic Example

```javascript
import { ArgumentParser } from 'js-argparse';

const parser = new ArgumentParser('My program description');
parser.addArgument(['-f', '--foo'], { help: 'foo bar' });
parser.addArgument(['--bar'], { help: 'bar foo' });
parser.addArgument('positional', { help: 'positional argument' });

const args = parser.parseArgs('--foo 1 --bar hello positional_value');
console.log(args);
// Output: { foo: '1', bar: 'hello', positional: 'positional_value' }
```

### Adding Arguments

Use the `addArgument` method to define arguments. The first parameter is an array of flags (for optional arguments) or a string (for positional arguments). The second parameter is an options object.

```javascript
parser.addArgument(['-v', '--verbose'], { 
  help: 'increase verbosity',
  type: 'boolean'
});
parser.addArgument(['--port'], { 
  help: 'port number', 
  type: 'number', 
  default: 8080 
});
parser.addArgument(['file'], { 
  help: 'input file', 
  nargs: '+' 
});
```

### Argument Options

The `addArgument` method accepts an options object as its second parameter. Here are the available options and their default values:

- `type`: The type to convert the argument to ('string', 'number', or 'boolean'). Default: 'string'.
- `default`: The default value if the argument is not provided. Default: undefined.
- `nargs`: The number of arguments to consume (a number, '?', '*', or '+'). Default: undefined (which means 1 for optional arguments, and 1 for positional arguments unless it's the final argument, in which case it will consume all remaining arguments).
- `choices`: An array of valid choices for the argument. Default: undefined (any value is allowed).
- `required`: Whether the argument is required (true or false). Default: false for optional arguments, true for positional arguments.
- `help`: A description of the argument for help text. Default: undefined.
- `metavar`: A name for the argument in usage messages. Default: The argument name in uppercase.
- `dest`: The name of the attribute to be added to the object returned by parseArgs(). Default: The longest flag name without the leading dashes, or the positional argument name.

Here's an example demonstrating the usage of these options:

```javascript
parser.addArgument(['-v', '--verbose'], { 
  type: 'boolean',
  help: 'increase output verbosity',
  default: false
});

parser.addArgument(['--port'], { 
  type: 'number',
  help: 'port number',
  default: 8080,
  choices: [8080, 8081, 8082]
});

parser.addArgument(['files'], { 
  nargs: '+',
  help: 'input files',
  metavar: 'FILE'
});

parser.addArgument(['--output'], {
  help: 'output file',
  required: true,
  dest: 'outputFile'
});
```

In this example:
- The `verbose` argument is a boolean flag with a default of `false`.
- The `port` argument is a number with a default of 8080 and limited to specific choices.
- The `files` argument is a positional argument that accepts one or more values.
- The `output` argument is a required option that will be accessible as `outputFile` in the parsed arguments.

When using `parseArgs()`, any arguments not provided by the user will use these default values, unless they're required, in which case an error will be thrown if they're missing.

### Parsing Arguments

Use the `parseArgs` method to parse a string of arguments:

```javascript
const args = parser.parseArgs('command --verbose -vvv --port=1234 -n "My name" foo bar --tag qux --tag=qix file1 file2');
```

### Printing usage

Use the `usage` method to print the usage string for the parser:

```javascript
const usageText = parser.usage();
// Test parser
//    
//     positional arguments:
//       input FILE    Input file
//  
//     options:
//       --verbose VERBOSE    Increase output verbosity
```

### Error Handling

The library will throw specific error types for various parsing issues. You should wrap the `parseArgs` call in a try-catch block to handle these errors:

```javascript
import { 
  ArgumentParser, 
  ArgumentParserError,
  ArgumentTypeError,
  UnknownArgumentError,
  MissingRequiredArgumentError,
  InvalidChoiceError,
  InvalidNargsError
} from 'js-argparse';

try {
  const args = parser.parseArgs(argsString);
  // Use parsed arguments
} catch (error) {
  if (error instanceof ArgumentTypeError) {
    console.error('Invalid argument type:', error.message);
  } else if (error instanceof UnknownArgumentError) {
    console.error('Unknown argument:', error.message);
  } else if (error instanceof MissingRequiredArgumentError) {
    console.error('Missing required argument:', error.message);
  } else if (error instanceof InvalidChoiceError) {
    console.error('Invalid choice:', error.message);
  } else if (error instanceof InvalidNargsError) {
    console.error('Invalid number of arguments:', error.message);
  } else if (error instanceof ArgumentParserError) {
    console.error('Argument parsing error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
  // Handle the error (e.g., display help message)
}
```

## TypeScript Support

This library is written in TypeScript and includes type definitions. You can import types like this:

```typescript
import { ArgumentParser, ArgumentOptions } from 'js-argparse';
```

## Browser Usage

To use in a browser environment, include the UMD bundle in your HTML:

```html
<script src="path/to/argparse.min.js"></script>
<script>
  const parser = new argparse.ArgumentParser('My program');
  // Use the parser as described above
</script>
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a feature request, please open an issue on the GitHub repository.