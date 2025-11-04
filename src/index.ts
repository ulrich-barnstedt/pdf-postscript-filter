import * as fs from "node:fs/promises";
import {PDFDocument, PDFName, PDFRawStream} from "pdf-lib";
import * as zlib from "node:zlib";

const PDFName_Filter = PDFName.of("Filter");

(async () => {
    const input = await fs.readFile("../test.pdf");
    const pdf = await PDFDocument.load(input);

    pdf.context.enumerateIndirectObjects().forEach(([ref, pdfObj]) => {
        if (!(pdfObj instanceof PDFRawStream)) return;

        const compression = pdfObj.dict.get(PDFName_Filter);
        if (compression !== PDFName.FlateDecode) return;

        const inflated = zlib.inflateSync(pdfObj.contents);
        let inflatedLines = inflated.toString().split("\n");

        let modified = false;
        inflatedLines = inflatedLines.map(l => {
            if (!l.includes("Td [(\\251)]")) return l;

            modified = true;
            return l.replace(/\([\w\\&,]+\)/g, m => `(${" ".repeat(m.length)})`);
        });

        if (modified) {
            const recompressed = zlib.deflateSync(inflatedLines.join("\n"));
            recompressed.copy(pdfObj.contents)
        }
    })

    await fs.writeFile("../out.pdf", await pdf.save());
})();
