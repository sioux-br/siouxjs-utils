// Create Typescript Scene - Adobe Photoshop Script
// Description: 
// Requirements: Adobe Photoshop CS6
// Version: 1.0.0, 29/01/2016
// Company: SIOUX
// ===============================================================================
// PREPARAÇÃO NO PHOTOSHOP
// 1) As imagens precisam ser separadas em layers e rasterizadas
// 2) O nome das layers que são botões precisam começar com 'button'
// 3) Os layers não podem ter nomes iguais
// ===============================================================================

FormatType = {
    PNG24: 1,
    JPG: 2
}


// Seta uma referência do documento/arquivo aberto e o seu nome
var docRef = app.activeDocument;
var docName = decodeURI(activeDocument.name);

// Retira a extensão, os espaços e os traços
docName = docName.substring(0, docName.length - 4);
docName = docName.replace(/ /g, "");
docName = docName.replace(/-/g, "");

// Seta outras variáveis
var myWidth = docRef.width.toString().replace(" px", "");
var myHeight = docRef.height.toString().replace(" px", "");
var containerNames = new Array("stage");

// Define pixels as unit of measurement
var defaultRulerUnits = preferences.rulerUnits;
preferences.rulerUnits = Units.PIXELS;

// Define variable for the active layer in the active document
var layerRef = app.activeDocument.activeLayer;

// O conteúdo do script
var newScript = "";

// O conteúdo do script Html
var newScriptHtml = "";

// Pergunta para o usuário qual o local que será exportado
var FPath = Folder.selectDialog("Exportar os arquivos em qual local?");

// Todos os layers
var allLayers = new Array();

// A window com as opções
var dlgMain;

// Flag que indica se exportamos todas as layers ou apenas as layers visíveis. Default = true
var exportAllLayers = true;

// Flag que indica qual o formato que será exportado
var exportFormat = FormatType.PNG24; 

// Flag que indica se o usuário cancelou a janela
var isUserCancelling = true;


// Detect line feed type
if ($.os.search(/windows/i) !== -1) {
    fileLineFeed = "Windows";
}
else {
    fileLineFeed = "Macintosh";
}

// Run the functions
preferences.rulerUnits = defaultRulerUnits; // Set preferences back to user's defaults

// Verifica se o usuário cancelou a escolha do local
if (FPath != null) {
    CreateWindow();
}


// Show results
if (FPath == null || isUserCancelling) {
    alert("Cancelado!", "SIOUX");
}
else {
    alert("Feito!\n" + FPath + "/" + docName + ".ts ", "SIOUX");
}


// --------------------------------------------------------------------------------------------------------------
// -------------------------------- FUNÇÕES PARA CRIAR A WINDOW DE OPÇÕES ---------------------------------------
// --------------------------------------------------------------------------------------------------------------

