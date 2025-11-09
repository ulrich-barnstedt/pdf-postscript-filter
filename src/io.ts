const fileReader = new FileReader();
let currentPromiseResolver: ((res: ArrayBuffer) => void) | null = null;

export const fileToArrayBuffer = async (file: File) => {
    fileReader.readAsArrayBuffer(file);
    return new Promise<ArrayBuffer>(res => currentPromiseResolver = res);
}

fileReader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
    if (!event.target?.result) {
        return;
    }

    const content = event.target.result as ArrayBuffer;
    if (currentPromiseResolver !== null) {
        currentPromiseResolver(content);
        currentPromiseResolver = null;
    }
});

export const downloadUint8ArrayAsPdf = (array: Uint8Array, filename: string) => {
    // @ts-expect-error typescript not understanding Uint8Array to blob conversion
    const blob = new Blob([array], {
        type: "application/pdf"
    });

    const blobUrl = URL.createObjectURL(blob);
    const fakeLink = document.createElement("a");
    fakeLink.href = blobUrl;
    fakeLink.download = filename;
    fakeLink.style.display = "none";

    document.body.appendChild(fakeLink);
    fakeLink.click();
    fakeLink.remove();
}
