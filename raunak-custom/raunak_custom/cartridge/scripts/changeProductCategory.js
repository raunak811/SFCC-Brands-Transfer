'use strict';

var Transaction = require('dw/system/Transaction');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var XMLStreamWriter = require('dw/io/XMLIndentingStreamWriter');
var Logger = require('dw/system/Logger');

/**
 * Crrating XML file In IMPEX folder
 * @param {products} product
 * @param {brand} Brandname
 */
function createXML(products, brand) {
    try{
        var impexFolder = File.IMPEX + File.SEPARATOR + "src/catalog/";
        var impexFolderCheck = new File(impexFolder);
        if (!impexFolderCheck.exists()) {
            impexFolderCheck.mkdirs();
        }

        // create export XML file for products
        // create new fileName for export XML file
        var fileNameProcessed = impexFolder + brand + '.xml';
        var targetFileProcessed = new File(fileNameProcessed);

        if (targetFileProcessed.exists()) {
            targetFileProcessed.remove();
        }
        targetFileProcessed.createNewFile();

        var fileWriter = new FileWriter(targetFileProcessed, "UTF-8");
        var xsw = new XMLStreamWriter(fileWriter);
        xsw.writeStartDocument();
            xsw.writeStartElement("catalog");
                xsw.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
                xsw.writeAttribute("catalog-id", "apparel-m-catalog");
                for(var i=0; i<products.length; i++) {
                    xsw.writeStartElement("product");
                        xsw.writeAttribute("product-id", products[i].ID);
                        xsw.writeStartElement("online-flag");
                            xsw.writeCharacters(products[i].online);
                        xsw.writeEndElement();
                        xsw.writeStartElement("available-flag");
                            xsw.writeCharacters(products[i].availabilityModel.isOrderable());
                        xsw.writeEndElement();
                        xsw.writeStartElement("brand");
                            xsw.writeCharacters(products[i].brand);
                        xsw.writeEndElement();
                    xsw.writeEndElement();
                    xsw.writeStartElement("category-assignment");
                        xsw.writeAttribute("category-id", "womens-accessories-scarves");
                        xsw.writeAttribute("product-id", products[i].ID);
                        xsw.writeStartElement("primary-flag");
                            xsw.writeCharacters(true);
                        xsw.writeEndElement();
                    xsw.writeEndElement();
                }
            xsw.writeEndElement();
        xsw.writeEndDocument();
        xsw.close();
        fileWriter.close();
    } catch (exception) {
        Logger.error("changeProductCategory.js : There was an error creating the xml file: {0}", exception.message);
    }
}

module.exports = {

    /**
* This function getting called when JOB runs
 * Crrating XML file In IMPEX folder
 * @param {params} Job Params
 */
    generateXML: function generateXML(params) {
        var Iterator = require('dw/util/Iterator');
        var productMgr = require('dw/catalog/ProductMgr');
        var products = productMgr.queryAllSiteProducts();
        var listProducts = products.asList();
        var result = listProducts.toArray().filter(function(product) {
            return product.brand === params.brandName;
        });
        createXML(result, params.brandName);
        products.close();
    }
}