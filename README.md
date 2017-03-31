# Computed Columns

> An awesome Kibana plugin.

This visualization plugin is like a table, but with computed columns.
Every new columns is a computation from normal basics columns. Every new column
has it own expression (e.g. col[0] * col[1] / 100).

---

## Considerations

* Any mathematical expression can be used to create computed columns. Even parentheses can be used to group expressions - e.g. (col[0] - col[1]) / col[0]
* To refence a colums use word _col_ followed by brackets with zero base index inside - e.g. col[1] = column 1
* Computed column can be used to create new computed columns
* Multiples computed colums will be computed in order, thous, you can only use column index n-1.
* Current Release Version: 0.1.1

## Install

#### From Kibana Installation Path:
`./bin/kibana-plugin install https://github.com/seadiaz/computed-columns/releases/download/x.y.z/computed-columns-x.y.z.zip`

#### From Docker Image:
`kibana-plugin install https://github.com/seadiaz/computed-columns/releases/download/x.y.z/computed-columns-x.y.z.zip`

## Roadmap

* Selectable total function.
* Configurable output format.

## development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.

  - `npm start`

    Start kibana and have it include this plugin

  - `npm start -- --config kibana.yml`

    You can pass any argument that you would normally send to `bin/kibana` by putting them after `--` when running `npm start`

  - `npm run build`

    Build a distributable archive

  - `npm run test:browser`

    Run the browser tests in a real web browser

  - `npm run test:server`

    Run the server tests using mocha

For more information about any of these commands run `npm run ${task} -- --help`.
