import {PDFDocument, PDFName, PDFRawStream} from "pdf-lib";
import getStream, {getStreamAsArrayBuffer} from "get-stream";
import toReadableStream from "to-readable-stream";

const PDFName_Filter = PDFName.of("Filter");
const textEncoder = new TextEncoder();

export const filterPdfObjects = async (input: ArrayBuffer): Promise<Uint8Array> => {
    const pdf = await PDFDocument.load(input);

    for (const [_, pdfObj] of pdf.context.enumerateIndirectObjects()) {
        if (!(pdfObj instanceof PDFRawStream)) continue;

        const compression = pdfObj.dict.get(PDFName_Filter);
        if (compression !== PDFName.FlateDecode) continue;

        const inflated = await getStream(
            toReadableStream(new Uint8Array(pdfObj.contents))
                .pipeThrough(new DecompressionStream("deflate"))
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
                    .pipeThrough(new CompressionStream("deflate"))
            );
            pdfObj.contents.set(new Uint8Array(recompressed));
        }
    }

    return await pdf.save();
}
