const getElementByIdTyped = <T> (id: string): T => document.getElementById(id) as T;

export const dom = {
    input: {
        fileInput: getElementByIdTyped<HTMLInputElement>("file-input"),
        selectedFile: getElementByIdTyped<HTMLSpanElement>("selected-file"),
    },
    execute: {
        filterButton: getElementByIdTyped<HTMLButtonElement>("filter-button"),
    },
    results: {
        resultLinkHolder: getElementByIdTyped<HTMLDivElement>("result-link-holder"),
        resultsContainer: getElementByIdTyped<HTMLDivElement>("results-container"),
        linesChanged: getElementByIdTyped<HTMLSpanElement>("lines-changed"),
        rewrittenObjects: getElementByIdTyped<HTMLSpanElement>("rewritten-objects")
    },
    configuration: {
        presetSelector: getElementByIdTyped<HTMLSelectElement>("preset-selector"),
        presetApply: getElementByIdTyped<HTMLButtonElement>("preset-apply"),
        selectionFunction: getElementByIdTyped<HTMLTextAreaElement>("selection-function"),
        mappingFunction: getElementByIdTyped<HTMLTextAreaElement>("mapping-function")
    }
};
