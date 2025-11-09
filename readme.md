# PDF Object / PostScript filter

Webservice for editing PostScript in PDFs on the fly, implemented purely in TypeScript.

## Setup

```shell
npm install
npm run build
```

Once successfully built, deploy the `public` folder as-is.

## Custom filters

Filters are always executed for every line of PostScript in the PDF, and consist of two parts:

- Selection function: decides whether a line should be edited or not
- Mapping function: function to apply to each line where the selection function returned true

###  Example filter

Selection function:
```js
// check wether the line includes a copyright sign
return line.includes("Td [(\\251)]");
```

Mapping function:
```js
// replace all PostScript text elements with empty elements (still having the same length)
return line.replace(/\([\w\\&,]+\)/g, m => `(${" ".repeat(m.length)})`);
```
