// playground requires you to assign document definition to a variable called dd
/*const setTopMarginOfCellForVerticalCentering = (ri, node) => {
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

    return  1
}*/

const setTopMarginOfCellForVerticalCentering = (ri, node) => {
  const cellHeights = node.table.body[ri].map(cell => {
    if(cell._inlines && cell._inlines.length) {
      return cell._inlines[0].height
    } else if(cell.stack) {
      return cell.stack[0]._inlines[0].height * cell.stack.length
    }
    return null
  })

  const maxRowHeight = Math.max(...cellHeights)
  node.table.body[ri].forEach((cell, ci) => {
    if(cellHeights[ci] && maxRowHeight > cellHeights[ci]) {
      let topMargin = (maxRowHeight - cellHeights[ci]) / 2
      if(cell._margin) {
        cell._margin[1] = topMargin
      } else {
        cell._margin = [0, topMargin, 0, 0]
      }
    }
  })

  return 6
}



var dd = {
    pageSize: 'A5',
    pageOrientation: 'landscape',
    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [ 2, 2, 2, 2 ],
	content: [
    {
      //layout: 'lightHorizontalLines', // optional
      layout: { paddingTop: setTopMarginOfCellForVerticalCentering },
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [ '*', '*', '*', 0 ],
        //widths:[200, 199],
		    heights: [20, 'auto', 'auto'],

        body: [
          // border = [left, top, right, bottom]
          // Row 1
          [ 
            // Row 1, Column 1
            {text: 'FBG', style: 'service_icon_block', border: [true, true, false, true]},
            // Row 1, Column 2
            {text: '', border: [false, true, false, true]},
            // Row 1, Column 3
            {text: '', border: [false, true, false, true]},
            // Row 1, Column 4
            // Box closing
            {text: '', border: [false, true, true, true]}
          ],
          // Row 2
          [
            // Row 2, Column 1
            {text: 'SHIP FROM:', style: 'delivery_address_title', border: [true, true, false, false]},
            // Row 2, Column 2
            {text: 'SHIP TO:', style: 'delivery_address_title', border: [false, true, true, true]},
            // Row 2, Column 3
            {text: '', style: 'delivery_address_title', border: [true, true, false, true]},
            // Row 2, Column 4
            // Box Closing
            {text: '', border: [false, true, true, false]}
          ],
          // Row 3
          [
            // Row 3, Column 1
            {
              ul: [
                {text: 'Abeba Abeab', style: 'delivery_address_detail', listType: 'none'},
                {text: '1000 Addis Ababa', style: 'delivery_address_detail', listType: 'none'},
                {text: 'ETHIOPIA', style: 'delivery_address_detail', listType: 'none'}
              ],
              border: [true, true, true, false]
            },
            // Row 3, Column 2
            {
              ul: [
                {text: 'Abeba Abeab', style: 'delivery_address_detail', listType: 'none'},
                {text: '1000 Addis Ababa', style: 'delivery_address_detail', listType: 'none'},
                {text: 'ETHIOPIA', style: 'delivery_address_detail', listType: 'none'}
              ],
              border: [true, true, true, false]
            },
            // Row 3, Column 3
            {
              ul: [
                {text: 'SHIP DATE: 19-02-2012', style: 'delivery_address_detail', listType: 'none'}
              ],
              border: [true, true, false, false]
            },
            // Row 3, Column 4
            // Box closing
            {text: '', border: [false, false, true, false]}
          ],
          // Row 4
          [
            {text: '', border: [true, false, false, true]}, 
            {text: '', border: [true, false, false, true]},
            {text: '', border: [true, false, false, true]},
            {text: '', border: [false, false, true, true]},
          ]
        ]
      }
    },
    {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [ 'auto', 300, '*'],
        //widths:[200, 199],
		heights: [10, 'auto'],
        
        body: [
          // border = [left, top, right, bottom]
          // Row 1
          [
            {text: '', border: [true, true, false, false]},
            {text: '', border: [false, true, false, false]},
            {text: '', border: [false, true, true, false]}
          ],
          // Row 2
          [
            // Row 2, Column 1
            {text: 'TRK# 7946 6697 8391', style: 'tracking_number', border: [true, false, false, false]},
            // Row 2, Column 2
            {text: 'Shipment ID', style: 'shipping_id_text', border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]}
          ],
          // Row 3
          [
            // Row 2, Column 1
            {text: '', border: [true, false, false, false]},
            // Row 2, Column 2
            {text: 'image', border: [false, false, false, false]},
            // Row 2, Column 3
            // Box closing
            {text: '', border: [false, false, true, false]} 
          ]
        ],
      }
    },
    {
     table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [170, 472],
        //widths:[200, 199],
		heights: [30, 'auto'],
        
        body: [
          // border = [left, top, right, bottom]
          // Row 1
          [
            {text: '', border: [true, false, false, false]},
            {text: '', border: [false, false, true, false]}
          ],
          [
            {text: 'Internal Use Only', style: 'internal_use_only', border: [true, true, false, true]},
            {text: '', style: 'internal_use_only', border: [false, true, true, true]}
          ],
          [
            {text: '', border: [true, true, false, true]},
            {text: 'PLEASE LEAVE THIS LABEL UNCOVERED', border: [false, true, true, true]}
          ]
        ],
      } 
    }
  ],
  styles: {
    service_icon_block: {
      fontSize: 28,
	   bold: true,
	   alignment: 'left'
	 },
	 delivery_address_title: {
	  fontSize: 12,
	  bold: true,
	  alignment: 'left',
	  lineHeight: 1
	 },
	 delivery_address_detail: {
	   //fontSize: 12,
	   bold: false,
	   alignment: 'left',
	   lineHeight: 1.6
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
	 internal_use_only: {
	   bold: true,
	   color: 'white',
	   fillColor: 'black' 
	 }
  }
};