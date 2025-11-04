import * as esbuild from 'esbuild';

await esbuild.build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/bundle.js',
});

