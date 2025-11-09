export interface Preset {
    selection: string,
    mapping: string
}

export const presets: Record<string, Preset> = {
    "tum-copyright": {
        selection: `return line.includes("Td [(\\\\251)]");`,
        mapping: `return line.replace(/\\([\\w\\\\&,]+\\)/g, m => \`(\${" ".repeat(m.length)})\`);`
    },
    "blank": {
        selection: `return false;`,
        mapping: `return line;`
    }
}
