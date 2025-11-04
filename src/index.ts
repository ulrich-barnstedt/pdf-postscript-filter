import {PDFDocument, PDFName, PDFRawStream} from "pdf-lib";
import getStream, {getStreamAsArrayBuffer} from "get-stream";
import toReadableStream from "to-readable-stream";

const PDFName_Filter = PDFName.of("Filter");
const zLibInflate = new DecompressionStream("deflate");
const zLibDeflate = new CompressionStream("deflate");
const textEncoder = new TextEncoder();

(async () => {
    // const input = await fs.readFile("../test.pdf");

    // TODO: input
    const pdf = await PDFDocument.load("");

    for (const [_, pdfObj] of pdf.context.enumerateIndirectObjects()) {
        if (!(pdfObj instanceof PDFRawStream)) continue;

        const compression = pdfObj.dict.get(PDFName_Filter);
        if (compression !== PDFName.FlateDecode) continue;

        const inflated = await getStream(
            toReadableStream(new Uint8Array(pdfObj.contents))
                .pipeThrough(zLibInflate)
        );
        let inflatedLines = inflated.split("\n");

        let modified = false;
        inflatedLines = inflatedLines.map(l => {
            if (!l.includes("Td [(\\251)]")) return l;

            modified = true;
            return l.replace(/\([\w\\&,]+\)/g, m => `(${" ".repeat(m.length)})`);
        });

        if (modified) {
            const recompressed = await getStreamAsArrayBuffer(
                toReadableStream(textEncoder.encode(inflatedLines.join("\n")))
                    .pipeThrough(zLibDeflate)
            );
            pdfObj.contents.set(new Uint8Array(recompressed));
        }
    }

    // await fs.writeFile("../out.pdf", await pdf.save());
})();
