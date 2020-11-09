const setTopMarginOfCellForVerticalCenteringLarge = (ri, node) => {
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
}

export default setTopMarginOfCellForVerticalCenteringLarge;