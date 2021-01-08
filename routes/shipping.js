var express = require('express');
var router = express.Router();
var PdfPrinter = require('pdfmake');
const JsBarcode = require('jsbarcode');
const { Canvas } = require("canvas");

//var setTopMarginOfCellForVerticalCentering = require('../helpers/top_cell_margin');

const canvas = new Canvas();

const setTopMarginOfCellForVerticalCentering = (ri, node) => {
  const calcCellHeight = (cell, ci) => {
      if (cell._height !== undefined) {
          return cell._height;
      }
      let width = 0;
      for (let i = ci; i < ci + (cell.colSpan || 1); i++) {
          width += node.table.widths[i]._calcWidth;
      }
      let calcLines = (inlines) => {
          let tmpWidth = width;
          let lines = 1;
          inlines.forEach(inline => {
              tmpWidth = tmpWidth - inline.width;
              if (tmpWidth < 0) {
                  lines++;
                  tmpWidth = width - inline.width;
              }
          });
          return lines;
      };

      cell._height = 0;
      if (cell._inlines && cell._inlines.length) {
          let lines = calcLines(cell._inlines);
          cell._height = cell._inlines[0].height * lines;
      } else if (cell.stack && cell.stack[0] && cell.stack[0]._inlines[0]) {
          cell._height = cell.stack.map(item => {
              let lines = calcLines(item._inlines);
              return item._inlines[0].height * lines;
          }).reduce((prev, next) => prev + next);
      } else if (cell.table) {
          // TODO...
          console.log(cell);
      }

      cell._space = cell._height;
      if (cell.rowSpan) {
          for (let i = ri + 1; i < ri + (cell.rowSpan || 1); i++) {
              cell._space += Math.max(...calcAllCellHeights(i)) + padding * (i - ri) * 2;
          }
          return 0;
      }

      ci++;
      return cell._height;
  };
  const calcAllCellHeights = (rIndex) => {
      return node.table.body[rIndex].map((cell, ci) => {
          return calcCellHeight(cell, ci);
      });
  };

  calcAllCellHeights(ri);
  const maxRowHeights = {};
  node.table.body[ri].forEach(cell => {
      if (!maxRowHeights[cell.rowSpan] || maxRowHeights[cell.rowSpan] < cell._space) {
          maxRowHeights[cell.rowSpan] = cell._space;
      }
  });

  node.table.body[ri].forEach(cell => {
      if (cell.ignored) return;

      if (cell._rowSpanCurrentOffset) {
          cell._margin = [0, 0, 0, 0];
      } else {
          let topMargin = (maxRowHeights[cell.rowSpan] - cell._height) / 2;
          if (cell._margin) {
              cell._margin[1] += topMargin;
          } else {
              cell._margin = [0, topMargin, 0, 0];
          }
      }
  });

  return  -10
}

const fonts = {
  Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique'
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic'
    },
    Symbol: {
      normal: 'Symbol'
    },
    ZapfDingbats: {
      normal: 'ZapfDingbats'
    }
};

function PdfBinary(pdfDoc, callback) {
  var chunks = [];
  var result;
  
  var printer = new PdfPrinter(fonts);
  var doc = printer.createPdfKitDocument(pdfDoc);

  doc.on('data', function (chunk) {
  chunks.push(chunk);
});
doc.on('end', function () {
      result = Buffer.concat(chunks);
      callback(result)
  });
  
doc.end();
}


