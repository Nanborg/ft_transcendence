# CPP norm

## general

- don't use more than 3 levels of indentation
- indent with tabs of length 4
- only use global variables if it needs to be accessed in other files

## functions

- put a space before and after parameters declarations (eg. `void	SomeEntity::function( int var ) { ... }`)
- open the scope on the same line as the signature declaration

## classes

- class names use `PascalCase`
- class members use `camelCase`
- private members are prefixed with `_`
- non member functions use `snake_case`
- variables and function names must be at least 3 characters long
- all member variables must be private

## headers

- only include necessary headers
- only include headers in files that need them (eg. don't include `GameEngine.hpp` in `PlayerEntity.hpp`, include it in `PlayerEntity.cpp` instead)
- indent function and variable declarations the same amount as surrounding declarations
- separate groups of declarations with empty lines
- separate declarations of functions and variables
