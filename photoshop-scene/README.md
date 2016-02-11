# Photoshop to HTML + CreateJS

Exports a PSD file to a html with a canvas created using CreateJS. It can be used to create fast Game UI.
* Each layers will be exported to a createjs.Bitmap;
* The layer name is used to create the variable name;
* Layers where the name starts with “button” will turn into an image with a event ‘click’;
* A folder on PSD will turn into a createjs.Container and every layer inside it will be added on it;

# Configuring your PSD file
1.	Images must be separated into layers and rasterizeds;
2.	Layers can’t have the same name;
3.	Only the active document will be used;

# Usage
1.	File -> Scripts -> Browser;
2.	Select file: Create Javascript Scene.jsx;
3.	Have fun!
