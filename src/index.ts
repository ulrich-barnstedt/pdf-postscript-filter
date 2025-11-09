import {downloadUint8ArrayAsPdf, fileToArrayBuffer} from "./io";
import {filterPdfObjects} from "./pdfObjectFilter";
import {dom} from "./dom";
import {Preset, presets} from "./presets";

dom.execute.filterButton.addEventListener("click", async () => {
    if (!dom.input.fileInput.files?.[0]) {
        return;
    }
    const file = dom.input.fileInput.files[0];

    const nameParts = file.name.split(".")
    if (nameParts.length > 1) {
        nameParts.splice(nameParts.length - 1, 0, "filtered");
    }
    const newName = nameParts.join(".");

    const selectorFunc = new Function("line", dom.configuration.selectionFunction.value) as (line: string) => boolean;
    const mappingFunc = new Function("line", dom.configuration.mappingFunction.value) as (line: string) => string;

    const fileBuffer = await fileToArrayBuffer(file);
    const filterResult = await filterPdfObjects(fileBuffer, selectorFunc, mappingFunc);
    downloadUint8ArrayAsPdf(filterResult.newPdf, newName, dom.results.resultLinkHolder);

    dom.results.linesChanged.innerText = filterResult.linesChanged.toString();
    dom.results.rewrittenObjects.innerText = filterResult.objectsRewritten.toString();
    dom.results.resultsContainer.classList.remove("invisible");
});

dom.input.fileInput.addEventListener("change", () => {
    if (dom.input.fileInput.files?.[0]) {
        dom.input.selectedFile.innerText = dom.input.fileInput.files[0].name;
    } else {
        dom.input.selectedFile.innerText = "";
    }
});

const applyPreset = (preset: Preset) => {
    dom.configuration.selectionFunction.value = preset.selection;
    dom.configuration.mappingFunction.value = preset.mapping;
}
applyPreset(presets["tum-copyright"]);
dom.configuration.presetApply.addEventListener("click", () => {
    const selection = dom.configuration.presetSelector.value;
    if (!(selection in presets)) {
        return;
    }
    applyPreset(presets[selection]);
});