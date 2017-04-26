# Assets Improved

**Assets Improved** is [Metalsmith][1] plugin for handling static assets, such as images and CSS files. It is a replacement for plugins such as ["Metalsmith Assets"][2] and ["Metalsmith Static"][3], although it has an API different from those plugins.

[1]: http://metalsmith.io
[2]: https://github.com/treygriffith/metalsmith-assets
[3]: https://github.com/thehydroimpulse/metalsmith-static

## Usage

When building a Metalsmith project, you have a directory that contains your `package.json` file, a source directory, and an output directory. This documentation refers to this directory as "the Metalsmith project directory" or "the Metalsmith root." The Metalsmith root directory is represented in code samples as `__dirname`.

**Assets Improved** is used like any other Metalsmith plugin, for example:

```javascript
let assets = require( 'metalsmith-assets-improved' );
let Metalsmith = require( 'metalsmith' );

Metalsmith( __dirname )
    .use( assets() )
    .build( function( err ) {
        if ( err ) return done( err );
    } );
```

By default, **Assets Improved** looks in `__dirname/assets` for static assets. These assets will be copied to the output or build folder, which is `__dirname/build` by default. If you change the output directory with the the `destination` function, then the assets will be copied to that directory.

### Configuration

Like any other Metalsmith plugin, you can override the default behavior by passing a configuration object to the `assets` function, like so:

```javascript
Metalsmith( __dirname )
    .use( assets( {
        src: 'static',
        dest: 'static',
        replace: 'old'
    } ) )
    .build( function( err ) {
        if ( err ) return done( err );
    } );
```

As shown in the example above, the configuration object has three fields. All of them are optional.

+ **src**: Directory to copy files _from_. Relative paths are resolved against the Metalsmith project directory (i.e. `src` can be a sibling to the directory used as Metalsmith's source). Defaults to `__dirname/assets`.
+ **dest**: Directory to copy files _to_. Relative paths are resolved against the directory configured via's Metalsmith `destination` function. Defaults to `.` (i.e. the same as `destination`).
+ **replace**: Which, if any, files in the `dest` folder should be overwritten during the build process. Possible values are:
    - `'all'` (all files will be overwritten)
    - `'old'` (files in `dest` older than their counterparts in `src` will be overwritten)
    - `'none'` (no files in `dest` will be overwritten, but files in `src` without a counterpart will be copied to `dest`; **default**)

It is highly recommended to set `metalsmith.clean(false)` if you are using the `replace` option. Otherwise, Metalsmith will delete all of your old build files each time it runs, which makes the `replace` option pretty pointless.

## License

The content of this repository is licensed under the [3-Clause BSD license][4]. Please see the enclosed [license file][5] for specific terms.

[4]: https://opensource.org/licenses/BSD-3-Clause
[5]: https://github.com/philgs/metalsmith-assets-improved/blob/release/LICENSE.md
