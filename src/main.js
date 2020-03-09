var initFrame;

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("DOM fully loaded and parsed");
  init();
});

function init() {
  initFrame = document.getElementById("workframe").innerHTML;
}

function reInit() {
  document.getElementById("workframe").innerHTML = initFrame;
}

// grouped objects only allow for certain methods 
const groupCommands = ["dmove", "hide", "show", "back", "backward", "front", "forward", "add", "type"];

// prevent certain attributes being used as methods (for consistency)
const attrOnly = ["height", "width", "x", "y"];

// this is the main function!
function runCmd() {
  var inp = document.getElementById("jsinput").value.trim();
  inp = inp.replace(new RegExp(String.fromCharCode(0x5c) + "n", "g"), ""); // escape backslash for moodle editor misbehavior!
  var arr = inp.split(";");
  console.log(arr.toString());

  arr.forEach(function (item) {
    if (!item || item.slice(0, 2) == "//") return;            // ignore empty lines or comments
    if (item.slice(0, 9) == "drawing.") item = item.substr(9);// remove leading drawing
    if (item.charAt(0) == ":") {
      console.log("Current input = :" + item.substr(1).trim());
      eval(item.substr(1).trim());
      return;
    }
    console.log("Current input = " + item);

    var showRes = item.charAt(0) == "?" ? true : false;       // results requested?
    if (showRes) item = item.slice(1).trim();                 // remove leading ? if present

    var regex = String.fromCharCode(0x5c) + "(.*" + String.fromCharCode(0x5c) + ")";  // escape backslash for moodle editor misbehavior!
    var args = item.match(new RegExp(regex));                 // find any arguments in brackets
    if (args) {
      args = args[0];                                         // remove array
      var argsArr = args.slice(1, args.length - 1).split(",");
      for (i=0; i<argsArr.length; i++) {
        if (argsArr[i].indexOf("=") >= 0) {
          alert("Keine '=' Zeichen in Argumenten erlaubt.");  // oddly SVG allows an assignment as argument for move
          return;                                             //   so we prevent it here
        } 
        argsArr[i] = unQuote(argsArr[i].trim());              // trim and unquote each argument
      } 
      console.log("Arguments = " + argsArr.toString());
      item = item.replace(args, "");                          // remove arguments for now
    } else if (item.indexOf("=") > 0) {                              // input in attribut form?
      var last = item.indexOf("=") > 0 ? item.indexOf("=") : item.length;
      var attrval = item.slice(last + 1, item.length).trim(); // get attribute value
      item = item.replace(attrval, "").trim();                // remove attribut value
      item = item.replace("=", "").trim();                    // remove trailing "="
    }
      
    var elem = item.slice(item.lastIndexOf(".") + 1).trim();  // get attribute or method
    var obj = item.slice(0, item.lastIndexOf(".")).trim();    // get the object

    console.log("Output requested? = " + showRes);
    console.log("Object = " + obj);
    if (attrval) {                                            // setting an attribute
      console.log("Attribute = " + elem);
      console.log("Attribute value = " + attrval);
    } else {
      if (args)                                               // calling a method
        console.log("Method call = " + elem + args);
      else                                                    // requesting an attribute
        console.log("Attribute = " + elem);
    }
    
    // allow for special methods
    switch (elem) {                                           
      case "createRect":
        var params = args.substr(1, args.length - 2).split(",");  // remove brackets and split arguments
        if (!params || params.length == 0) return;
        console.log("params = " + params.toString());
        params[0] = unQuote(params[0]) + "_obj";
        if (isNaN(params[1])) params[1] = 100;                // x position
        if (isNaN(params[2])) params[2] = 100;                // y position
        if (isNaN(params[3])) params[3] = 50;                 // width
        if (isNaN(params[4])) params[4] = 50;                 // height
        if (!params[5]) params[5] = "'white'";                // fill color

        evalCmd = "SVG('drawing').rect(" + params[3] + "," + params[4] + ").attr('id','" + params[0]
                   + "').attr('stroke', 'black').attr('stroke-width', 5).attr('type', 'rect').fill(" + params[5] 
                   + ").move(" + params[1] + "," + params[2] + ");";
        console.log("eval command = " + evalCmd);
        try {
          eval(evalCmd);
        } catch(err) {
          alert("Syntaxfehler, siehe Anleitung!");
        }
        return;

      case "createCircle":
        var params = args.substr(1, args.length - 2).split(",");  // remove brackets and split arguments
        if (!params || params.length == 0) return;
        console.log("params = " + params.toString());
        params[0] = unQuote(params[0]).trim() + "_obj";
        if (isNaN(params[1])) params[1] = 100;              // x position
        if (isNaN(params[2])) params[2] = 100;              // y position
        if (isNaN(params[3])) params[3] = 20;               // radius
        if (!params[4]) params[4] = "'white'";              // fill color         

        evalCmd = "SVG('drawing').circle(" + params[3] + ").attr('id','" + params[0]
                   + "').attr('stroke', 'black').attr('stroke-width', 5).attr('type', 'circle').fill(" + params[4] 
                   + ").move(" + params[1] + "," + params[2] + ");";
        console.log("eval command = " + evalCmd);
        try {
          eval(evalCmd);
        } catch(err) {
          alert("Syntaxfehler, siehe Anleitung!");
        }
        return;

      case "createLine":
        var params = args.substr(1, args.length - 2).split(",");  // remove brackets and split arguments
        if (!params || params.length == 0) return;
        console.log("params = " + params.toString());
        params[0] = unQuote(params[0]).trim() + "_obj";
        if (isNaN(params[1])) params[1] = 10;              // x position start
        if (isNaN(params[2])) params[2] = 10;              // y position start
        if (isNaN(params[3])) params[3] = 50;              // x position end
        if (isNaN(params[4])) params[4] = 50;              // y position end
        if (!params[5]) params[5] = "'black'";             // stroke color         

        evalCmd = "SVG('drawing').line(" + params[1] + "," + params[2] + "," + params[3] + "," + params[4] 
                   + ").attr('id','" + params[0] + "').attr('type', 'line')"
                   + ".attr('stroke'," + params[5] + ").attr('stroke-width', 5)";
        console.log("eval command = " + evalCmd);
        try {
          eval(evalCmd);
        } catch(err) {
          alert("Syntaxfehler, siehe Anleitung!");
        }
        return;

      case "createPolygon": 
        var params = args.substr(1, args.length - 2).match(new RegExp('".*?"', 'g'));  // remove brackets and split arguments
                                                            // we cannot use split() here, because of the comma-separated points list
        if (!params || params.length == 0) return;
        params.forEach(function(param, idx, arr) {arr[idx] = param.trim();});
        console.log("params = " + params.toString());
        params[0] = unQuote(params[0]).trim() + "_obj";
        if (!params[1]) params[1] = "'10,10 90,10 50,50'";  // x,y of all points
        if (!params[2]) params[2] = "'white'";              // fill color         

        evalCmd = "SVG('drawing').polygon(" + params[1] + ").attr('id','" + params[0]
                   + "').attr('stroke', 'black').attr('stroke-width', 5).attr('type', 'polygon').fill(" + params[2] 
                   + ");";
        console.log("eval command = " + evalCmd);
        try {
          eval(evalCmd);
        } catch(err) {
          alert("Syntaxfehler, siehe Anleitung!");
        }
        return;

        case "createGroup":
          groupId = args.substr(1, args.length - 2);
          if (!groupId) {
            alert("Syntaxfehler, createGroup needs an id as argument.")
            return;
          }
          evalCmd = "SVG('drawing').group().attr('id'," + groupId + ").attr('type', 'group')";
           console.log("eval command = " + evalCmd);
          try {
            eval(evalCmd);
          } catch(err) {
            alert("Syntaxfehler, siehe Anleitung!");
          }
          return;
    }

    // now create the command

    // replace special methods or attributes
    switch (elem) {
      case "move":
        elem = "dmove";
        break;
      case "fillcolor":
        elem = "fill";
        break;
      case "radius":
        elem = "r";
        break;
      case "x":
        elem = (objType == "circle" ? cx : elem);
        break;
      case "y":
        elem = (objType == "circle" ? cy : elem);
        break;
     }

    // check if object exists and get type
    var svgObj = SVG.get(obj);
    if (!svgObj) {
      svgObj = SVG.get(obj + "_obj");
      if (!svgObj) {
        alert("Objekt '" + obj + "' existiert nicht!");
        return;
      }
      obj += "_obj";
    }
    var objType = svgObj.attr("type");

    console.log("Object = " + obj + "; Type = " + objType);

    // grouped objects only allow for certain methods 
    if (objType == "group" && groupCommands.indexOf(elem) < 0) { // if not one of the allowed commands, use the _obj one
        obj += "_obj";
    } 

    if (attrval) {                                              // change attribute
      var cmd = ".attr('" + elem + "'," + attrval + ")";
    } else if (elem == "add" && objType == "group") { 
      var obj2Add = unQuote(args.substr(1, args.length - 2));   // add object to group and change id of added object
      obj2Add += obj2Add.endsWith("_obj") ? "" : "_obj";
      var cmd = ".add(SVG.get('" + obj2Add + "'))";
      cmd += ";SVG.get('" + obj2Add + "').attr('id','" + obj + "." + obj2Add + "')";
    }
    else {                                                      // other method call or request for attribute value
      if (args) {
        if (attrOnly.indexOf(elem) < 0) {                       // SVG only knows methods, so to simulate an attribute
          var cmd = "." + elem + args;                          //   we need to prevent usage as methode for those
        } else {
          alert("Syntaxfehler beim Setzen des Attributs '" + elem + "'");
          return;
        }
        
      } else {
        var cmd = ".attr('" + elem + "')";
      }
    }

    console.log("Command = " + cmd);

    try {
      var dbgAttrCheck = SVG.get(obj).attr();
      var evalCmd = "SVG.get('" + obj + "')" + cmd;
      if (showRes) evalCmd = "document.getElementById('results').innerHTML=" + evalCmd;
      console.log("eval command = " + evalCmd);

      eval(evalCmd);
    }
    catch (err) {
      alert("Syntaxfehler oder unbekannte Methode/Attribut!");
    }

  });
}

// Helper functions
function unQuote(str) {
  return str.replace(/^"(.*)"$/, '$1');
}

// button event callbacks
function toggleLabels() {
  if (SVG.get("Haus_label").visible()) {
    SVG.get("Haus_label").hide();
    SVG.get("Haus.Dach_label").hide();
    SVG.get("Haus.Wand_label").hide();
    SVG.get("Haus.Wand.Fenster_label").hide();
    SVG.get("Haus.Wand.Tuer_label").hide();
  } else {
    SVG.get("Haus_label").show();
    SVG.get("Haus.Dach_label").show();
    SVG.get("Haus.Wand_label").show();
    SVG.get("Haus.Wand.Fenster_label").show();
    SVG.get("Haus.Wand.Tuer_label").show();
  }
}