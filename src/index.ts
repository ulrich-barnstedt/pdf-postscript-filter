import {downloadUint8ArrayAsPdf, fileToArrayBuffer} from "./io";
import {filterPdfObjects} from "./pdfObjectFilter";

const getElementByIdTyped = <T> (id: string): T => document.getElementById(id) as T;
const dom = {
    filterButton: getElementByIdTyped<HTMLButtonElement>("filter-button"),
    fileInput: getElementByIdTyped<HTMLInputElement>("file-input"),
    selectedFile: getElementByIdTyped<HTMLSpanElement>("selected-file")
}

dom.filterButton.addEventListener("click", async () => {
    if (!dom.fileInput.files?.[0]) {
        return;
    }
    const file = dom.fileInput.files[0];

    const nameParts = file.name.split(".")
    if (nameParts.length > 1) {
        nameParts.splice(nameParts.length - 1, 0, "filtered");
    }
    const newName = nameParts.join(".");

    const fileBuffer = await fileToArrayBuffer(file);
    const processedPdf = await filterPdfObjects(fileBuffer);
    downloadUint8ArrayAsPdf(processedPdf, newName);
});

dom.fileInput.addEventListener("change", () => {
    if (dom.fileInput.files?.[0]) {
        dom.selectedFile.innerText = dom.fileInput.files[0].name;
    } else {
        dom.selectedFile.innerText = "";
    }
});
