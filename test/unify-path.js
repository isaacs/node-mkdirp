function unifyPath(path) {
    if (process.platform === "win32") {
        path = path.replace(/\//g, "\\");
    }
    return path;
}

module.exports = unifyPath;
