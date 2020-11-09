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

export default setTopMarginOfCellForVerticalCentering;