/* GET home page. */
router.post('/shippings', function(req, res, next) {
  eval(req.body.content);

  // Check the shippings body data
  //  1. Fitawrari
	//  2. Asmach
  //  3. Balambaras
  /*
   * Body Format :-
   * {
   *    plan: {
   *      id: 1,
   *      name: Fitawrari,
   *      icon: F
   *      description: Fitawrari MAIL 7-DAY
   *    },
   *    address: {
   *      from|to: {
   *        name: Chala,
   *        house: K. 03 W.7 house no 678
   *        postcode: 1000 Addis Ababa
   *        country: ETHIOPIA
   *      },
   *    },
   *    package: {
   *      weight: 10KG
   *      dimension: 2cm x 5cm x 7cm
   *      date: 19/02/2012,
   *      ...
   *    },
   *    qr: http://guya.com/track?id=34345,
   *    trk: 4455 33 63455,
   *    payment: CASH ON DELIVERY|ELECTRONIC PAYED|BANK PAYED
   * }
   * 
   */

  var ICON = req.body.plan.icon;
  var ICON_DESCRIPTION = req.body.plan.description;
  var LIST = [
    {text: req.body.package.weight, style: 'delivery_address_detail', listType: 'none'},
    {text: req.body.package.dimension, style: 'delivery_address_detail', listType: 'none'},
    {text: req.body.package.date, style: 'delivery_address_detail', listType: 'none'}
  ]
  var QR = req.body.qr;
  // Address
  var ADDRESS_FROM_NAME = req.body.address.from.name;
  var ADDRESS_FROM_HOUSE = req.body.address.from.house;
  var ADDRESS_FROM_POSTCODE = req.body.address.from.postcode;
  var ADDRESS_FROM_COUNTRY = req.body.address.from.country;

  var ADDRESS_TO_NAME = req.body.address.to.name;
  var ADDRESS_TO_HOUSE = req.body.address.to.house;
  var ADDRESS_TO_POSTCODE = req.body.address.to.postcode;
  var ADDRESS_TO_COUNTRY = req.body.address.to.country;

  // Tracking number
  var TRACKING_NUMBER = 'TRK# ' +  req.body.trk;

  // Payment
  var PAYMENT = req.body.payment;

  // Barcode
  JsBarcode(canvas, req.body.trk), {format: "CODE39"};

  var dd = {
    pageSize: {
        width: 300,
        height: 'auto'
      },
    pageMargins: [ 0, 0, 2, 2 ],
    watermark: { text: 'Guya', color: 'gray', opacity: 0.2, bold: true, italics: false, fontSize: 100, angle: -60 },
	content: [
	    {
	        layout: { paddingBottom: setTopMarginOfCellForVerticalCentering, paddingTop: setTopMarginOfCellForVerticalCentering },
	        table: {
	            // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [ 70, '*', 85],
                //widths:[200, 199],
                heights: [10, 'auto'],
	            body: [
	                // border = [left, top, right, bottom]
	                // Row 1
	                [
	                    // Row 1, Column 1
	                    //  1. Fitawrari
	                    //  2. Asmach
	                    //  3. Balambaras
                        {text: ICON, margin: [0, 20, 0, 0], style: 'service_icon_block', border: [false, false, true, true]},
                        // Row 1, Column 2
                        {
                          ul: LIST, style: 'delivery_address_detail', margin: [10, -40], border: [false, false, false, true]
                        },
                        // Row 1, Column 2
                        {qr: QR, fit: '95', margin: [1, 5, 0, 0], border: [false, false, false, true]},
	                ]
	            ]
	        }
	    },
	    {
	        //layout: { paddingBottom: setTopMarginOfCellForVerticalCentering, paddingTop: setTopMarginOfCellForVerticalCentering },
	        table: {
	            // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*'],
                //widths:[200, 199],
                heights: ['auto'],
	            body: [
	                // border = [left, top, right, bottom]
	                // Row 1
	                [
	                    // Row 1, Column 1
                        {text: ICON_DESCRIPTION, style: 'service_icon_desc', border: [false, false, false, true]}
	                ]
	            ]
	        }
	    },
	    {
	        table: {
	            // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*'],
                //widths:[200, 199],
                heights: [70],
	            body: [
	                // border = [left, top, right, bottom]
	                // Row 1
	                [
	                    // Row 1, Column 1
                        {
                          ul: [
                            {text: 'SHIP FROM:', style: 'delivery_address_title', listType: 'none'},
                            {text: ADDRESS_FROM_NAME, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_FROM_HOUSE, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_FROM_POSTCODE, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_FROM_COUNTRY, style: 'delivery_address_detail', listType: 'none'}
                          ],
                          border: [false, false, false, false]
                        },
	                ],
	                // Row 2
	                [
	                    // Row 2, Column 1
                        {
                          ul: [
                            {text: 'SHIP TO:', style: 'delivery_address_title', listType: 'none'},
                            {text: ADDRESS_TO_NAME, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_TO_HOUSE, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_TO_POSTCODE, style: 'delivery_address_detail', listType: 'none'},
                            {text: ADDRESS_TO_COUNTRY, style: 'delivery_address_detail', listType: 'none'}
                          ],
                          border: [false, false, false, false]
                        },
	                ],
	                // Row 3
	                [
	                    {text: ' \n\n', border: [false, false, false, true]}    
	                ]
	            ]
	        }
	    },
	    {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [ 150, 200, '*'],
        //widths:[200, 199],
		heights: [10, 'auto'],
        
        body: [
          // border = [left, top, right, bottom]
          // Row 1
          [
            {text: '', border: [false, true, false, false]},
            {text: '', border: [false, true, false, false]},
            {text: '', border: [false, true, true, false]}
          ],
          // Row 2
          [
            // Row 2, Column 1
            {text: TRACKING_NUMBER, style: 'tracking_number', border: [false, false, false, false]},
            // Row 2, Column 2
            {text: '', style: 'shipping_id_text', border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]}
          ],
          // Row 3
          [
            // Row 2, Column 1
            //{text: '', border: [false, false, false, false]},
            // Row 2, Column 2
            {image: canvas.toDataURL(), width: 200, height: 120,  margin: [50, 0], border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]},
            {text: '', border: [false, false, false, false]},
          ],
          // Row 4
          [
            // Row 4, Column 1
            {text: ' \n', border: [false, false, false, true]},
            // Row 2, Column 2
            {text: ' \n', border: [false, false, false, true]},
            // Row 2, Column 3
            // Box closing
            {text: ' \n', border: [false, false, true, true]} 
          ]
        ],
      }
    },
    {
	        //layout: { paddingBottom: setTopMarginOfCellForVerticalCentering, paddingTop: setTopMarginOfCellForVerticalCentering },
	        table: {
	            // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*'],
                //widths:[200, 199],
                heights: ['auto'],
	            body: [
	                // border = [left, top, right, bottom]
	                // Row 1
	                [
	                    // Row 1, Column 1
                        {text: PAYMENT, style: 'service_icon_desc', border: [false, false, false, true]}
	                ]
	            ]
	        }
	    },
  ],
  defaultStyle: {
    font: 'Helvetica'
  },
	styles: {
	    service_icon_block: {
	        fontSize: 90,
	        bold: true,
	        alignment: 'left'
	    },
	    service_icon_desc: {
	        fontSize: 20,
	        bold: true,
	        alignment: 'center'
	    },
	    shipping_id_text: {
    	   fontSize: 18,
    	   bold: true,
    	   alignment: 'center',
    	   lineHeight: 1
    	 },
    	 tracking_number: {
    	   fontSize: 14,
    	   bold: true,
    	   lineHeight: 1
    	 },
    	 delivery_address_title: {
    	  fontSize: 12,
    	  bold: true,
    	  alignment: 'left',
    	  lineHeight: 1
    	 },
    	 delivery_address_detail: {
    	   fontSize: 9,
    	   bold: false,
    	 },
	}
}

  
  // Create the pdf file
  PdfBinary(dd, function (binary) {
    res.status(201);
    res.contentType('application/pdf');
		res.end(binary)
	}, function (error) {
    res.status(500);
		res.send('ERROR:' + error);
	});
});

module.exports = router;