function CreateWindow() {
    dlgMain = new Window("dialog", "SIOUX");

    dlgMain.orientation = 'column';
    dlgMain.alignChildren = 'left';

    // Texto
    dlgMain.add("statictext", undefined, "Escolha as opções para exportar as imagens:");

    // Painel de escolha das layers
    dlgMain.pnlWhatLayers = dlgMain.add("panel", undefined, "Quais layers?");
    //dlgMain.pnlWhatLayers.preferredSize.height = 100;
    dlgMain.pnlWhatLayers.alignment = 'fill';

    // Radio button 'Todas'
    dlgMain.pnlWhatLayers.grpWhatLayers = dlgMain.pnlWhatLayers.add("group");
    dlgMain.pnlWhatLayers.grpWhatLayers.rbAll = dlgMain.pnlWhatLayers.grpWhatLayers.add("radiobutton", undefined, "Todas");
    dlgMain.pnlWhatLayers.grpWhatLayers.rbAll.value = true;
    dlgMain.pnlWhatLayers.grpWhatLayers.rbAll.onClick = function () {
        exportAllLayers = true;
    }
    
    // Radio button 'Somente as visíveis'
    dlgMain.pnlWhatLayers.grpWhatLayers.rbVisible = dlgMain.pnlWhatLayers.grpWhatLayers.add("radiobutton", undefined, "Somente as visíveis");
    dlgMain.pnlWhatLayers.grpWhatLayers.rbVisible.onClick = function () {
        exportAllLayers = false;
    }


    // Painel de escolha do formato
    dlgMain.pnlFileType = dlgMain.add("panel", undefined, "Qual formato?");
    //dlgMain.pnlFileType.preferredSize.height = 100;
    dlgMain.pnlFileType.alignment = 'fill';

    // Dropdown list
    dlgMain.ddFileType = dlgMain.pnlFileType.add("dropdownlist");
    dlgMain.ddFileType.preferredSize.width = 100;

    dlgMain.ddFileType.add("item", "PNG-24");
    dlgMain.ddFileType.add("item", "JPEG");

    dlgMain.ddFileType.onChange = function () {
        DisableAllOptions();
        switch (this.selection.index) {
            case 0:
                exportFormat = FormatType.PNG24;
                EnablePNGOptions();
                break;

            case 1:
                exportFormat = FormatType.JPG;
                EnableJPGOptions();
                break;

            default:
                exportFormat = FormatType.PNG24;
                EnablePNGOptions();
                break;
        }
    }
    
    dlgMain.ddFileType.items[0].selected = true;

    dlgMain.btnBrowse = dlgMain.add("button", undefined, "OK");
    dlgMain.btnBrowse.onClick = function () {
        isUserCancelling = false;

        dlgMain.close();

        CreateScriptData(docRef);
        CreateScriptHtmlData(docRef);
        writeFile(newScript, newScriptHtml);
        ExportLayers();
    }


    // Opções extras que aparecem ao escolher PNG24
    dlgMain.pnlFileType.png24Trm = dlgMain.pnlFileType.add("checkbox", undefined, "Trim");
    dlgMain.pnlFileType.png24Trm.value = true;
    dlgMain.pnlFileType.png24Trm.alignment = 'left';


    // give the hosting app the focus before showing the dialog
    app.bringToFront();

    dlgMain.center();

    dlgMain.show();

}


function DisableAllOptions() {
    dlgMain.pnlFileType.png24Trm.visible = false;
}



function EnablePNGOptions() {
    dlgMain.pnlFileType.png24Trm.visible = true;
}


function EnableJPGOptions() {
}



// --------------------------------------------------------------------------------------------------------------
// ---------------------------------- FUNÇÕES PARA CRIAR O SCRIPT -----------------------------------------------
// --------------------------------------------------------------------------------------------------------------

// Export to txt file
function writeFile(info, infoHtm) {
    try {
        var f = new File(FPath + "/" + docName + ".js");
        f.remove();
        f.open('a');
        f.lineFeed = fileLineFeed;
        f.write(info);
        f.close();

        var htm = new File(FPath + "/" + docName + ".html");
        htm.remove();
        htm.open('a');
        htm.lineFeed = fileLineFeed;
        htm.write(infoHtm);
        htm.close();
    }
    catch (e) { }
}



// Create script
function CreateScriptData(currLayers) {
    newScript = "";
    newScript += "\n";
    newScript += "\nvar stage;";
    newScript += "\nvar loader;";
    newScript += "\n";
    newScript += "\nfunction Init() {";
    newScript += "\n";
    newScript += "\n\tstage = new createjs.Stage('demoCanvas');";
    newScript += "\n";
    newScript += "\n\tmanifest = [";

    // Cria o mini-manifest dessa classe
    CreateImageExports(currLayers);
    
    newScript += "\n\t];";
    newScript += "\n";
    newScript += "\n\tloader = new createjs.LoadQueue(false);";
    newScript += "\n\tloader.addEventListener('complete', HandleComplete);";
    newScript += "\n\tloader.loadManifest(manifest, true, '');";
    newScript += "\n}";
    newScript += "\n";
    newScript += "\n/**";
    newScript += "\n* HandleComplete";
    newScript += "\n**/";
    newScript += "\nfunction HandleComplete() {";
    newScript += "\n";

    // Cria os elementos
    CreateElement(currLayers);

    newScript += "\n\tstage.update()";
    newScript += "\n}";
    newScript += "\n";
    newScript += "\n";

    // Cria as funções dos botões
    CreateButtonFunctions(currLayers);
}



