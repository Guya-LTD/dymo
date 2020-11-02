// playground requires you to assign document definition to a variable called dd
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
                        {text: 'A', style: 'service_icon_block', border: [false, false, true, true]},
                        // Row 1, Column 2
                        {
                            ul: [
                            {text: '0067821954743', style: 'delivery_address_detail', listType: 'none'},
                            {text: '19/02/2012', style: 'delivery_address_detail', listType: 'none'}
                          ], style: 'delivery_address_detail', margin: [10, -80], border: [false, false, false, true]},
                        // Row 1, Column 2
                        {qr: 'text', fit: '100', margin: [1, -10], border: [false, false, false, true]},
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
                        {text: 'ASMACH MAIL 7-DAY', style: 'service_icon_desc', border: [false, false, false, true]}
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
                            {text: 'Abeba Abeab', style: 'delivery_address_detail', listType: 'none'},
                            {text: '1000 Addis Ababa', style: 'delivery_address_detail', listType: 'none'},
                            {text: 'ETHIOPIA', style: 'delivery_address_detail', listType: 'none'}
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
                            {text: 'Abeba Abeab', style: 'delivery_address_detail', listType: 'none'},
                            {text: '1000 Addis Ababa', style: 'delivery_address_detail', listType: 'none'},
                            {text: 'ETHIOPIA', style: 'delivery_address_detail', listType: 'none'}
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
        widths: [ 150, 300, '*'],
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
            {text: 'TRK# 7946 6697 8391', style: 'tracking_number', border: [false, false, false, false]},
            // Row 2, Column 2
            {text: '', style: 'shipping_id_text', border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]}
          ],
          // Row 3
          [
            // Row 2, Column 1
            {text: '', border: [false, false, false, false]},
            // Row 2, Column 2
            {text: 'image', border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]} 
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
                        {text: 'CASH ON DELIVERY', style: 'service_icon_desc', border: [false, false, false, true]}
	                ]
	            ]
	        }
	    },
	],
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