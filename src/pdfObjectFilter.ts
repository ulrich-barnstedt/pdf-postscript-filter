import {PDFDocument, PDFName, PDFRawStream} from "pdf-lib";
import getStream, {getStreamAsArrayBuffer} from "get-stream";
import toReadableStream from "to-readable-stream";

const PDFName_Filter = PDFName.of("Filter");
const textEncoder = new TextEncoder();

export interface PdfFilterResult {
    linesChanged: number;
    objectsRewritten: number;
    newPdf: Uint8Array
}

export const filterPdfObjects = async (
    input: ArrayBuffer,
    selectorFunction: (line: string) => boolean,
    mappingFunction: (line: string) => string
): Promise<PdfFilterResult> => {
    const pdf = await PDFDocument.load(input);
    let linesChanged = 0;
    let objectsRewritten = 0;

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
            if (!selectorFunction(l)) return l;

            linesChanged++;
            modified = true;
            return mappingFunction(l);
        });

        if (modified) {
            objectsRewritten++;

            const recompressed = await getStreamAsArrayBuffer(
                toReadableStream(textEncoder.encode(inflatedLines.join("\n")))
                    .pipeThrough(new CompressionStream("deflate"))
            );
            pdfObj.contents.set(new Uint8Array(recompressed));
        }
    }

    return {
        newPdf: await pdf.save(),
        linesChanged,
        objectsRewritten
    };
}