// Create Html script
function CreateScriptHtmlData(currLayers) {
    newScriptHtml = "";
    newScriptHtml += "\n";
    newScriptHtml += "\n" + "<" + "html>";
    newScriptHtml += "\n\t" + "<" + "head>";
    newScriptHtml += "\n\t\t" + "<" + "script src='https://code.createjs.com/createjs-2015.11.26.min.js'>" + "<" + "/script>";
    newScriptHtml += "\n\t\t" + "<" + "script>";

    newScriptHtml += newScript;

    newScriptHtml += "\n\t\t" + "<" + "/script>";
    newScriptHtml += "\n\t" + "<" + "/head>";
    newScriptHtml += "\n\t" + "<" + "body onload='Init();'>";
    newScriptHtml += "\n\t\t" + "<" + "canvas id='demoCanvas' width='" + myWidth + "' height='" + myHeight + "'>" + "<" + "/canvas>";
    newScriptHtml += "\n\t" + "<" + "/body>";
    newScriptHtml += "\n" + "<" + "/html>";
}



// Função para criar o export das imagens
function CreateImageExports(currLayers) {
    for (var i = 0; i < currLayers.layers.length; i++) {
        layerRef = currLayers.layers[i];

        // Verifica se a layer é de grupo
        if (IsGroupLayer(layerRef)) {
            CreateImageExports(layerRef);
        }
        else {

            // Verifica se podemos exportas essa layer
            if (exportAllLayers || layerRef.visible) {

                // Se não for um texto
                if (layerRef.kind != LayerKind.TEXT) {

                    switch (exportFormat) {
                        case FormatType.PNG24:
                            newScript += "\n\t\t{ src: '" + layerRef.name.replace(/ /g, "").replace(/-/g, "") + ".png', id: 'ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "' },";
                            break;

                        case FormatType.JPG:
                            newScript += "\n\t\t{ src: '" + layerRef.name.replace(/ /g, "").replace(/-/g, "") + ".jpg', id: 'ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "' },";
                            break;

                        default:
                            newScript += "\n\t\t{ src: '" + layerRef.name.replace(/ /g, "").replace(/-/g, "") + ".png', id: 'ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "' },";
                            break;
                    }
                }
            }
        }
    }
}




// Função para criar um dos elementos, ex: textos, imagens, botões, etc (recursivo)
function CreateElement(currLayers) {
    for (var i = currLayers.layers.length - 1; i >= 0; i--) {
        layerRef = currLayers.layers[i];

        // Verifica se a layer é de grupo
        if (IsGroupLayer(layerRef)) {

            // Cria o nome do novo container
            var newContainer = "container" + containerNames.length;

            // Cria no script o novo container
            newScript += "\n\t// --- Novo container";
            newScript += "\n\tvar " + newContainer + " = new createjs.Container();";
            newScript += "\n\t" + containerNames[containerNames.length - 1] + ".addChild(" + newContainer + ");";
            newScript += "\n";

            containerNames.push(newContainer);
            CreateElement(layerRef);
        }
        else {

            // Verifica se podemos exportas essa layer
            if (exportAllLayers || layerRef.visible) {

                // Primeiro eu vou checar se é botão
                if (layerRef.name.substring(0, 6).toUpperCase() == "BUTTON") {
                    // É um botão

                    var variableName = layerRef.name.toLowerCase().replace(" ", "");

                    newScript += "\n\t// " + layerRef.name;
                    newScript += "\n\tvar " + variableName + " = new createjs.Bitmap(loader.getResult('ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "'));";
                    newScript += "\n\t" + containerNames[containerNames.length - 1] + ".addChild(" + variableName + ");";
                    newScript += "\n\t" + variableName + ".x = " + layerRef.bounds[0].value + ";";
                    newScript += "\n\t" + variableName + ".y = " + layerRef.bounds[1].value + ";";
                    newScript += "\n\t" + variableName + ".on('click', OnClick" + layerRef.name + ");";
                    newScript += "\n";
                }
                else {  // Não é um botão

                    if (layerRef.kind == LayerKind.TEXT) {

                        var variableName = layerRef.name.toLowerCase().replace(/ /g, "");

                        newScript += "\n\t// " + layerRef.name;
                        newScript += "\n\tvar " + variableName + " = new createjs.Text('" + layerRef.name + "', '" + FormatFontName(layerRef.textItem) + "', '#" + layerRef.textItem.color.rgb.hexValue + "');";
                        newScript += "\n\t" + containerNames[containerNames.length - 1] + ".addChild(" + variableName + ");";
                        newScript += "\n\t" + variableName + ".x = " + layerRef.bounds[0].value + ";";
                        newScript += "\n\t" + variableName + ".y = " + layerRef.bounds[1].value + ";";
                        newScript += "\n";
                    }
                    else if (layerRef.kind == LayerKind.NORMAL) {

                        var variableName = layerRef.name.toLowerCase().replace(/ /g, "");

                        newScript += "\n\t// " + layerRef.name;
                        newScript += "\n\tvar " + variableName + " = new createjs.Bitmap(loader.getResult('ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "'));";
                        newScript += "\n\t" + containerNames[containerNames.length - 1] + ".addChild(" + variableName + ");";
                        newScript += "\n\t" + variableName + ".x = " + layerRef.bounds[0].value + ";";
                        newScript += "\n\t" + variableName + ".y = " + layerRef.bounds[1].value + ";";
                        newScript += "\n";
                    }
                    else {

                        var variableName = layerRef.name.toLowerCase().replace(/ /g, "");

                        newScript += "\n\t// " + layerRef.name;
                        newScript += "\n\tvar " + variableName + " = new createjs.Bitmap(loader.getResult('ID_" + layerRef.name.toUpperCase().replace(/ /g, "") + "'));";
                        newScript += "\n\t" + containerNames[containerNames.length - 1] + ".addChild(" + variableName + ");";
                        newScript += "\n\t" + variableName + ".x = " + layerRef.bounds[0].value + ";";
                        newScript += "\n\t" + variableName + ".y = " + layerRef.bounds[1].value + ";";
                        newScript += "\n";
                    }
                }
            }
        }
    }

    // Remove o container
    containerNames.pop();
}





