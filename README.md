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

- `type`: The type to convert the argument to ('string', 'number', or 'boolean').
- `default`: The default value if the argument is not provided.
- `nargs`: The number of arguments to consume (a number, '?', '*', or '+').
- `choices`: An array of valid choices for the argument.
- `required`: Whether the argument is required (true or false).
- `help`: A description of the argument for help text.
- `metavar`: A name for the argument in usage messages.
- `dest`: The name of the attribute to be added to the object returned by parseArgs().

### Parsing Arguments

Use the `parseArgs` method to parse a string of arguments:

```javascript
const args = parser.parseArgs('command --verbose -vvv --port=1234 -n "My name" foo bar --tag qux --tag=qix file1 file2');
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