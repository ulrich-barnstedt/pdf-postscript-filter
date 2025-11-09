import * as esbuild from 'esbuild';

await esbuild.build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    outfile: 'public/dist/bundle.js',
    treeShaking: true,
    sourcemap: false,
    minify: true
});