// Função para criar a função dos botões
function CreateButtonFunctions(currLayers) {

    for (var i = 0; i < currLayers.layers.length; i++) {
        layerRef = currLayers.layers[i];

        // Verifica se a layer é de grupo
        if (IsGroupLayer(layerRef)) {
            CreateButtonFunctions(layerRef);
        }
        else {

            // Verifica se podemos exportas essa layer
            if (exportAllLayers || layerRef.visible) {

                // Primeiro eu vou checar se é botão
                if (layerRef.name.substring(0, 6).toUpperCase() == "BUTTON") {
                    // É um botão

                    newScript += "\n/**";
                    newScript += "\n* Funcao de clique do botao " + layerRef.name;
                    newScript += "\n**/";
                    newScript += "\nfunction OnClick" + layerRef.name + "() {";
                    newScript += "\n\talert('ON CLICK: " + layerRef.name + "');";
                    newScript += "\n}";
                    newScript += "\n";
                    newScript += "\n";
                }
            }
        }
    }
}



// Verifica se a layer é de grupo
function IsGroupLayer(layer) {
    try {
        if (layer.layers.length > 0) {
            return true;
        }
    }

    catch(err) {
        return false;
    }
}



// Transforma a posição para o alinhamento no centro
function CalculateAlignCenterX(objX, objWidth) {
    return (objX + objWidth / 2) - myWidth / 2;
}


// Transforma a posição para o alinhamento no centro
function CalculateAlignCenterY(objY, objHeight) {
    return (objY + objHeight / 2) - myHeight / 2;
}


// Função para ajeitar o nome da fonte
function FormatFontName(textItem) {
    var fontName = "";

    // Verifica se existe alguma alteração na fonte, do tipo bold, italic, etc
    if (textItem.font.indexOf("-") != -1) {
        var aux = textItem.font.split("-");
        fontName = aux[1].toLowerCase() + " " + textItem.size.toString().replace(/ /g, "") + " " + aux[0];
    }
    else {
        fontName = textItem.size.toString().replace(/ /g, "") + " " + textItem.font;
    }

    return fontName;
}



// --------------------------------------------------------------------------------------------------------------
// ----------------------------------- FUNÇÕES PARA EXPORTAR AS IMAGENS -----------------------------------------
// --------------------------------------------------------------------------------------------------------------


