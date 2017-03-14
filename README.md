# Assets Improved

**Assets Improved** is [Metalsmith][1] plugin for handling static assets, such as images and CSS files. It is a replacement for plugins such as ["Metalsmith Assets"][2] and ["Metalsmith Static"][3], although it has an API different from those plugins.

[1]: http://metalsmith.io
[2]: https://github.com/treygriffith/metalsmith-assets
[3]: https://github.com/thehydroimpulse/metalsmith-static

## Usage

It is highly recommended to set `metalsmith.clean(false)` if you are using the `replace` option. Otherwise, Metalsmith will delete all of your old build files each time it runs, which makes the `replace` option pretty pointless.

## License

The content of this repository is licensed under the [3-Clause BSD license][4]. Please see the enclosed [license file][5] for specific terms.

[4]: https://opensource.org/licenses/BSD-3-Clause
[5]: https://github.com/philgs/metalsmith-assets-improved/blob/release/LICENSE.md
