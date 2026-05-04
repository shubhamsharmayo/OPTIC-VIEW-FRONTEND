const calculateTotalRow = (startRow, endRow, stepInRow) => {
  let totalRow = [];
  if (stepInRow === "") {
    return 0;
  }

  for (let i = +startRow; i <= +endRow; i += +stepInRow) {
    totalRow.push(i);
  }

  return totalRow.length;
};

export { calculateTotalRow };