function ExportLayers() {

    var doc = app.activeDocument;

    // Pega todas as layers
    GetAllLayers(app.activeDocument);

    // Desabilita todas as layers
    for (var i = 0; i < allLayers.length; ++i) {
        allLayers[i].visible = false;
    }

    // Para cada uma das layers
    for (var i = 0; i < allLayers.length; ++i) {
        var layer = allLayers[i];

        // Verifica se a layer não é um texto, pois não precisamos exportar os textos
        if (layer.kind != LayerKind.TEXT) {

            var fileName = makeFileNameFromLayerName(layer, true);

            if (fileName) {
                // Deixa a layer habilitada
                layer.visible = true;

                // Crop ou Trim na imagem
                if (dlgMain.pnlFileType.png24Trm.value) {
                    try {
                        doc.crop(layer.bounds);
                    }
                    catch (e) {
                        doc.trim(TrimType.TRANSPARENT);
                    }
                }

                // Exporta a imagem dependendo da escolha do formato
                switch (exportFormat) {
                    case FormatType.PNG24:
                        exportPng24AM(fileName);
                        break;

                    case FormatType.JPG:
                        var saveOptions = new JPEGSaveOptions();
                        saveOptions.quality = 12;
                        saveOptions.matte = MatteType.NONE;
                        saveOptions.embedColorProfile = false;
                        saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;

                        var saveFile = new File(fileName);

                        // Nome e caminho do arquivo (File), options (object), asCopy (bool), extension (Extension)
                        app.activeDocument.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
                        break;

                    default:
                        exportPng24AM(fileName);
                        break;
                }
                

                // Refaz o crop ou o trim
                doc.activeHistoryState = doc.historyStates[doc.historyStates.length - 2];

                // Desabilita a layer novamente
                layer.visible = false;
            }
            else {
                alert("Error! Nome não está correto!");
            }
        }
    }

    // Reabilita todas as layers novamente
    for (var i = 0; i < allLayers.length; ++i) {
        allLayers[i].visible = true;
    }
}



// Função recursiva para pegar todas as layers do documento e atribui a variável global allLayers
function GetAllLayers(currLayers) {
    for (var i = 0; i < currLayers.layers.length; i++) {
        layerRef = currLayers.layers[i];

        // Verifica se a layer é de grupo
        if (IsGroupLayer(layerRef)) {
            GetAllLayers(layerRef);
        }
        else {

            // Verifica se podemos exportar essa layer
            if (exportAllLayers || layerRef.visible) {
                allLayers.push(layerRef);
            }
        }
    }
}



// Função para criar o nome do arquivo (já com o caminho até ele)
function makeFileNameFromLayerName(layer) {
    var fileName = makeValidFileName(layer.name, true);

    if (fileName.length == 0) {
        fileName = "Layer";
    }

    switch (exportFormat) 
    {
        case FormatType.PNG24:
            return FPath + "/" + fileName + ".png";

        case FormatType.JPG:
            return FPath + "/" + fileName + ".jpg";

        default:
            return FPath + "/" + fileName + ".png";
    }
    
}


// Função para criar um nome válido para o arquivo
function makeValidFileName(fileName) {
    var validName = fileName.replace(/^\s+|\s+$/gm, '');
    validName = validName.replace(/[\\\*\/\?:"\|<>]/g, '');
    validName = validName.replace(/[ ]/g, '');
    return validName;
}



// Função para exportar em PNG24
function exportPng24AM(fileName) {
    var desc = new ActionDescriptor(),
	    desc2 = new ActionDescriptor();
    desc2.putEnumerated(app.charIDToTypeID("Op  "), app.charIDToTypeID("SWOp"), app.charIDToTypeID("OpSa"));
    desc2.putEnumerated(app.charIDToTypeID("Fmt "), app.charIDToTypeID("IRFm"), app.charIDToTypeID("PN24"));
    desc2.putBoolean(app.charIDToTypeID("Intr"), false);
    desc2.putBoolean(app.charIDToTypeID("Trns"), true);
    desc2.putBoolean(app.charIDToTypeID("Mtt "), true);
    desc2.putInteger(app.charIDToTypeID("MttR"), 255);
    desc2.putInteger(app.charIDToTypeID("MttG"), 255);
    desc2.putInteger(app.charIDToTypeID("MttB"), 255);
    desc2.putBoolean(app.charIDToTypeID("SHTM"), false);
    desc2.putBoolean(app.charIDToTypeID("SImg"), true);
    desc2.putBoolean(app.charIDToTypeID("SSSO"), false);
    desc2.putList(app.charIDToTypeID("SSLt"), new ActionList());
    desc2.putBoolean(app.charIDToTypeID("DIDr"), false);
    desc2.putPath(app.charIDToTypeID("In  "), new File(fileName));
    desc.putObject(app.charIDToTypeID("Usng"), app.stringIDToTypeID("SaveForWeb"), desc2);
    app.executeAction(app.charIDToTypeID("Expr"), desc, DialogModes.NO);
}
