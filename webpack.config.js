import webpack from 'webpack';
import Terser from "terser-webpack-plugin";
import path from "path";
import URL from "url";
import fs from "fs";
import crypto from "crypto";
import uglify from "uglify-js";
import js_beautify from "js-beautify";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import 'dotenv/config';

const ignoreFiles = [
    "moddingAPI/index.js",
    "moddingAPI/highlight.min.js"
];

const config = {
    optimization: {
        minimize: true,
        minimizer: [
            new Terser({
                parallel: true,
                terserOptions: {
                    mangle: true,
                    ecma: 5
                }
            })
        ]
    },
    entry: {
        bundle: "./public/index.js",  // Main bundle entry point
        worker: "./public/server/index.js",  // Worker entry point
        mapEditor: "./public/mapGenerator/index.js"  // Map editor entry point
    },
    output: {
        path: path.resolve(path.dirname(URL.fileURLToPath(import.meta.url)), "./build"),
        filename: "[name].js"
    },
    plugins: [
        new webpack.DefinePlugin({ 
            "process.env.ROUTING_SERVER": JSON.stringify(process.env.ROUTING_SERVER),
            "process.env.AUTH_SERVER": JSON.stringify(process.env.AUTH_SERVER),
         }),
        new HtmlWebpackPlugin({
            template: './public/index.ejs',
            filename: 'index.html',
            inject: true,
            templateParameters: { 
                DISCORD_OAUTH2_REDIRECT_URL: process.env.DISCORD_OAUTH2_REDIRECT_URL,
                AUTH_SERVER: process.env.AUTH_SERVER
            },
        }),
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
                    console.log("Copying and processing files...");
                    const sourceDir = path.resolve(
                        path.dirname(URL.fileURLToPath(import.meta.url)),
                        "./public"
                    );

                    const destinationDir = compiler.outputPath;

                    // Clear the destination directory of all subdirectories (recursively) but leave the files intact
                    fs.readdirSync(destinationDir).forEach((file) => {
                        if (fs.statSync(path.join(destinationDir, file)).isDirectory()) {
                            fs.rmSync(path.join(destinationDir, file), { recursive: true });
                        }
                    });

                    // Define a function to recursively copy and process files
                    function copyAndProcessFiles(srcDir, destDir) {
                        const files = fs.readdirSync(srcDir);

                        files.forEach((file) => {
                            const sourcePath = path.join(srcDir, file);
                            const destPath = path.join(destDir, file);

                            if (fs.statSync(sourcePath).isDirectory()) {
                                // Recursively copy and process subdirectories
                                fs.mkdirSync(destPath);
                                copyAndProcessFiles(sourcePath, destPath);
                            } else if (path.extname(file) === ".js") {
                                if (ignoreFiles.some(f => sourcePath.replace(/\\/g, "/").includes(f))) {
                                    console.log("Ignoring", sourcePath);
                                } else {
                                    fs.copyFileSync(sourcePath, destPath.replace("index.js", "bundle.js"));
                                }
                            } else if (path.extname(file) === ".html" || path.extname(file) === ".css") {
                                // If it's an HTML or CSS file, minimize it and then copy
                                const content = fs.readFileSync(sourcePath, "utf8");
                                fs.writeFileSync(destPath, content.replace(/(\r\n|\n|\r|\t)/gm, "").replace(/\s+/g, " ").replace(/<!--.*?-->/g, "").replace("index.js", "bundle.js"), "utf8");
                            } else {
                                // Copy other files as is
                                fs.copyFileSync(sourcePath, destPath);
                            }
                        });
                    }

                    // Start copying and processing files from the source directory
                    copyAndProcessFiles(sourceDir, destinationDir);

                    function recursiveRemoveEmptyDirectories(directory) {
                        // If it doesn't exist, return
                        if (!fs.existsSync(directory)) {
                            return;
                        }

                        if (fs.statSync(directory).isDirectory()) {
                            const files = fs.readdirSync(directory);

                            if (files.length === 0) {
                                fs.rmdirSync(directory);
                                recursiveRemoveEmptyDirectories(path.dirname(directory));
                            } else {
                                files.forEach((file) => {
                                    recursiveRemoveEmptyDirectories(path.join(directory, file));
                                });
                            }
                        }
                    }

                    // Remove empty directories from the destination directory
                    recursiveRemoveEmptyDirectories(destinationDir);

                    // Generate a hash of the build
                    const hash = crypto.createHash("sha256");
                    function recursiveHashFiles(directory) {
                        const files = fs.readdirSync(directory);

                        files.forEach((file) => {
                            const filePath = path.join(directory, file);

                            if (fs.statSync(filePath).isDirectory()) {
                                recursiveHashFiles(filePath);
                            } else {
                                hash.update(fs.readFileSync(filePath));
                            }
                        });
                    }

                    recursiveHashFiles(destinationDir);

                    const buildHash = hash.digest("hex");

                    // Write the hash to a file
                    fs.writeFileSync(path.join(destinationDir, "version.txt"), buildHash);
                });
            }
        }, 
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
                    // Find worker.js and move it to /server/index.js
                    const workerPath = path.join(compiler.outputPath, "worker.js");
                    fs.mkdirSync(path.join(compiler.outputPath, "server"), { recursive: true });
                    fs.renameSync(workerPath, path.join(compiler.outputPath, "server", "index.js"));

                    // Find mapEditor.js and move it to /mapEditor/bundle.js
                    const mapEditorPath = path.join(compiler.outputPath, "mapEditor.js");
                    fs.renameSync(mapEditorPath, path.join(compiler.outputPath, "mapGenerator", "bundle.js"));

                    // Make a copy and append a comment to the start of it
                    let serverCode = fs.readFileSync(path.join(compiler.outputPath, "server", "index.js"), "utf8");
                    serverCode = js_beautify.js_beautify(uglify.minify(`/* Polyfills and supporting code for bun's runtime */
globalThis.environmentName = "bun";
const location = {
    href: "https://floof.supercord.lol/server/bun.js",
    hostname: "floof.supercord.lol"
};
const _fetch = fetch;
fetch = async (...args) => {
    args[0] = args[0].startsWith("http") ? args[0] : ("https://floof.supercord.lol" + args[0]);
    const response = await _fetch(...args); 
    const text = await response.text();
    return {
        text: async () => text,
        json: async () => JSON.parse(text)
    };
};

const _setInterval = setInterval;
setInterval = (fn, time, ...args) => {
    let lastTime = performance.now();
    return _setInterval(() => {
        const now = performance.now();
        const delta = now - lastTime;

        if (delta >= time) {
            fn();
            lastTime = now;
        }
    }, time / 10, ...args);
}

async function generateAnalytics() {
    const os = await import("os");

    function getBrowserInfo() {
        // Bun
        if (typeof Bun !== "undefined") {
            return {
                name: "Bun",
                version: Bun.version
            };
        }

        // Deno
        if (typeof Deno !== "undefined") {
            return {
                name: "Deno",
                version: Deno.version.deno
            };
        }

        // Node.js
        if (typeof process !== "undefined") {
            return {
                name: "Node.js",
                version: process.version
            };
        }

        return {
            name: "Unknown",
            version: "0.0.0"
        };
    }

    function getOSInfo() {
        const platform = os.platform();
        const platformsMap = {
            "win32": "Windows",
            "darwin": "Mac OS",
            "linux": "Linux",
            "android": "Android",
            "freebsd": "FreeBSD",
            "openbsd": "OpenBSD",
            "sunos": "SunOS"
        };

        return platformsMap[platform] || "Unknown";
    }

    async function getAnalyticsData() {
        return {
            screen: "0x0",
            hardware: {
                gl: 0,
                gl2: 0,
                minCores: os.cpus().length,
                minMem: Math.min(8, Math.round(os.totalmem() / 1024 / 1024 / 1024)),
                gpu: "Unknown",
                os: getOSInfo(),
                bench: 0
            },
            browser: getBrowserInfo(),
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            tzOff: -(new Date().getTimezoneOffset() / 60),
            dst: +(new Date().getTimezoneOffset() < Math.max(new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset(), new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset())),
            isMobile: 0
        };
    }

    return btoa(JSON.stringify(await getAnalyticsData()));
}

const ANALYTICS_DATA = await generateAnalytics();

${serverCode}`.trim(), {
                        compress: true,
                        mangle: false
                    }).code);

                    fs.writeFileSync(path.join(compiler.outputPath, "server", "bun.js"), serverCode);
                });
            }
        }],
    resolve: {
        extensions: [".js", ".html"]
    },
    mode: "production"
};

export default config;
