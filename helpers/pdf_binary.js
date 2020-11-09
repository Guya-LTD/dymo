var PdfPrinter = require('pdfmake');

function PdfBinary() {
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