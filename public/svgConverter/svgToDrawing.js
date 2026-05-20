function parseSVG(text, drawScale = 1, xOffset = 0, yOffset = 0, rotation = 0) {
    text = new String(text);
    if (!(text instanceof String)) { return; }
    //  const parser = new DOMParser();
    text = text.substring(text.indexOf("<svg"), text.indexOf("</svg>") + 6);
    const svg = parser.parseFromString(text, "image/svg+xml").getElementsByTagName("svg").item(0);
    const styleSheetRules = svg.getElementsByTagName("style").item(0)?.sheet.cssRules;
    let actions = [];
    const elements = svg.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        const element = elements.item(i);
        switch (element.tagName) {
            case "g":
                // parseGroup(element);
                break;
            case "rect":
                parseRect(element);
                break;
            case "circle":
                break;
            case "ellipse":
                break;
            case "line":
                break;
            case "polyline":
                break;
            case "polygon":
                break;
            case "path":
                parsePath(element);
                break;
        }
    }
    return actions;
    function parseGroup(/*SVGGElement*/group) {
        if (!(group instanceof SVGGElement)) { return; }
        group;
        for (let i = 0; i < group.children.length; i++) {
            //
        }
    }
    function parseRect(/*SVGRectElement*/rect) {
        if (!(rect instanceof SVGRectElement)) { return; }
        const transform = rect.getScreenCTM().scale(drawScale, drawScale).translate(xOffset, yOffset).rotate(rotation);
        const rectX = rect.x.baseVal.value, rectY = rect.y.baseVal.value, rectWidth = rect.width.baseVal.value, rectHeight = rect.height.baseVal.value;
        const topLeft = new DOMPoint(rectX, rectY).matrixTransform(transform);
        const topRight = new DOMPoint(rectX + rectWidth, rectY).matrixTransform(transform);
        const bottomLeft = new DOMPoint(rectX, rectY + rectHeight).matrixTransform(transform);
        const bottomRight = new DOMPoint(rectX + rectWidth, rectY + rectHeight).matrixTransform(transform);
        actions.push(["beginPath"]);
        actions.push(["moveTo", topLeft.x, topLeft.y]);
        actions.push(["lineTo", topRight.x, topRight.y]);
        actions.push(["lineTo", bottomRight.x, bottomRight.y]);
        actions.push(["lineTo", bottomLeft.x, bottomLeft.y]);
        actions.push(["lineTo", topLeft.x, topLeft.y]);
        const classInt = parseInt(rect.getAttribute("class")?.match(/\d+/g)[0]);
        const style = styleSheetRules ? styleSheetRules[classInt].style
            : {
                stroke: rect.attributeStyleMap.get("stroke")?.toString(),
                strokeWidth: rect.attributeStyleMap.get("stroke-width")?.toString(),
                fill: rect.attributeStyleMap.get("fill")?.toString()
            };
        if (style.stroke && style.stroke != "none" && style.stroke != "") { actions.push(["stroke", `${parseRGB(style.stroke)}`, parseInt(style.strokeWidth)]); }
        if (style.fill && style.fill != "none" && style.fill != "") { actions.push(["fill", `${parseRGB(style.fill)}`]); }
        actions.push(["closePath"]);
        rect.style.stroke
    }
    function parsePath(path) {
        if (!(path instanceof SVGPathElement)) { return; }
        const rawData = path.getAttribute("d");
        const rawActions = rawData.match(/[a-zA-z][^a-zA-z]+/g);
        let pathData = [];
        for (let i = 0; i < rawActions.length; i++) {
            const rawAction = rawActions[i];
            const type = rawAction[0];
            const values = rawAction.slice(1).match(/[-\.0-9][^,-\s]*/g)?.map((string) => parseFloat(string));
            const relative = (type.toLowerCase() == type);
            pathData.push({ type: type, values: values, relative: relative });
        }
        const transform = path.getScreenCTM().scale(drawScale, drawScale).translate(xOffset, yOffset).rotate(rotation);
        // const pathData = path.getPathData({normalize: true});
        const firstPoint = new DOMPoint(pathData[0].values[0], pathData[0].values[1]).matrixTransform(transform);
        let previousPoint = new DOMPoint(pathData[0].values[0], pathData[0].values[1]);
        let previousPoint2 = new DOMPoint(previousPoint.x, previousPoint.y);
        actions.push(["beginPath"]);
        actions.push(["moveTo", firstPoint.x, firstPoint.y]);
        let point;
        let point2;
        let point3;
        let valueLength;
        for (let i = 1; i < pathData.length; i++) {
            const pointData = pathData[i];
            switch (pointData.type.toUpperCase()) {
                case "M":
                    valueLength = 2;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point = point.matrixTransform(transform);
                        previousPoint = point;
                        actions.push(["moveTo", point.x, point.y]);
                    }
                    break;
                case "L":
                    valueLength = 2
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point = point.matrixTransform(transform);
                        previousPoint = point;
                        actions.push(["lineTo", point.x, point.y]);
                    }
                    break;
                case "H":
                    valueLength = 1;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 0], previousPoint.y)
                        };
                        point = point.matrixTransform(transform);
                        previousPoint = point;
                        actions.push(["lineTo", point.x, point.y]);
                    }
                    break;
                case "V":
                    valueLength = 1;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x, previousPoint.y + pointData.values[i + 0]);
                        }
                        else {
                            point = new DOMPoint(previousPoint.x, pointData.values[i + 0])
                        };
                        point = point.matrixTransform(transform);
                        previousPoint = point;
                        actions.push(["lineTo", point.x, point.y]);
                    }
                    break;
                case "C":
                    valueLength = 6;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 4], previousPoint.y + pointData.values[i + 5]);
                            point2 = new DOMPoint(previousPoint.x + pointData.values[i + 2], previousPoint.y + pointData.values[i + 3]);
                            point3 = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 4], pointData.values[i + 5]);
                            point2 = new DOMPoint(pointData.values[i + 2], pointData.values[i + 3]);
                            point3 = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point = point.matrixTransform(transform);
                        point2 = point2.matrixTransform(transform);
                        point3 = point3.matrixTransform(transform);
                        previousPoint = point;
                        previousPoint2 = point2;
                        actions.push(["bezierCurveTo", point3.x, point3.y, point2.x, point2.y, point.x, point.y]);
                    }
                    break;
                case "S":
                    valueLength = 4;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 2], previousPoint.y + pointData.values[i + 3]);
                            point2 = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 2], pointData.values[i + 3]);
                            point2 = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point3 = new DOMPoint(2 * previousPoint.x - previousPoint2.x, 2 * previousPoint.y - previousPoint2.y);
                        point = point.matrixTransform(transform);
                        point2 = point2.matrixTransform(transform);
                        point3 = point3.matrixTransform(transform);
                        previousPoint = point;
                        previousPoint2 = point2;
                        actions.push(["bezierCurveTo", point3.x, point3.y, point2.x, point2.y, point.x, point.y]);
                    }
                    break;
                case "Q":
                    valueLength = 4;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 2], previousPoint.y + pointData.values[i + 3]);
                            point2 = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 2], pointData.values[i + 3]);
                            point2 = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point = point.matrixTransform(transform);
                        point2 = point2.matrixTransform(transform);
                        previousPoint = point;
                        previousPoint2 = point2;
                        actions.push(["quadraticCurveTo", point2.x, point2.y, point.x, point.y]);
                    }
                    break;
                case "T":
                    valueLength = 2;
                    for (let i = 0; i < pointData.values.length; i += valueLength) {
                        if (pointData.relative) {
                            point = new DOMPoint(previousPoint.x + pointData.values[i + 0], previousPoint.y + pointData.values[i + 1]);
                        }
                        else {
                            point = new DOMPoint(pointData.values[i + 0], pointData.values[i + 1]);
                        };
                        point2 = new DOMPoint(2 * previousPoint.x - previousPoint2.x, 2 * previousPoint.y - previousPoint2.y);
                        point = point.matrixTransform(transform);
                        point2 = point2.matrixTransform(transform);
                        previousPoint = point;
                        previousPoint2 = point2;
                        actions.push(["quadraticCurveTo", point2.x, point2.y, point.x, point.y]);
                    }
                    break;
                case "Z":
                    actions.push(["lineTo", firstPoint.x, firstPoint.y]);
                    break;
            }
        }
        const classInt = parseInt(path.getAttribute("class")?.match(/\d+/g)[0]);
        const style = styleSheetRules ? styleSheetRules[classInt].style
            : {
                stroke: path.attributeStyleMap.get("stroke")?.toString(),
                strokeWidth: path.attributeStyleMap.get("stroke-width")?.toString(),
                fill: path.attributeStyleMap.get("fill")?.toString()
            };
        if (style.stroke && style.stroke != "none" && style.stroke != "") { actions.push(["stroke", `${parseRGB(style.stroke)}`, Math.ceil(parseFloat(style.strokeWidth ? style.strokeWidth : 1)) * drawScale]); }
        if (style.fill && style.fill != "none" && style.fill != "") { actions.push(["fill", `${parseRGB(style.fill)}`]); }
        actions.push(["closePath"]);
    }
    function rgb(r, g, b) {
        return "#" + (r).toString(16).padStart(2, '0') + (g).toString(16).padStart(2, '0') + (b).toString(16).padStart(2, '0');
    }
    function parseRGB(rgbString) {
        let rgbInt = [];
        rgbString.split("(")[1].split(")")[0].split(",").forEach(value => {
            rgbInt.push(parseInt(value.trim()));
        });
        return rgb(...rgbInt);
    }
}

const parser = new DOMParser();
const fileReader = new FileReader();
console.log(parser);

// svg controls and stuff
const svgUpload = document.getElementById("svgUpload");
const svgInput = document.getElementById("svgInput");

// drawing controls and stuff
const drawingInput = document.getElementById("drawingInput");
const linebreakSetting = document.getElementById("linebreakSetting");
const drawingClassSetting = document.getElementById("drawingClassSetting");
const scaleSetting = document.getElementById("scaleSetting");
const xOffsetSetting = document.getElementById("xOffsetSetting");
const yOffsetSetting = document.getElementById("yOffsetSetting");
const rotationSetting = document.getElementById("rotationSetting");
const convertButton = document.getElementById("convertButton");
const copyButton = document.getElementById("copyButton");
const downloadTextButton = document.getElementById("downloadTextButton");

// initialization
svgUpload.onchange = (async () => {
    const uploadFiles = svgUpload.files;
    if (uploadFiles.length == 0) return;
    const file = uploadFiles[0];
    const text = await file.text();
    svgInput.textContent = text;
});
convertButton.onclick = (() => {
    if (svgInput.textContent == "") return;
    const actions = parseSVG(
        svgInput.textContent,
        parseFloat(scaleSetting.value),
        parseFloat(xOffsetSetting.value),
        parseFloat(yOffsetSetting.value),
        parseFloat(rotationSetting.value)
    );
    if (actions.length == 0) return;
    let output = drawingClassSetting.value.toString();
    for (let i = 0; i < actions.length; i++) {
        let action = [`"${actions[i][0]}"`];
        for (let j = 1; j < actions[i].length; j++) {
            const actionParameter = actions[i][j];
            action.push(actionParameter?.[0] == "#" ? `"${actionParameter}"` : actionParameter);
        }
        if (linebreakSetting.checked) output += `\n.addAction(${action.join(",")})`;
        else output += `.addAction(${action.join(",")})`;
    }
    drawingInput.textContent = output;
});
copyButton.onclick = (async () => {
    if (drawingInput.textContent == "") return;
    navigator.clipboard.writeText(drawingInput.textContent).then(() => { alert("Copied to clipboard.") });
});
